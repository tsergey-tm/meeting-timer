import {useEffect, useRef, useState} from 'react'
import Modal from 'react-modal'
import {format} from 'date-fns'
import {CheckIcon, ClockIcon, Pencil2Icon, PlayIcon, TrackNextIcon} from '@radix-ui/react-icons'
import {useMeeting} from "../context/useMeeting.ts"
import MeetingSetup from "../pages/MeetingSetup"

const TimerScreen = () => {
    // Meeting context and utilities
    const {state, dispatch, calculateTimeRemaining, validateMeeting} = useMeeting()
    // Current time counter for UI updates
    const [time, setTime] = useState(0);
    // Controls the meeting configuration modal visibility
    const [isModalOpen, _setIsModalOpen] = useState(false)
    // Controls the audio permission modal visibility (shown on first load)
    const [isAudioPermissionModalOpen, setIsAudioPermissionModalOpen] = useState(true)
    // Tracks whether audio context is initialized and ready
    const [isAudioReady, setIsAudioReady] = useState(false)
    // Tracks whether notifications are enabled
    const [isNotificationSelected, setIsNotificationSelected] = useState(false)
    // Tracks which warning sounds have already been played (to prevent duplicates)
    const [warnNotified, setWarnNotified] = useState<boolean>(false)
    // Tracks which error sounds have already been played (to prevent duplicates)
    const [errorNotified, setErrorNotified] = useState<boolean>(false)

    // Reference to the Web Audio API context
    const audioContextRef = useRef<AudioContext | null>(null)
    // Reference to the silent audio element (keeps tab active)
    const silentAudioRef = useRef<HTMLAudioElement>(null)
    // Reference to the warning audio element
    const warnAudioRef = useRef<HTMLAudioElement>(null)
    // Reference to the error audio element
    const errorAudioRef = useRef<HTMLAudioElement>(null)
    // Reference to the silent audio interval timer
    const silentIntervalRef = useRef<number | null>(null)

    const setIsModalOpen = (open: boolean) => {
        _setIsModalOpen(open);
        resetPlayedSounds();
    }

    const startSilentAudioLoop = () => {
        if (!isAudioReady || !silentAudioRef.current) return

        // Play silent audio to prevent tab throttling
        const playSilent = () => {
            if (!silentAudioRef.current) return
            silentAudioRef.current.currentTime = 0
            silentAudioRef.current.play().catch(e => {
                console.warn('Failed to play silent audio:', e)
            })
        }

        playSilent()

        silentIntervalRef.current = window.setInterval(playSilent, 1000) as unknown as number
    }

    const stopSilentAudioLoop = () => {
        if (silentIntervalRef.current) {
            window.clearInterval(silentIntervalRef.current)
            silentIntervalRef.current = null
        }
    }

    const playWarningSound = () => {
        if (!isAudioReady || !warnAudioRef.current) return

        warnAudioRef.current.currentTime = 0
        warnAudioRef.current.play().catch(e => {
            console.warn('Failed to play warning sound:', e)
        })
    }

    const playErrorSound = () => {
        if (!isAudioReady || !errorAudioRef.current) return

        errorAudioRef.current.currentTime = 0
        errorAudioRef.current.play().catch(e => {
            console.warn('Failed to play error sound:', e)
        })
    }

    const notifyOneMinute = () => {

        setWarnNotified(true);

        if (isNotificationSelected) {
            console.log("notifyOneMinute");
            if ('Notification' in window && window.Notification.permission === 'granted') {
                new Notification('Meeting Timer', {
                    body: 'One minute left until the meeting stage changes',
                    icon: '/favicon.svg'
                })
            }
        }
        if (isAudioReady) {
            playWarningSound()
        }
    }

    const notifyExpired = () => {

        setWarnNotified(true);
        setErrorNotified(true);

        if (isNotificationSelected && 'Notification' in window && window.Notification.permission === 'granted') {
            new Notification('Meeting Timer', {
                body: "It's time to change the stage of the meeting",
                icon: '/favicon.svg'
            })
        }
        if (isAudioReady) {
            playErrorSound()
        }
    }

    const checkAndPlaySounds = () => {

        const {stageRemaining} = calculateTimeRemaining()

        if (stageRemaining <= 0 && !errorNotified) {
            notifyExpired();
            return;
        }

        if (stageRemaining <= 61 && !warnNotified) {
            notifyOneMinute();
            return;
        }
    }

    const resetPlayedSounds = () => {
        setWarnNotified(false);
        setErrorNotified(false);
    }

    const {isValid} = validateMeeting();

    useEffect(() => {
        // Always update meeting progression and current time
        const interval = setInterval(() => {
            // Update current time by forcing re-render
            setTime(time + 1);
            if (state.meetingStatus !== 'completed') {
                dispatch({type: 'UPDATE_STAGES_DISPLAYED_TIMES', payload: state.stages})

                // Check for sound events based on absolute time
                if (isValid) {
                    checkAndPlaySounds()
                }
            }

        }, 1000)

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.meetingStatus, time, isAudioReady, isNotificationSelected, warnNotified, errorNotified])

    const startMeeting = () => {
        resetPlayedSounds();
        dispatch({type: 'START_MEETING'})
    }

    const initializeAudioContext = () => {
        if (!isAudioReady && !audioContextRef.current) {
            try {
                const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext // eslint-disable-line @typescript-eslint/no-explicit-any
                audioContextRef.current = new AudioContext()
                setIsAudioReady(true)
                startSilentAudioLoop()
            } catch (e) {
                console.error('Failed to initialize audio context:', e)
            }
        }
    }

    const handleNotificationPermission = async (mode: string) => {
        setIsAudioPermissionModalOpen(false)

        if (mode === 'notifications' || mode === 'both') {
            setIsNotificationSelected(true)
            if ('Notification' in window) {
                let permission = Notification.permission

                if (permission === 'default') {
                    permission = await Notification.requestPermission()
                }

                if (permission === 'denied') {
                    setIsNotificationSelected(false)
                    if (mode === 'both') {
                        alert('Уведомления заблокированы в настройках браузера. Используется только звук.');
                    }
                }
            } else {
                setIsNotificationSelected(false)
                console.warn('Web Notification API not supported')
            }
        }

        if (mode === 'both' || mode === 'sound_only') {
            if (mode === 'sound_only') {
                setIsNotificationSelected(false)
            }
            initializeAudioContext()
        }

        if (mode === "none") {
            setIsNotificationSelected(false)
            setIsAudioReady(false)
        }

        resetPlayedSounds();
    }


    const markStageCompleted = (stageIndex: number) => {
        resetPlayedSounds();
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSilentAudioLoop()
        }
    }, [])

    return (
        <>
            <audio ref={silentAudioRef} src="./silent.mp3" preload="auto"/>
            <audio ref={warnAudioRef} src="./warn.mp3" preload="auto"/>
            <audio ref={errorAudioRef} src="./error.mp3" preload="auto"/>

            {/* Notification permission modal */}
            <Modal
                isOpen={isAudioPermissionModalOpen}
                onRequestClose={() => setIsAudioPermissionModalOpen(false)}
                shouldCloseOnOverlayClick={false}
                shouldCloseOnEsc={false}
                contentLabel="Notification Permission"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 2000
                    },
                    content: {
                        inset: '50% auto auto 50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '400px',
                        width: '90%',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        outline: 'none',
                        zIndex: 2001
                    }
                }}
            >
                <div className="text-center p-5">
                    <h2 className="text-xl font-bold text-gray-900 pb-1">Notification Settings</h2>
                    <p className="text-gray-600 pb-4">Choose how you would like to receive meeting notifications:</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleNotificationPermission('both')}
                            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                        >
                            Both notifications and sounds
                        </button>
                        <button
                            onClick={() => handleNotificationPermission('notifications')}
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                        >
                            Notifications only
                        </button>
                        <button
                            onClick={() => handleNotificationPermission('sound_only')}
                            className="w-full px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                        >
                            Sound only
                        </button>
                        <button
                            onClick={() => handleNotificationPermission('none')}
                            className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                        >
                            No notifications
                        </button>
                    </div>
                </div>
            </Modal>

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