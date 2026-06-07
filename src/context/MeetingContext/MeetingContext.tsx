import {type ReactNode, useEffect, useReducer, useRef} from 'react'
import {differenceInMinutes, format, isBefore} from 'date-fns'
import {type Stage} from '../../utils/stageUtils.ts'
import {initialState, MeetingContext, type MeetingState} from "./MeetingContext.types.ts";
import {reducer} from "./reducer.ts";
import {useTranslation} from "react-i18next";

const makeStateFromHash = (hash: string): MeetingState | undefined => {
    const urlParams = new URLSearchParams(hash.substring(2)) // Remove '#?'
    const startTimeStr = urlParams.get('s')
    const endTimeStr = urlParams.get('e')

    if (!startTimeStr || !endTimeStr) return

    // Parse time strings in HH:mm format and create Date objects for today
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number)
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number)

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        return
    }

    const today = new Date()
    const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHours,
        startMinutes
    )
    const endTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        endHours,
        endMinutes
    )

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return

    // If end time is before start time, assume it's on the next day
    if (isBefore(endTime, startTime)) {
        endTime.setDate(endTime.getDate() + 1)
    }

    // Parse stages from n and d parameters
    const stages: Stage[] = []
    let index = 0
    while (true) {
        const nameParam = `n${index}`
        const durationParam = `d${index}`

        const nameValue = urlParams.get(nameParam)
        const durationValue = urlParams.get(durationParam)

        if (nameValue === null || durationValue === null) {
            break // No more stages
        }

        const duration = parseInt(durationValue)
        if (!isNaN(duration) && duration > 0) {
            stages.push({
                name: decodeURIComponent(nameValue),
                duration: duration,
                plannedStartTime: null,
                actualStartTime: null,
                actualEndTime: null,
                displayedStartTime: null
            })
        }

        index++
    }

    // Create new state from URL
    return {
        startTime: startTime,
        endTime: endTime,
        stages: stages,
        currentStageIndex: -1,
        meetingStatus: 'not_started',
        lastUpdateTime: null,
        bufferPlannedLength: null,
        bufferLength: null
    };
}

export const MeetingProvider = ({children}: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const hasRestoredFromUrl = useRef(false)

    const {t} = useTranslation();

    // Restore state from URL on initial load
    useEffect(() => {
        const restoreFromUrl = () => {
            const hash = window.location.hash
            if (!hash || !hash.startsWith('#?')) return

            try {
                const newState: MeetingState | undefined = makeStateFromHash(hash);

                if (!newState) return

                dispatch({type: 'RESET_STATE', payload: newState})

                // Mark that we've restored from URL
                hasRestoredFromUrl.current = true
            } catch {
                // Ignore malformed URL fragments
                hasRestoredFromUrl.current = true
            }
        }

        // Only restore on initial load, not when state changes
        restoreFromUrl()

        // Also listen for hash changes to restore from URL
        const handleHashChange = () => {
            hasRestoredFromUrl.current = false
            restoreFromUrl()
        }

        window.addEventListener('hashchange', handleHashChange)

        return () => {
            window.removeEventListener('hashchange', handleHashChange)
        }
    }, [])

    // Save state to URL when state changes
    useEffect(() => {
        const saveToUrl = () => {
            if (!state.startTime || !state.endTime) return

            const params = new URLSearchParams()
            params.set('s', format(state.startTime, 'HH:mm'))
            params.set('e', format(state.endTime, 'HH:mm'))

            // Save stages as individual n and d parameters for shorter URLs
            state.stages.forEach((stage, index) => {
                params.set(`n${index}`, encodeURIComponent(stage.name))
                params.set(`d${index}`, stage.duration.toString())
            })

            window.history.replaceState(null, '', `#?${params.toString()}`)
        }

        // Throttle the URL updates to avoid excessive writes
        const timeoutId = setTimeout(saveToUrl, 100)

        return () => clearTimeout(timeoutId)
    }, [state.startTime, state.endTime, state.stages])

    const calculateTimeRemaining = () => {
        if (!state.startTime || !state.endTime) {
            return {stageRemaining: 0, totalRemaining: 0}
        }

        const now = new Date()

        if (state.meetingStatus === 'not_started') {
            // Calculate time until meeting starts and ends
            const timeUntilStart = state.startTime.getTime() - now.getTime()
            const timeUntilEnd = state.endTime.getTime() - now.getTime()
            // Convert to seconds
            return {stageRemaining: timeUntilStart / 1000, totalRemaining: timeUntilEnd / 1000}
        }

        const totalRemaining = (state.endTime.getTime() - now.getTime()) / 1000

        // Calculate stage time remaining
        let stageRemaining = totalRemaining;
        if (state.currentStageIndex < state.stages.length - 1) {
            const nextStage = state.stages[state.currentStageIndex + 1];
            stageRemaining = (nextStage.plannedStartTime!.getTime() - now.getTime()) / 1000;
        }

        return {stageRemaining, totalRemaining}
    }

    return (
        <MeetingContext.Provider
            value={{
                state,
                dispatch,
                calculateTimeRemaining,
                calculateStageTimeRemaining: calculateTimeRemaining,
                validateMeeting: () => {
                    const errors: string[] = []

                    if (!state.startTime || !state.endTime) {
                        errors.push(t('validation.startEndRequired'))
                    } else if (isBefore(state.endTime, state.startTime)) {
                        errors.push(t('validation.endTimeBeforeStartTime'))
                    }

                    if (state.stages.length === 0) {
                        errors.push(t('validation.oneStageRequired'))
                    }

                    const invalidStages = state.stages.filter(stage => stage.duration <= 0)
                    if (invalidStages.length > 0) {
                        errors.push(t('validation.positive'))
                    }

                    return {isValid: errors.length === 0, errors}
                },
                getTotalStageDuration: () => {
                    return state.stages.reduce((sum, stage) => sum + stage.duration, 0)
                },
                getMeetingDuration: () => {
                    if (!state.startTime || !state.endTime) return 0
                    return differenceInMinutes(state.endTime, state.startTime)
                },
            }}
        >
            {children}
        </MeetingContext.Provider>
    )
}
