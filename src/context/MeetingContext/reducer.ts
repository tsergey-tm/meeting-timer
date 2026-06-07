import {calculateDisplayedStageTimes, calculatePlannedStageTimes} from "./stageUtils.ts";
import type {Action, MeetingState} from "./MeetingContext.types.ts";
import {timeDiffInMins} from "../../utils/timeUtils.ts";

const resetState = (state: MeetingState): MeetingState => {
    return calculatePlannedStageTimes({
        ...state,
        plannedStartTimes: [],
        actualStartTimes: new Array<Date | null>(state.stages.length),
        actualEndTimes: new Array<Date | null>(state.stages.length),
        actualDurationMins: new Array<number>(state.stages.length),
        meetingStatus: 'not_started',
        currentStageIndex: -1
    });
}

export const reducer = (state: MeetingState, action: Action): MeetingState => {

    const now = new Date();

    switch (action.type) {
        case 'SET_START_TIME': {
            return resetState({
                ...state,
                startTime: action.payload
            })
        }

        case 'SET_END_TIME':
            return resetState({
                ...state,
                endTime: action.payload,
            })

        case 'ADD_STAGE': {
            return resetState({
                ...state,
                stages: [...state.stages, action.payload],
            })
        }

        case 'UPDATE_STAGE': {
            const updatedStages = [...state.stages];
            updatedStages[action.payload.index] = {
                ...updatedStages[action.payload.index],
                durationMins: action.payload.durationMins,
                ...(action.payload.name !== undefined && {name: action.payload.name})
            };

            return resetState({
                ...state,
                stages: updatedStages
            })
        }

        case 'REMOVE_STAGE':
            return resetState({
                ...state,
                stages: state.stages.filter((_, index) => index !== action.payload),
            })

        case 'MARK_STAGE_COMPLETED': {
            const newState = {...state}
            newState.actualEndTimes[newState.currentStageIndex] = now;
            newState.actualDurationMins[newState.currentStageIndex] = timeDiffInMins(
                newState.actualEndTimes[newState.currentStageIndex]!,
                newState.actualStartTimes[newState.currentStageIndex]!
            );

            const newCurrentStageIndex = action.payload + 1;

            if (newCurrentStageIndex < newState.stages.length) {
                // Update actualStartTimes array for the next stage
                const newActualStartTimes = [...newState.actualStartTimes];
                newActualStartTimes[newCurrentStageIndex] = now;
                newState.actualStartTimes = newActualStartTimes;
            }

            return calculateDisplayedStageTimes({
                ...newState,
                currentStageIndex: newCurrentStageIndex,
                meetingStatus: newCurrentStageIndex >= newState.stages.length ? 'completed' : 'in_progress'
            })
        }

        case 'START_MEETING': {
            const updatedStages = [...state.stages];
            const newActualStartTimes = [...state.actualStartTimes];
            newActualStartTimes[0] = now;

            return calculateDisplayedStageTimes({
                ...state,
                meetingStatus: 'in_progress',
                lastUpdateTime: now,
                currentStageIndex: 0,
                stages: updatedStages,
                actualStartTimes: newActualStartTimes
            })
        }

        case 'UPDATE_STAGES_DISPLAYED_TIMES':
            return calculateDisplayedStageTimes(state);

        case 'RESET_STATE':
            return calculateDisplayedStageTimes(
                resetState({
                    ...action.payload,
                }));

        default:
            return state
    }
};