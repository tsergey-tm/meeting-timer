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

const dateMax = (dates: Date[]): Date => {

    let res: Date = dates[0];
    for (let i = 1; i < dates.length; i++) {
        if (res < dates[i]) {
            res = dates[i];
        }
    }
    return res;
}

export function calculateDisplayedStageTimes(state: MeetingState): MeetingState {

    if (state.startTime === null || state.stages.length < 1) {
        return state;
    }

    const now = new Date();

    let calculatedStartTime: Date = dateMax([state.startTime, now]);

    // Initialize displayedStartTime array
    const newDisplayedStartTime: Array<Date | null> = new Array<Date | null>(state.stages.length);

    for (let i = 0; i < state.stages.length; i++) {

        if (i < state.currentStageIndex) {
            // Before current
            newDisplayedStartTime[i] = state.actualStartTimes[i]!;
            calculatedStartTime = state.actualEndTimes[i]!;
        } else if (i === state.currentStageIndex) {
            // Current
            newDisplayedStartTime[i] = state.actualStartTimes[i]!;
            calculatedStartTime = dateMax([
                new Date(newDisplayedStartTime[i]!.getTime() + state.stages[i].durationMins * 60_000),
                now
            ]);
        } else {
            // After current
            newDisplayedStartTime[i] = dateMax([calculatedStartTime, state.plannedStartTimes[i]]);
            calculatedStartTime = new Date(newDisplayedStartTime[i]!.getTime() + state.stages[i].durationMins * 60_000);
        }
    }

    return {
        ...state,
        displayedStartTime: newDisplayedStartTime,
        bufferLength: state.endTime ? (state.endTime.getTime() - calculatedStartTime.getTime()) / 1000 : null
    }
}

