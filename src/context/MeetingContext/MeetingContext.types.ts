import {createContext} from "react";

export type Stage = {
    name: string
    duration: number // in minutes
    plannedStartTime: Date | null
    actualStartTime: Date | null
    actualEndTime: Date | null
    displayedStartTime: Date | null
}

export type MeetingState = {
    startTime: Date | null
    endTime: Date | null
    stages: Stage[]
    bufferPlannedLength: number | null
    bufferLength: number | null
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
    bufferPlannedLength: null,
    bufferLength: null,
    currentStageIndex: -1,
    meetingStatus: 'not_started',
    lastUpdateTime: null,
}

export const MeetingContext = createContext<MeetingContextType | undefined>(undefined)
