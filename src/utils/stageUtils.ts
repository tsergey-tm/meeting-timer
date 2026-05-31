export type Stage = {
    name: string
    duration: number // in minutes
    plannedStartTime: Date | null
    actualStartTime: Date | null
    actualEndTime: Date | null
    displayedStartTime: Date | null
}

export const calculatePlannedStageTimes = (stages: Stage[], startTime: Date): Stage[] => {
    if (!startTime) return stages

    return stages.map((stage, index) => {
        const previousStagesDuration = stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
        const plannedStartTime = new Date(startTime.getTime() + previousStagesDuration * 60000)

        return {
            ...stage,
            plannedStartTime: plannedStartTime,
            displayedStartTime: plannedStartTime
        }
    })
}

export const calculateDisplayedStageTimes = (currentTime: Date, stages: Stage[]): Stage[] => {
    return stages.map((stage, index) => {
        if (stage.actualStartTime !== null) {
            return {
                ...stage,
                displayedStartTime: stage.actualStartTime
            }
        }

        const activeStageIndex = stages.findLastIndex(s => s.actualStartTime !== null)
        if (activeStageIndex === -1) {
            // No stages have started yet - calculate delay from planned meeting start
            if (stages[0].plannedStartTime && currentTime.getTime() > stages[0].plannedStartTime.getTime()) {
                // Meeting should have started but hasn't - calculate delay
                const meetingDelay = currentTime.getTime() - stages[0].plannedStartTime.getTime()
                const adjustedStartTime = new Date(stage.plannedStartTime!.getTime() + meetingDelay)
                return {
                    ...stage,
                    displayedStartTime: adjustedStartTime
                }
            } else {
                // Meeting hasn't started yet and is on time
                return {
                    ...stage,
                    displayedStartTime: stage.plannedStartTime
                }
            }
        }

        if (activeStageIndex >= index) {
            return {
                ...stage,
                displayedStartTime: stage.plannedStartTime
            }
        }

        const activeStage = stages[activeStageIndex]
        if (!activeStage.actualStartTime || !activeStage.plannedStartTime) {
            return {
                ...stage,
                displayedStartTime: stage.plannedStartTime
            }
        }

        // Calculate actual end time of active stage
        const actualEndTime = new Date(activeStage.actualStartTime.getTime() + activeStage.duration * 60000)
        const delta = currentTime.getTime() - actualEndTime.getTime()

        // Check if we're ahead of schedule (delta < 0) - show planned times
        if (delta < 0) {
            return {
                ...stage,
                displayedStartTime: stage.plannedStartTime
            }
        }

        // Check if previous stages saved time that compensates for current delay
        let netDelta = delta
        for (let i = 0; i < activeStageIndex; i++) {
            const prevStage = stages[i]
            if (prevStage.actualEndTime && prevStage.plannedStartTime) {
                const prevPlannedEnd = new Date(prevStage.plannedStartTime.getTime() + prevStage.duration * 60000)
                const prevActualEnd = prevStage.actualEndTime
                const timeSaved = prevPlannedEnd.getTime() - prevActualEnd.getTime()
                if (timeSaved > 0) {
                    netDelta -= timeSaved
                    if (netDelta <= 0) {
                        return {
                            ...stage,
                            displayedStartTime: stage.plannedStartTime
                        }
                    }
                }
            }
        }

        // If we have a net delay, calculate adjusted start times based on actual end of active stage
        const adjustedStartTime = new Date(actualEndTime.getTime() + netDelta +
            stages.slice(activeStageIndex + 1, index).reduce((sum, s) => sum + s.duration, 0) * 60000)

        return {
            ...stage,
            displayedStartTime: adjustedStartTime
        }
    })
}