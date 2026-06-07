import type {MeetingState} from "./MeetingContext.types.ts";

export type Stage = {
    name: string
    duration: number // in minutes
    plannedStartTime: Date | null
    actualStartTime: Date | null
    actualEndTime: Date | null
    displayedStartTime: Date | null
}

export const calculatePlannedStageTimes = (state: MeetingState): MeetingState => {
    if (state.startTime === null || state.stages.length < 1) return state

    const stages = state.stages.map((stage, index) => {
        const previousStagesDuration = state.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
        const plannedStartTime = new Date(state.startTime!.getTime() + previousStagesDuration * 60_000)

        return {
            ...stage,
            plannedStartTime: plannedStartTime,
            displayedStartTime: plannedStartTime
        }
    });

    const plannedEndTime = stages.at(-1)!.plannedStartTime.getTime() + stages.at(-1)!.duration * 60_000;

    return {
        ...state,
        stages: stages,
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
        calculatedStartTime = stages[0].actualStartTime!;
    }


    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        if (stage.actualStartTime === null) {
            // Stage not started: use calculated start time
            stage.displayedStartTime = new Date(
                Math.max(
                    now.getTime(),
                    calculatedStartTime.getTime(),
                    stage.plannedStartTime ? stage.plannedStartTime.getTime() : calculatedStartTime.getTime()
                )
            );
            calculatedStartTime = new Date(stage.displayedStartTime.getTime() + stage.duration * 60_000);
        } else {
            // Stage started: overwrite calculated start time by actual start time
            stage.displayedStartTime = stage.actualStartTime;
            if (stage.actualEndTime === null) {
                calculatedStartTime = new Date(stage.actualStartTime.getTime() + stage.duration * 60_000);
            } else {
                calculatedStartTime = stage.actualEndTime;
            }
        }
    }

    const calculatedEndTime = stages.at(-1)!.displayedStartTime!.getTime() + stages.at(-1)!.duration * 60_000;

    return {
        ...state,
        stages: stages,
        bufferLength: state.endTime ? (state.endTime.getTime() - calculatedEndTime) / 1000 : null
    }
}

