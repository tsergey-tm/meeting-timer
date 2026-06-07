import type {MeetingState} from "./MeetingContext.types.ts";

export const calculatePlannedStageTimes = (state: MeetingState): MeetingState => {
    if (state.startTime === null || state.stages.length < 1) return state

    const newPlannedStartTimes: Array<Date> = new Array<Date>(state.stages.length);
    const newPlannedEndTimes: Array<Date> = new Array<Date>(state.stages.length);
    const displayedStartTime = new Array<Date | null>(state.stages.length);

    newPlannedStartTimes[0] = state.startTime;
    displayedStartTime[0] = state.startTime;
    let plannedStartTime = new Date(state.startTime.getTime() + state.stages[0].durationMins * 60_000);
    newPlannedEndTimes[0] = plannedStartTime;

    for (let i = 1; i < state.stages.length; i++) {
        newPlannedStartTimes[i] = plannedStartTime;
        displayedStartTime[i] = plannedStartTime;
        plannedStartTime = new Date(plannedStartTime.getTime() + state.stages[i].durationMins * 60_000);
        newPlannedEndTimes[i] = plannedStartTime;
    }

    return {
        ...state,
        plannedStartTimes: newPlannedStartTimes,
        plannedEndTimes: newPlannedEndTimes,
        displayedStartTime: displayedStartTime,
        bufferPlannedLength: state.endTime ? (state.endTime.getTime() - newPlannedEndTimes.at(-1)!.getTime()) / 1000 : null
    }
}

export function calculateDisplayedStageTimes(state: MeetingState): MeetingState {

    if (state.startTime === null || state.stages.length < 1) {
        return state;
    }

    const now = new Date();

    let calculatedStartTime: Date;

    // First: we need calculate start time for first stage
    if (state.currentStageIndex < 0) {
        // Not started
        if (state.startTime < now) {
            // We were late starting the meeting
            calculatedStartTime = now;
        } else {
            // It's not time to start yet.
            calculatedStartTime = state.startTime;
        }
    } else {
        // The meeting has started
        // Get actual start time for first stage from the array, or default to new Date()
        calculatedStartTime = (state.actualStartTimes && state.actualStartTimes[0]) || now;
    }


    // Initialize displayedStartTime array
    const newDisplayedStartTime: Array<Date | null> = new Array<Date | null>(state.stages.length);

    newDisplayedStartTime[0] = calculatedStartTime;
    calculatedStartTime = new Date(calculatedStartTime.getTime() + state.stages[0].durationMins * 60_000);

    for (let i = 1; i < state.stages.length; i++) {
        // If stage has actual start time - use it
        if (state.actualStartTimes[i]) {
            calculatedStartTime = state.actualStartTimes[i]!;
        }
        newDisplayedStartTime[i] = calculatedStartTime;
        calculatedStartTime = new Date(calculatedStartTime.getTime() + state.stages[i].durationMins * 60_000);
    }

    return {
        ...state,
        displayedStartTime: newDisplayedStartTime,
        bufferLength: state.endTime ? (state.endTime.getTime() - calculatedStartTime.getTime()) / 1000 : null
    }
}

