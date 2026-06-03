import {beforeEach, describe, expect, it, vi} from 'vitest'
import {calculateDisplayedStageTimes} from '../utils/stageUtils.ts'
import type {MeetingState} from "../context/MeetingContext/MeetingContext.types.ts";

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
            startTime: null,
            endTime: new Date(now.getTime() + 3600000),
            stages: [],
            currentStageIndex: -1,
            meetingStatus: 'not_started',
            lastUpdateTime: null
        }

        const result = calculateDisplayedStageTimes(state)
        expect(result).toEqual(state)
    })

    describe('not started meeting', () => {
        it('should calculate start time for first stage when meeting not started', () => {
            const state: MeetingState = {
                startTime: new Date(now.getTime() + 1800000), // 30 min in future
                endTime: new Date(now.getTime() + 5400000),   // 90 min total
                stages: [
                    {
                        name: 'Intro',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() + 1800000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    },
                    {
                        name: 'Discussion',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() + 2100000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: -1,
                meetingStatus: 'not_started',
                lastUpdateTime: null
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages[0].displayedStartTime).toBeDefined()
            expect(result.stages[0].displayedStartTime!.getTime()).toBe(state.startTime!.getTime())
            expect(result.stages[1].displayedStartTime).toBeDefined()
            expect(result.stages[1].displayedStartTime!.getTime()).toBe(state.startTime!.getTime() + 15 * 60000)
        })

        it('should adjust start time if meeting is late', () => {
            const state: MeetingState = {
                startTime: new Date(now.getTime() - 3600000), // 1 hour ago
                endTime: new Date(now.getTime() + 1800000),   // 30 min from now
                stages: [
                    {
                        name: 'Intro',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() - 3600000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    },
                    {
                        name: 'Discussion',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() - 2700000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: -1,
                meetingStatus: 'not_started',
                lastUpdateTime: null
            }

            const result = calculateDisplayedStageTimes(state)

            // Should start from current time (now) instead of past start time
            expect(result.stages[0].displayedStartTime!.getTime()).toBe(now.getTime())
        })
    })

    describe('in progress meeting', () => {
        it('should use actual start time when meeting has started', () => {
            const actualStartTime = new Date(now.getTime() - 900000) // 15 min ago
            const state: MeetingState = {
                startTime: new Date(now.getTime() - 1800000), // 30 min ago
                endTime: new Date(now.getTime() + 1800000),   // 30 min from now
                stages: [
                    {
                        name: 'Intro',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() - 1800000),
                        actualStartTime: actualStartTime,
                        actualEndTime: null,
                        displayedStartTime: null
                    },
                    {
                        name: 'Discussion',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() - 1500000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: 0,
                meetingStatus: 'in_progress',
                lastUpdateTime: actualStartTime
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages[0].displayedStartTime).toEqual(actualStartTime)
            expect(result.stages[1].displayedStartTime).toBeDefined()
            expect(result.stages[1].displayedStartTime!.getTime()).toBe(actualStartTime.getTime() + 15 * 60000)
        })

        it('should calculate displayed time for next stage', () => {
            const actualStartTime = new Date(now.getTime() - 900000) // 15 min ago
            const actualEndTime = new Date(now.getTime() - 600000)   // 10 min ago
            const state: MeetingState = {
                startTime: new Date(now.getTime() - 1800000), // 30 min ago
                endTime: new Date(now.getTime() + 1200000),   // 20 min from now
                stages: [
                    {
                        name: 'Intro',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() - 1800000),
                        actualStartTime: actualStartTime,
                        actualEndTime: actualEndTime,
                        displayedStartTime: null
                    },
                    {
                        name: 'Discussion',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() - 1500000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: 1,
                meetingStatus: 'in_progress',
                lastUpdateTime: actualEndTime
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages[0].displayedStartTime).toEqual(actualStartTime)
            // For the second stage, it should be set to the end time of the previous stage (when it was completed)
            expect(result.stages[1].displayedStartTime!.getTime()).toBeGreaterThanOrEqual(actualEndTime.getTime())
        })
    })

    describe('completed stages', () => {
        it('should handle stages with both actual start and end times', () => {
            const start1 = new Date(now.getTime() - 1200000) // 20 min ago
            const end1 = new Date(now.getTime() - 900000)   // 15 min ago
            const start2 = new Date(now.getTime() - 900000)  // 15 min ago
            const end2 = new Date(now.getTime() - 600000)   // 10 min ago
            const state: MeetingState = {
                startTime: new Date(now.getTime() - 1800000), // 30 min ago
                endTime: new Date(now.getTime()),             // now
                stages: [
                    {
                        name: 'Intro',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() - 1800000),
                        actualStartTime: start1,
                        actualEndTime: end1,
                        displayedStartTime: null
                    },
                    {
                        name: 'Discussion',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() - 1500000),
                        actualStartTime: start2,
                        actualEndTime: end2,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: 2,
                meetingStatus: 'completed',
                lastUpdateTime: end2
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages[0].displayedStartTime).toEqual(start1)
            expect(result.stages[0].displayedStartTime!.getTime()).toBe(start1.getTime())
            expect(result.stages[1].displayedStartTime).toEqual(end1)
            expect(result.stages[1].displayedStartTime!.getTime()).toBe(end1.getTime())
        })
    })

    describe('edge cases', () => {
        it('should handle single stage meeting', () => {
            const state: MeetingState = {
                startTime: new Date(now.getTime() + 1800000),
                endTime: new Date(now.getTime() + 2100000),
                stages: [
                    {
                        name: 'Only Stage',
                        duration: 15,
                        plannedStartTime: new Date(now.getTime() + 1800000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: -1,
                meetingStatus: 'not_started',
                lastUpdateTime: null
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages.length).toBe(1)
            expect(result.stages[0].displayedStartTime).toBeDefined()
        })

        it('should handle empty stages array', () => {
            const state: MeetingState = {
                startTime: new Date(now.getTime() + 1800000),
                endTime: new Date(now.getTime() + 2100000),
                stages: [],
                currentStageIndex: -1,
                meetingStatus: 'not_started',
                lastUpdateTime: null
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages.length).toBe(0)
        })

        it('should handle stages with zero duration', () => {
            const state: MeetingState = {
                startTime: new Date(now.getTime() + 1800000),
                endTime: new Date(now.getTime() + 2100000),
                stages: [
                    {
                        name: 'Stage 1',
                        duration: 0,
                        plannedStartTime: new Date(now.getTime() + 1800000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    },
                    {
                        name: 'Stage 2',
                        duration: 30,
                        plannedStartTime: new Date(now.getTime() + 1800000),
                        actualStartTime: null,
                        actualEndTime: null,
                        displayedStartTime: null
                    }
                ],
                currentStageIndex: -1,
                meetingStatus: 'not_started',
                lastUpdateTime: null
            }

            const result = calculateDisplayedStageTimes(state)

            expect(result.stages[0].displayedStartTime).toBeDefined()
            expect(result.stages[1].displayedStartTime).toBeDefined()
            expect(result.stages[1].displayedStartTime!.getTime()).toBe(result.stages[0].displayedStartTime!.getTime())
        })
    })
})

export {}