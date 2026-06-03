import {calculateDisplayedStageTimes, calculatePlannedStageTimes} from "../../utils/stageUtils.ts";
import type {Action, MeetingState} from "./MeetingContext.types.ts";

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