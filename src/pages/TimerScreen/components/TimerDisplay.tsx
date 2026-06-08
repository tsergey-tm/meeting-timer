import {format} from 'date-fns'
import {ClockIcon} from '@radix-ui/react-icons'
import {formatTime} from '../../../utils/timeUtils.ts'
import {useTranslation} from 'react-i18next';
import {TimeBufferBar, type TimeBufferBarProps} from "../../../components/TimeBufferBar.tsx";
import {useMeeting} from "../../../context/MeetingContext/useMeeting.ts";
import {clamp} from "../../../utils/numUtils.ts";


const TimerDisplay = () => {
    const {t} = useTranslation();
    // Meeting context and utilities
    const {state, dispatch, calculateTimeRemaining, validateMeeting} = useMeeting();

    const meetingStatus = state.meetingStatus;
    const {isValid} = validateMeeting();
    const {stageRemaining, totalRemaining} = calculateTimeRemaining();

    const startMeeting = () => {
        dispatch({type: 'START_MEETING'})
    }

    // TimeBufferBar state
    const calcBufferParams = (): TimeBufferBarProps => {

        const bufferPlannedLength = state.bufferPlannedLength || 0

        // Buffer empty or not valid
        if (bufferPlannedLength <= 0 || !isValid) {
            return {
                bufferBalanceSeconds: 0,
                totalBufferSeconds: 0,
                yellowAt: 0,
                orangeAt: 0
            }
        }

        const yellowA = -0.5; // (0.5 - 1) / (1 - 0)
        const yellowB = 1;
        const orangeA = -0.5; // (0 - 0.5) / (1 - 0)
        const orangeB = 0.5;

        const meetingConsuption = clamp(
            (new Date().getTime() - state.startTime!.getTime()) / (state.endTime!.getTime() - state.startTime!.getTime()),
            0, 1
        );

        const yellowK = yellowA * meetingConsuption + yellowB;
        const orangeK = orangeA * meetingConsuption + orangeB;

        return {
            bufferBalanceSeconds: state.bufferLength || 0,
            totalBufferSeconds: bufferPlannedLength,
            yellowAt: yellowK * bufferPlannedLength,
            orangeAt: orangeK * bufferPlannedLength
        }
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-12 gap-4 w-full">
                <div
                    className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 text-center p-4 bg-lime-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{t('timer.current.caption')}</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {format(new Date(), 'HH:mm:ss')}
                    </div>
                </div>
                <div className={"col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 text-center p-4 rounded-lg " + (
                    stageRemaining < 1 ? 'bg-red-50' :
                        stageRemaining < 61 ? 'bg-yellow-50' :
                            'bg-blue-50'
                )}>
                    <div className="text-sm text-gray-600 mb-2">
                        {t(meetingStatus === 'not_started' ? 'timer.current.untilMeeting' : 'timer.current.untilStage')}
                    </div>
                    <div className={"text-2xl font-bold " + (
                        stageRemaining < 1 ? 'text-red-700' :
                            stageRemaining < 61 ? 'text-yellow-500' :
                                'text-blue-700'
                    )}>
                        {formatTime(stageRemaining)}
                    </div>
                </div>
                <div className={"col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 text-center p-4 rounded-lg " + (
                    totalRemaining < 1 ? 'bg-red-50' :
                        totalRemaining < 61 ? 'bg-yellow-50' :
                            'bg-green-50'
                )}>
                    <div className="text-sm text-gray-600 mb-2">
                        {t('timer.current.untilEnd')}
                    </div>
                    <div className={"text-2xl font-bold " + (
                        totalRemaining < 1 ? 'text-red-700' :
                            totalRemaining < 61 ? 'text-yellow-500' :
                                'text-green-700'
                    )}>
                        {formatTime(totalRemaining)}
                    </div>
                </div>
                <div className={"col-span-12 sm:col-span-6 md:col-span-12 lg:col-span-3 "}>
                    <TimeBufferBar {...calcBufferParams()}/>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                {meetingStatus === 'not_started' ? (
                    <button
                        onClick={startMeeting}
                        className={"px-6 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-colors flex items-center " +
                            (isValid ?
                                "bg-green-600 hover:bg-green-700 focus:ring-green-500" :
                                "bg-gray-600  hover:bg-gray-700  focus:ring-gray-500")}
                        disabled={!isValid}
                    >
                        <ClockIcon className="h-5 w-5 mr-2"/>
                        {t('timer.current.start')}
                    </button>
                ) : meetingStatus === 'in_progress' ? (
                    <></>
                ) : (
                    <button
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
                    >
                        {t('timer.current.end')}
                    </button>
                )}
            </div>
        </div>
    )
}

export default TimerDisplay