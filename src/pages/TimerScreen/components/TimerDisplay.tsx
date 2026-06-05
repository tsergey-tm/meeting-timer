import {format} from 'date-fns'
import {ClockIcon} from '@radix-ui/react-icons'
import {formatTime} from '../../../utils/timeFormatting.ts'
import {useTranslation} from 'react-i18next';

interface TimerDisplayProps {
    stageRemaining: number
    totalRemaining: number
    meetingStatus: string
    startMeeting: () => void
    isValid: boolean
}

const TimerDisplay = ({
                          stageRemaining,
                          totalRemaining,
                          meetingStatus,
                          startMeeting,
                          isValid
                      }: TimerDisplayProps) => {
    const {t} = useTranslation();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1 gap-6">
                <div className="text-center p-4 bg-lime-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{t('timer.current.caption')}</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {format(new Date(), 'HH:mm:ss')}
                    </div>
                </div>
                <div className={"text-center p-4 rounded-lg " + (
                    stageRemaining < 1 ? 'bg-red-50' :
                        stageRemaining < 61 ? 'bg-yellow-50' :
                            'bg-blue-50'
                )}>
                    <div className="text-sm text-gray-600 mb-2">
                        {meetingStatus === 'not_started' ? 'Time until meeting starts' : 'Time until next stage'}
                    </div>
                    <div className={"text-2xl font-bold " + (
                        stageRemaining < 1 ? 'text-red-700' :
                            stageRemaining < 61 ? 'text-yellow-500' :
                                'text-blue-700'
                    )}>
                        {formatTime(stageRemaining)}
                    </div>
                </div>
                <div className={"text-center p-4 rounded-lg " + (
                    totalRemaining < 1 ? 'bg-red-50' :
                        totalRemaining < 61 ? 'bg-yellow-50' :
                            'bg-green-50'
                )}>
                    <div className="text-sm text-gray-600 mb-2">
                        Time until meeting end
                    </div>
                    <div className={"text-2xl font-bold " + (
                        totalRemaining < 1 ? 'text-red-700' :
                            totalRemaining < 61 ? 'text-yellow-500' :
                                'text-green-700'
                    )}>
                        {formatTime(totalRemaining)}
                    </div>
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
                        Start meeting
                    </button>
                ) : meetingStatus === 'in_progress' ? (
                    <></>
                ) : (
                    <button
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
                    >
                        Meeting Completed
                    </button>
                )}
            </div>
        </div>
    )
}

export default TimerDisplay