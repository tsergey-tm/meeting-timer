import type {MeetingState} from "./MeetingContext.types.ts";

export const calculatePlannedStageTimes = (state: MeetingState): MeetingState => {
    if (state.startTime === null || state.stages.length < 1) return state

    // Initialize plannedStartTimes array with correct length
    let plannedStartTimes = Array(state.stages.length).fill(null);

    // If we have existing plannedStartTimes, use them as base but ensure proper length
    if (state.plannedStartTimes && state.plannedStartTimes.length > 0) {
        plannedStartTimes = [...state.plannedStartTimes];
        while (plannedStartTimes.length < state.stages.length) {
            plannedStartTimes.push(null);
        }
    }

    const newPlannedStartTimes: Array<Date> = plannedStartTimes.map((_, index) => {
        const previousStagesDuration = state.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
        return new Date(state.startTime!.getTime() + previousStagesDuration * 60_000)
    });

    const stages = state.stages.map((stage) => {
        return {
            ...stage
        }
    });

    // Set displayedStartTime in the MeetingState array
    const displayedStartTime = new Array<Date | null>(state.stages.length);
    for (let i = 0; i < state.stages.length; i++) {
        displayedStartTime[i] = newPlannedStartTimes[i];
    }

    const plannedEndTime = newPlannedStartTimes[newPlannedStartTimes.length - 1]?.getTime() + stages[stages.length - 1].duration * 60_000;

    return {
        ...state,
        stages: stages,
        plannedStartTimes: newPlannedStartTimes,
        displayedStartTime: displayedStartTime,
        bufferPlannedLength: state.endTime ? (state.endTime.getTime() - plannedEndTime) / 1000 : null
    }
}

export function calculateDisplayedStageTimes(state: MeetingState): MeetingState {

    if (state.startTime === null || state.stages.length < 1) {
        return state;
    }

    const stages = [...state.stages];

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


    // Initialize displayedStartTime array if not exists
    const displayedStartTime = state.displayedStartTime ? [...state.displayedStartTime] : new Array<Date | null>(state.stages.length);

    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        // Check if this stage has an actual start time in the array
        const actualStartTime = (state.actualStartTimes && state.actualStartTimes[i]) || null;
        if (actualStartTime === null) {
            // Stage not started: use calculated start time
            displayedStartTime[i] = new Date(
                Math.max(
                    now.getTime(),
                    calculatedStartTime.getTime(),
                    (state.plannedStartTimes && state.plannedStartTimes[i] && state.plannedStartTimes[i] !== null) ? state.plannedStartTimes[i].getTime() : calculatedStartTime.getTime()
                )
            );
            calculatedStartTime = new Date(displayedStartTime[i]!.getTime() + stage.duration * 60_000);
        } else {
            // Stage started: overwrite calculated start time by actual start time
            displayedStartTime[i] = actualStartTime;
            /*if (stage.actualEndTimes === null) {
                calculatedStartTime = new Date(actualStartTime.getTime() + stage.duration * 60_000);
            } else {
                calculatedStartTime = stage.actualEndTimes;
            }*/
        }
    }

    const calculatedEndTime = displayedStartTime[displayedStartTime.length - 1]!.getTime() + stages[stages.length - 1].duration * 60_000;

    return {
        ...state,
        stages: stages,
        displayedStartTime: displayedStartTime,
        bufferLength: state.endTime ? (state.endTime.getTime() - calculatedEndTime) / 1000 : null
    }
}

