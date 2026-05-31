import {type ReactNode, useReducer} from 'react'
import {differenceInMinutes, isBefore} from 'date-fns'
import {type Stage} from '../utils/stageUtils'
import {initialState, MeetingContext, reducer} from "./MeetingContext.types.ts";

export const MeetingProvider = ({children}: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

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
                        errors.push('Meeting start and end times are required')
                    } else if (isBefore(state.endTime, state.startTime)) {
                        errors.push('Meeting end time must be after start time')
                    }

                    if (state.stages.length === 0) {
                        errors.push('At least one stage is required')
                    }

                    const invalidStages = state.stages.filter(stage => stage.duration <= 0)
                    if (invalidStages.length > 0) {
                        errors.push('All stage durations must be positive numbers')
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

export type {Stage}