export const formatTime = (seconds: number): string => {
    const hours = Math.floor(Math.abs(seconds) / 60 / 60)
    const mins = Math.floor((Math.abs(seconds) / 60) % 60)
    const secs = Math.floor(Math.abs(seconds) % 60)
    return (seconds < 0 ? "-" : "") +
        `${hours.toString().padStart(2, '0')}:` +
        `${mins.toString().padStart(2, '0')}:` +
        `${secs.toString().padStart(2, '0')}`
}

export const formatTimeToMinutes = (seconds: number): string => {
    const minutes = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.floor(Math.abs(seconds) % 60)
    return (seconds < 0 ? "-" : "") +
        `${minutes.toString().padStart(2, '0')}:` +
        `${secs.toString().padStart(2, '0')}`
}