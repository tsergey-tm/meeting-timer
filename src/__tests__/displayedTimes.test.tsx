import {beforeEach, describe, expect, it, vi} from 'vitest'
import {calculateDisplayedStageTimes, calculatePlannedStageTimes} from '../context/MeetingContext/stageUtils.ts'
import {initialMeetingContextState, type MeetingState} from "../context/MeetingContext/MeetingContext.types.ts";
import {timeDiffInMins} from "../utils/timeUtils.ts";

const minToMsec = (min: number): number => {
    return min * 60 * 1000;
}

describe('calculateDisplayedStageTimes function', () => {
    let now: Date

    beforeEach(() => {
        now = new Date()
        vi.useFakeTimers()
        vi.setSystemTime(now)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return state unchanged when startTime is null', () => {
        const state: MeetingState = {
            ...initialMeetingContextState(),
            endTime: new Date(now.getTime() + minToMsec(60)),
        }

        const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))
        expect(result).toEqual(state)
    })

    describe('not started meeting', () => {
        it('should calculate start time for first stage when meeting not started', () => {
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: new Date(now.getTime() + minToMsec(30)), // 30 min in future
                endTime: new Date(now.getTime() + minToMsec(90)),   // 90 min total
                stages: [
                    {
                        name: 'Intro',
                        durationMins: 15,
                    },
                    {
                        name: 'Discussion',
                        durationMins: 30,
                    }
                ]
            }

            const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))

            expect(result.displayedStartTime[0]).toBeDefined()
            expect(result.displayedStartTime[0]!.getTime()).toBe(state.startTime!.getTime())
            expect(result.displayedStartTime[1]).toBeDefined()
            expect(result.displayedStartTime[1]!.getTime()).toBe(state.startTime!.getTime() + minToMsec(15))
        })

        it('should adjust start time if meeting is late', () => {
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: new Date(now.getTime() - minToMsec(60)), // 1 hour ago
                endTime: new Date(now.getTime() + minToMsec(30)),   // 30 min from now
                stages: [
                    {
                        name: 'Intro',
                        durationMins: 15,
                    },
                    {
                        name: 'Discussion',
                        durationMins: 30,
                    }
                ]
            }

            const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))

            // Should start from current time (now) instead of past start time
            expect(result.displayedStartTime[0]!.getTime()).toBe(now.getTime())
        })
    })

    describe('in progress meeting', () => {
        it('should use actual start time when meeting has started', () => {
            const actualStartTime = new Date(now.getTime() - minToMsec(15)) // 15 min ago
            const plannedStartTime = new Date(now.getTime() - minToMsec(30)) // 30 min ago
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: plannedStartTime,
                endTime: new Date(now.getTime() + minToMsec(30)),   // 30 min from now
                stages: [
                    {
                        name: 'Intro',
                        durationMins: 15,
                    },
                    {
                        name: 'Discussion',
                        durationMins: 30,
                    }
                ],
                currentStageIndex: 0,
                meetingStatus: 'in_progress',
                lastUpdateTime: actualStartTime,
                actualStartTimes: [actualStartTime, null],
                plannedStartTimes: [plannedStartTime, new Date(plannedStartTime.getTime() + minToMsec(15))]
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.displayedStartTime[0]).toEqual(actualStartTime)
            expect(result.displayedStartTime[1]).toBeDefined()
            expect(result.displayedStartTime[1]!.getTime()).toBe(actualStartTime.getTime() + minToMsec(15))
        })

        it('should calculate displayed time for next stage', () => {
            const actualStartTime = new Date(now.getTime() - minToMsec(15)) // 15 min ago
            const actualEndTime = new Date(now.getTime() - minToMsec(10))   // 10 min ago
            const plannedStartTime = new Date(now.getTime() - minToMsec(30)) // 30 min ago
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: plannedStartTime,
                endTime: new Date(now.getTime() + minToMsec(20)),   // 20 min from now
                stages: [
                    {
                        name: 'Intro',
                        durationMins: 15,
                    },
                    {
                        name: 'Discussion',
                        durationMins: 30,
                    }
                ],
                currentStageIndex: 1,
                meetingStatus: 'in_progress',
                lastUpdateTime: actualEndTime,
                actualStartTimes: [actualStartTime, actualEndTime],
                plannedStartTimes: [plannedStartTime, new Date(plannedStartTime.getTime() + minToMsec(15))]
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.displayedStartTime[0]).toEqual(actualStartTime)
            // For the second stage, it should be set to the end time of the previous stage (when it was completed)
            expect(result.displayedStartTime[1]!.getTime()).toBeGreaterThanOrEqual(actualEndTime.getTime())
        })
    })

    describe('completed stages', () => {
        it('should handle stages with both actual start and end times', () => {
            const start1 = new Date(now.getTime() - minToMsec(20)) // 20 min ago
            const end1 = new Date(now.getTime() - minToMsec(15))   // 15 min ago
            const end2 = new Date(now.getTime() - minToMsec(10))   // 10 min ago
            const plannedStartTime = new Date(now.getTime() - minToMsec(30)) // 30 min ago
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: plannedStartTime,
                endTime: new Date(now.getTime()),             // now
                stages: [
                    {
                        name: 'Intro',
                        durationMins: 15,
                    },
                    {
                        name: 'Discussion',
                        durationMins: 30,
                    }
                ],
                currentStageIndex: 2,
                meetingStatus: 'completed',
                lastUpdateTime: end2,
                actualStartTimes: [start1, end1],
                actualEndTimes: [end1, end2],
                actualDurationMins: [timeDiffInMins(end1, start1), timeDiffInMins(end2, end1)],
                plannedStartTimes: [plannedStartTime, new Date(plannedStartTime.getTime() + minToMsec(15))]
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.displayedStartTime[0]).toEqual(start1)
            expect(result.displayedStartTime[0]!.getTime()).toBe(start1.getTime())
            expect(result.displayedStartTime[1]).toEqual(end1)
            expect(result.displayedStartTime[1]!.getTime()).toBe(end1.getTime())
        })
    })

    describe('edge cases', () => {
        it('should handle single stage meeting', () => {
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: new Date(now.getTime() + minToMsec(30)),
                endTime: new Date(now.getTime() + minToMsec(35)),
                stages: [
                    {
                        name: 'Only Stage',
                        durationMins: 15,
                    }
                ]
            }

            const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))

            expect(result.stages.length).toBe(1)
            expect(result.displayedStartTime[0]).toBeDefined()
        })

        it('should handle empty stages array', () => {
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: new Date(now.getTime() + minToMsec(30)),
                endTime: new Date(now.getTime() + minToMsec(35)),
                stages: []
            }

            const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))

            expect(result.stages.length).toBe(0)
        })

        it('should handle stages with zero duration', () => {
            const state: MeetingState = {
                ...initialMeetingContextState(),
                startTime: new Date(now.getTime() + minToMsec(30)),
                endTime: new Date(now.getTime() + minToMsec(35)),
                stages: [
                    {
                        name: 'Stage 1',
                        durationMins: 0,
                    },
                    {
                        name: 'Stage 2',
                        durationMins: 30,
                    }
                ]
            }

            const result = calculateDisplayedStageTimes(calculatePlannedStageTimes(state))

            expect(result.displayedStartTime[0]).toBeDefined()
            expect(result.displayedStartTime[1]).toBeDefined()
            expect(result.displayedStartTime[1]!.getTime()).toBe(result.displayedStartTime[0]!.getTime())
        })
    })
})

export {}