import {calculateDisplayedStageTimes, calculatePlannedStageTimes, type Stage} from "../utils/stageUtils.ts";
import {createContext} from "react";

export type MeetingState = {
    startTime: Date | null
    endTime: Date | null
    stages: Stage[]
    currentStageIndex: number
    meetingStatus: 'not_started' | 'in_progress' | 'completed'
    lastUpdateTime: Date | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export type MeetingContextType = {
    state: MeetingState
    dispatch: (action: Action) => void
    calculateTimeRemaining: () => { stageRemaining: number; totalRemaining: number }
    calculateStageTimeRemaining: () => { stageRemaining: number; totalRemaining: number }
    validateMeeting: () => { isValid: boolean; errors: string[] }
    getTotalStageDuration: () => number
    getMeetingDuration: () => number
}

export type Action =
    | { type: 'SET_START_TIME'; payload: Date }
    | { type: 'SET_END_TIME'; payload: Date }
    | { type: 'ADD_STAGE'; payload: Stage }
    | { type: 'UPDATE_STAGE'; payload: { index: number; duration: number; name?: string } }
    | { type: 'REMOVE_STAGE'; payload: number }
    | { type: 'RESET_STATE'; payload: MeetingState }
    | { type: 'MARK_STAGE_COMPLETED'; payload: number }
    | { type: 'START_MEETING' }
    | { type: 'UPDATE_STAGES_DISPLAYED_TIMES'; payload: Stage[] }

export const initialState: MeetingState = {
    startTime: null,
    endTime: null,
    stages: [],
    currentStageIndex: -1,
    meetingStatus: 'not_started',
    lastUpdateTime: null,
}

export function reducer(state: MeetingState, action: Action): MeetingState {

    const now = new Date();

    switch (action.type) {
        case 'SET_START_TIME': {
            const newStartTime = action.payload
            const updatedStages = calculatePlannedStageTimes(state.stages, newStartTime)
            return {
                ...state,
                startTime: newStartTime,
                stages: updatedStages,
                meetingStatus: 'not_started'
            }
        }

        case 'SET_END_TIME':
            return {...state, endTime: action.payload, meetingStatus: 'not_started'}

        case 'ADD_STAGE': {
            const newStage = action.payload
            const updatedStages = calculatePlannedStageTimes([...state.stages, newStage], state.startTime || now)
            return {
                ...state,
                stages: updatedStages,
                meetingStatus: 'not_started'
            }
        }

        case 'UPDATE_STAGE': {
            const updatedStages = [...state.stages];
            updatedStages[action.payload.index] = {
                ...updatedStages[action.payload.index],
                duration: action.payload.duration,
                ...(action.payload.name !== undefined && {name: action.payload.name})
            };

            const finalStages = calculatePlannedStageTimes(updatedStages, state.startTime || now)
            return {
                ...state,
                stages: finalStages,
                meetingStatus: 'not_started'
            }
        }

        case 'REMOVE_STAGE':
            return {
                ...state,
                stages: state.stages.filter((_, index) => index !== action.payload),
                meetingStatus: 'not_started'
            }

        case 'MARK_STAGE_COMPLETED': {
            const newState = {...state}
            newState.stages[newState.currentStageIndex].actualEndTime = now
            const newCurrentStageIndex = action.payload + 1
            if (newCurrentStageIndex < newState.stages.length) {
                newState.stages[newCurrentStageIndex].actualStartTime = now
            }

            return calculateDisplayedStageTimes({
                ...newState,
                currentStageIndex: newCurrentStageIndex,
                meetingStatus: newCurrentStageIndex >= newState.stages.length ? 'completed' : 'in_progress'
            })
        }

        case 'START_MEETING': {
            const updatedStages = [...state.stages];

            updatedStages[0] = {
                ...updatedStages[0],
                actualStartTime: now
            };

            return calculateDisplayedStageTimes({
                ...state,
                meetingStatus: 'in_progress',
                lastUpdateTime: now,
                currentStageIndex: 0,
                stages: updatedStages
            })
        }

        case 'UPDATE_STAGES_DISPLAYED_TIMES':
            return calculateDisplayedStageTimes(state);

        case 'RESET_STATE':
            return calculateDisplayedStageTimes({
                ...action.payload,
                stages: calculatePlannedStageTimes(action.payload.stages, action.payload.startTime || now)
            });

        default:
            return state
    }
}

export const MeetingContext = createContext<MeetingContextType | undefined>(undefined)
