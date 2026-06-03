import {useEffect, useRef} from 'react'

interface AudioControlsProps {
    isAudioReady: boolean
    startSilentAudioLoop: () => void
    stopSilentAudioLoop: () => void
}

const AudioControls = ({
                           isAudioReady,
                           startSilentAudioLoop,
                           stopSilentAudioLoop
                       }: AudioControlsProps) => {
    const silentAudioRef = useRef<HTMLAudioElement>(null)
    const warnAudioRef = useRef<HTMLAudioElement>(null)
    const errorAudioRef = useRef<HTMLAudioElement>(null)
    useRef<number | null>(null);

    useEffect(() => {
        if (isAudioReady) {
            startSilentAudioLoop()
        }

        return () => {
            stopSilentAudioLoop()
        }
    }, [isAudioReady, startSilentAudioLoop, stopSilentAudioLoop])


    return (
        <>
            <audio ref={silentAudioRef} src="./silent.mp3" preload="auto"/>
            <audio ref={warnAudioRef} src="./warn.mp3" preload="auto"/>
            <audio ref={errorAudioRef} src="./error.mp3" preload="auto"/>
        </>
    )
}

export default AudioControls