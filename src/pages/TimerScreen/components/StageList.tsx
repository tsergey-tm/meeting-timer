import {format} from 'date-fns'
import {CheckIcon, ClockIcon, TrackNextIcon} from '@radix-ui/react-icons'
import {useTranslation} from 'react-i18next';
import {useMeeting} from "../../../context/MeetingContext/useMeeting.ts";

const StageList = () => {
    const {state, dispatch} = useMeeting();
    const {t} = useTranslation();

    const dateCompareMinute = (date1: Date | null, date2: Date | null) => {
        if (date1 && date2) {
            if (Math.abs(date1.getTime() - date2.getTime()) < 60 * 1000) {
                return 0;
            } else {
                return date1.getTime() - date2.getTime();
            }
        } else {
            return 0;
        }
    }

    const markStageCompleted = (stageIndex: number) => {
        dispatch({type: 'MARK_STAGE_COMPLETED', payload: stageIndex})
    }

    return (
        <div className="border-t pt-6 flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('meeting.stages.title')}</h2>
            <div className="space-y-3 flex-1 overflow-y-auto">
                {state.stages.map((stage, index) => {
                    const isCurrent = index === state.currentStageIndex
                    const isCompleted = state.actualEndTimes[index]
                    const isDelayed = dateCompareMinute(state.plannedStartTimes[index], state.displayedStartTime[index]) < 0;

                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${isCompleted ? 'bg-gray-100 opacity-70' : isCurrent ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => isCurrent && markStageCompleted(index)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <div
                                        className={`w-8 min-w-8 h-8 min-h-8 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-gray-400' : isCurrent ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        {isCompleted ? (
                                            <CheckIcon className="h-5 w-5 text-white"/>
                                        ) : isCurrent ? (
                                            <ClockIcon className="h-5 w-5 text-white"/>
                                        ) : (
                                            <span
                                                className="text-white text-sm font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className={`justify-self-stretch justify-items-start text-left`}>
                                        <div
                                            className={`font-medium ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {stage.name}
                                        </div>
                                        <div
                                            className={`text-sm ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                                            {t('meeting.stages.duration', {durationMins: stage.durationMins})}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end space-y-1 flex-col self-stretch">
                                {state.displayedStartTime && state.displayedStartTime[index] && (
                                    <div
                                        className={`text-sm font-medium text-right ${isDelayed ? 'text-orange-600' : 'text-gray-600'}`}>
                                        {format(state.displayedStartTime[index], 'HH:mm')}&nbsp;
                                        ({format(state.plannedStartTimes[index], 'HH:mm')})
                                    </div>
                                )}
                                {isCurrent && !isCompleted && (
                                    <div className="flex items-center space-x-2 ml-4">
                                        <span
                                            className="text-sm text-blue-600 font-medium hidden min-[480px]:block">{t('setup.stage.current')}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                markStageCompleted(index)
                                            }}
                                            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                                            aria-label="Mark stage complete"
                                        >
                                            <TrackNextIcon className="h-4 w-4"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default StageList