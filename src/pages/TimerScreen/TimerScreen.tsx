import {useEffect, useRef, useState} from 'react'
import Modal from 'react-modal'
import {Pencil2Icon, QuestionMarkCircledIcon} from '@radix-ui/react-icons'
import {useMeeting} from "../../context/MeetingContext/useMeeting.ts"
import MeetingSetup from "../MeetingSetup";
import TimerDisplay from './components/TimerDisplay.tsx'
import StageList from './components/StageList.tsx'
import NotificationModal from './components/NotificationModal.tsx'
import AudioControls from './components/AudioControls.tsx'
import HelpModal from './components/HelpModal.tsx'
import {AppIcon} from "../../assets";
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

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
    // Controls the help modal visibility
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
    const {t} = useTranslation();

    // Reference to the Web Audio API context
    const audioContextRef = useRef<AudioContext | null>(null)
    // Reference to the silent audio interval timer
    const silentIntervalRef = useRef<number | null>(null)

    const setIsModalOpen = (open: boolean) => {
        _setIsModalOpen(open);
        resetPlayedSounds();
    }

    const startMeeting = () => {
        resetPlayedSounds();
        dispatch({type: 'START_MEETING'})
    }

    const initializeAudioContext = () => {
        if (!isAudioReady && !audioContextRef.current) {
            try {
                audioContextRef.current = new AudioContext();
                setIsAudioReady(true)
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

    const resetPlayedSounds = () => {
        setWarnNotified(false);
        setErrorNotified(false);
    }

    const {isValid} = validateMeeting();

    // Audio controls
    const startSilentAudioLoop = () => {
        if (!isAudioReady) return

        // Play silent audio to prevent tab throttling
        const playSilent = () => {
            // Silent audio loop logic is handled in AudioControls component
        }

        playSilent()

        silentIntervalRef.current = window.setInterval(playSilent, 1000)
    }

    const stopSilentAudioLoop = () => {
        if (silentIntervalRef.current) {
            window.clearInterval(silentIntervalRef.current)
            silentIntervalRef.current = null
        }
    }

    const notifyOneMinute = () => {
        setWarnNotified(true);

        if (isNotificationSelected) {
            console.log("notifyOneMinute");
            if ('Notification' in window && window.Notification.permission === 'granted') {
                new Notification(t('translation.app.title'), {
                    body: 'One minute left until the meeting stage changes',
                    icon: 'favicon.svg'
                })
            }
        }
    }

    const notifyExpired = () => {
        setWarnNotified(true);
        setErrorNotified(true);

        if (isNotificationSelected && 'Notification' in window && window.Notification.permission === 'granted') {
            new Notification(t('translation.app.title'), {
                body: "It's time to change the stage of the meeting",
                icon: 'favicon.svg'
            })
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

    const {stageRemaining, totalRemaining} = calculateTimeRemaining()

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSilentAudioLoop()
        }
    }, [])

    return (
        <>
            <AudioControls
                isAudioReady={isAudioReady}
                startSilentAudioLoop={startSilentAudioLoop}
                stopSilentAudioLoop={stopSilentAudioLoop}
            />

            {/* Notification permission modal */}
            <NotificationModal
                isOpen={isAudioPermissionModalOpen}
                onRequestClose={() => setIsAudioPermissionModalOpen(false)}
                handleNotificationPermission={handleNotificationPermission}
            />

            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <AppIcon className="h-8 w-8 text-blue-600 mr-3"/>
                                <h1 className="text-2xl font-bold text-gray-900">{t('translation.app.title')}</h1>
                            </div>
                            <div className="flex space-x-2">
                                <LanguageSwitcher/>
                                <button
                                    onClick={() => setIsHelpModalOpen(true)}
                                    className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-2 transition-colors"
                                    aria-label="Help"
                                >
                                    <QuestionMarkCircledIcon className="h-6 w-6"/>
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-2 transition-colors"
                                    aria-label="Configure meeting"
                                >
                                    <Pencil2Icon className="h-6 w-6"/>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <TimerDisplay
                                stageRemaining={stageRemaining}
                                totalRemaining={totalRemaining}
                                meetingStatus={state.meetingStatus}
                                startMeeting={startMeeting}
                                isValid={isValid}
                            />

                            <StageList
                                stages={state.stages}
                                currentStageIndex={state.currentStageIndex}
                                markStageCompleted={markStageCompleted}
                            />
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

            <HelpModal
                isOpen={isHelpModalOpen}
                onRequestClose={() => setIsHelpModalOpen(false)}
            />
        </>
    )
}

export default TimerScreen;