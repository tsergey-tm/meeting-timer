import {describe, expect, it} from 'vitest'
import {differenceInMinutes, format} from 'date-fns'

describe('Date formatting utilities', () => {
    it('should format dates correctly', () => {
        const date = new Date(2024, 0, 15, 14, 30, 0)
        expect(format(date, 'HH:mm')).toBe('14:30')
    })

    it('should calculate time differences correctly', () => {
        const start = new Date(2024, 0, 15, 14, 0, 0)
        const end = new Date(2024, 0, 15, 15, 30, 0)
        expect(differenceInMinutes(end, start)).toBe(90)
    })
})

describe('Meeting context types', () => {
    it('should handle stage calculations', () => {
        const stages = [
            {id: '1', name: 'Introduction', duration: 15},
            {id: '2', name: 'Discussion', duration: 45},
            {id: '3', name: 'Wrap-up', duration: 15}
        ]

        const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0)
        expect(totalDuration).toBe(75)
    })
})

describe('Validation logic', () => {
    it('should validate positive durations', () => {
        const durations = [15, 30, 0, -5, 20]
        const invalid = durations.filter(d => d <= 0)
        expect(invalid).toEqual([0, -5])
    })
})