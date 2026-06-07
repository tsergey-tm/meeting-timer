import {calculateDisplayedStageTimes, calculatePlannedStageTimes} from "./stageUtils.ts";
import type {Action, MeetingState} from "./MeetingContext.types.ts";

export function reducer(state: MeetingState, action: Action): MeetingState {

    const now = new Date();

    switch (action.type) {
        case 'SET_START_TIME': {
            return calculatePlannedStageTimes({
                ...state,
                startTime: action.payload,
                meetingStatus: 'not_started',
                currentStageIndex: -1
            })
        }

        case 'SET_END_TIME':
            return {
                ...state,
                endTime: action.payload,
                meetingStatus: 'not_started',
                currentStageIndex: -1
            }

        case 'ADD_STAGE': {
            return calculatePlannedStageTimes({
                ...state,
                stages: [...state.stages, action.payload],
                meetingStatus: 'not_started',
                currentStageIndex: -1
            })
        }

        case 'UPDATE_STAGE': {
            const updatedStages = [...state.stages];
            updatedStages[action.payload.index] = {
                ...updatedStages[action.payload.index],
                duration: action.payload.duration,
                ...(action.payload.name !== undefined && {name: action.payload.name})
            };

            return calculatePlannedStageTimes({
                ...state,
                stages: updatedStages,
                meetingStatus: 'not_started',
                currentStageIndex: -1
            })
        }

        case 'REMOVE_STAGE':
            return {
                ...state,
                stages: state.stages.filter((_, index) => index !== action.payload),
                meetingStatus: 'not_started',
                currentStageIndex: -1
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
            return calculateDisplayedStageTimes(
                calculatePlannedStageTimes({
                    ...action.payload,
                    meetingStatus: 'not_started',
                    currentStageIndex: -1
                }));

        default:
            return state
    }
}