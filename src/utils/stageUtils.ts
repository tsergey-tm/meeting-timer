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

