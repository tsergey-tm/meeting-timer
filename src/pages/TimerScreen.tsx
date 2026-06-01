import {useEffect, useState} from 'react'
import Modal from 'react-modal'
import {format} from 'date-fns'
import {CheckIcon, ClockIcon, Pencil2Icon, PlayIcon, TrackNextIcon} from '@radix-ui/react-icons'
import {useMeeting} from "../context/useMeeting.ts"
import MeetingSetup from "../pages/MeetingSetup"

const TimerScreen = () => {
    const {state, dispatch, calculateTimeRemaining, validateMeeting} = useMeeting()
    const [time, setTime] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        // Always update meeting progression and current time
        const interval = setInterval(() => {
            // Update current time by forcing re-render
            setTime(time + 1);
            if (state.meetingStatus !== 'completed') {
                dispatch({type: 'UPDATE_STAGES_DISPLAYED_TIMES', payload: state.stages})
            }
        }, 1000)

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.meetingStatus, time])

    const startMeeting = () => {
        dispatch({type: 'START_MEETING'})
    }

    const markStageCompleted = (stageIndex: number) => {
        dispatch({type: 'MARK_STAGE_COMPLETED', payload: stageIndex})
    }

    const {stageRemaining, totalRemaining} = calculateTimeRemaining()

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(Math.abs(seconds) / 60 / 60)
        const mins = Math.floor((Math.abs(seconds) / 60) % 60)
        const secs = Math.floor(Math.abs(seconds) % 60)
        return (seconds < 0 ? "-" : "") +
            `${hours.toString().padStart(2, '0')}:` +
            `${mins.toString().padStart(2, '0')}:` +
            `${secs.toString().padStart(2, '0')}`
    }

    const {isValid} = validateMeeting();

    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-blue-600 mr-3"/>
                                <h1 className="text-2xl font-bold text-gray-900">Meeting Timer</h1>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-2 transition-colors"
                                aria-label="Configure meeting"
                            >
                                <Pencil2Icon className="h-6 w-6"/>
                            </button>
                        </div>

                        <div className="space-y-6">

                            <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1 gap-6">
                                <div className="text-center p-4 bg-lime-50 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-2">Current Time</div>
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
                                        {state.meetingStatus === 'not_started' ? 'Time until meeting starts' : 'Time until next stage'}
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
                                {state.meetingStatus === 'not_started' ? (
                                    <button
                                        onClick={startMeeting}
                                        className={"px-6 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-colors flex items-center " +
                                            (isValid ?
                                                "bg-green-600 hover:bg-green-700 focus:ring-green-500" :
                                                "bg-gray-600  hover:bg-gray-700  focus:ring-gray-500")}
                                        disabled={!isValid}
                                    >
                                        <PlayIcon className="h-5 w-5 mr-2"/>
                                        Start meeting
                                    </button>
                                ) : state.meetingStatus === 'in_progress' ? (
                                    <></>
                                ) : (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
                                    >
                                        Meeting Completed
                                    </button>
                                )}
                            </div>

                            <div className="border-t pt-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Meeting Stages</h2>
                                <div className="space-y-3">
                                    {state.stages.map((stage, index) => {
                                        const isCurrent = index === state.currentStageIndex
                                        const isCompleted = stage.actualEndTime !== null
                                        const isDelayed = stage.displayedStartTime && stage.plannedStartTime &&
                                            stage.displayedStartTime.getTime() > stage.plannedStartTime.getTime() + 60_000

                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${isCompleted ? 'bg-gray-100 opacity-70' : isCurrent ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                onClick={() => !isCompleted && markStageCompleted(index)}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-gray-400' : isCurrent ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                            {isCompleted ? (
                                                                <CheckIcon className="h-5 w-5 text-white"/>
                                                            ) : isCurrent ? (
                                                                <ClockIcon className="h-5 w-5 text-white"/>
                                                            ) : (
                                                                <span
                                                                    className="text-white text-sm font-bold">{index + 1}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div
                                                                className={`font-medium ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                                                                {stage.name}
                                                            </div>
                                                            <div
                                                                className={`text-sm ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                                                                {stage.duration} minutes
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {isCurrent && !isCompleted && (
                                                        <div className="flex items-center space-x-2 ml-4">
                                                        <span
                                                            className="text-sm text-blue-600 font-medium">Current</span>
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
                                                    {stage.displayedStartTime && (
                                                        <div
                                                            className={`text-sm font-medium ${isDelayed ? 'text-orange-600' : 'text-gray-600'}`}>
                                                            {format(stage.displayedStartTime, 'HH:mm')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                contentLabel="Meeting Configuration"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000
                    },
                    content: {
                        inset: '50% auto auto 50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        width: '90%',
                        padding: 0,
                        overflow: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        outline: 'none',
                        zIndex: 1001
                    }
                }}
            >
                <MeetingSetup onClose={() => setIsModalOpen(false)}/>
            </Modal>
        </>
    )
}

export default TimerScreen