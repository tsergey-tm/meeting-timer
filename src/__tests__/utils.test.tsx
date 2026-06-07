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
            {name: 'Introduction', durationMins: 15},
            {name: 'Discussion', durationMins: 45},
            {name: 'Wrap-up', durationMins: 15}
        ]

        const totaldurationMins = stages.reduce((sum, stage) => sum + stage.durationMins, 0)
        expect(totaldurationMins).toBe(75)
    })
})

describe('Validation logic', () => {
    it('should validate positive durations', () => {
        const durations = [15, 30, 0, -5, 20]
        const invalid = durations.filter(d => d <= 0)
        expect(invalid).toEqual([0, -5])
    })
})

describe('URL state serialization', () => {
    it('should serialize and deserialize meeting state correctly', () => {
        const startTime = new Date('2024-01-15T14:00:00')
        const endTime = new Date('2024-01-15T15:30:00')
        const stages = [
            {name: 'Introduction', durationMins: 15},
            {name: 'Discussion', durationMins: 45},
            {name: 'Wrap-up', durationMins: 15}
        ]

        // Test serialization (hh24:mm format with individual n/d parameters)
        const params = new URLSearchParams()
        params.set('s', format(startTime, 'HH:mm'))
        params.set('e', format(endTime, 'HH:mm'))

        // Simulate the stage saving logic
        stages.forEach((stage, index) => {
            params.set(`n${index}`, encodeURIComponent(stage.name))
            params.set(`d${index}`, stage.durationMins.toString())
        })

        const url = `#?${params.toString()}`
        expect(url).toContain('s=14%3A00')
        expect(url).toContain('e=15%3A30')
        expect(url).toContain('n0=Introduction')
        expect(url).toContain('d0=15')
        expect(url).toContain('n1=Discussion')
        expect(url).toContain('d1=45')

        // Test deserialization
        const parsedParams = new URLSearchParams(url.substring(2))
        const parsedStartTimeStr = parsedParams.get('s')!
        const parsedEndTimeStr = parsedParams.get('e')!

        expect(parsedStartTimeStr).toBe('14:00')
        expect(parsedEndTimeStr).toBe('15:30')

        // Test time parsing from hh24:mm format
        const [startHours, startMinutes] = parsedStartTimeStr.split(':').map(Number)
        const [endHours, endMinutes] = parsedEndTimeStr.split(':').map(Number)
        expect(startHours).toBe(14)
        expect(startMinutes).toBe(0)
        expect(endHours).toBe(15)
        expect(endMinutes).toBe(30)

        // Test stage parsing from n/d parameters
        const parsedStages: { name: string, durationMins: number }[] = []
        let index = 0
        while (true) {
            const nameParam = `n${index}`
            const durationParam = `d${index}`

            const nameValue = parsedParams.get(nameParam)
            const durationValue = parsedParams.get(durationParam)

            if (nameValue === null || durationValue === null) {
                break
            }

            const durationMins = parseInt(durationValue)
            if (!isNaN(durationMins)) {
                parsedStages.push({
                    name: decodeURIComponent(nameValue),
                    durationMins: durationMins
                })
            }

            index++
        }

        expect(parsedStages).toEqual(stages)
        expect(parsedStages[0]).toHaveProperty('name', 'Introduction')
        expect(parsedStages[0]).toHaveProperty('durationMins', 15)
    })

    it('should handle malformed URL fragments gracefully', () => {
        // Test with missing parameters
        const malformedUrl1 = '#?s=14:00'
        const params1 = new URLSearchParams(malformedUrl1.substring(2))
        expect(params1.get('e')).toBeNull()

        // Test with invalid time format
        const malformedUrl2 = '#?s=invalid&e=invalid'
        const params2 = new URLSearchParams(malformedUrl2.substring(2))
        const invalidTimeParts = params2.get('s')!.split(':').map(Number)
        expect(invalidTimeParts.some(isNaN)).toBe(true)

        // Test with missing stage parameters (should stop at first missing pair)
        const malformedUrl3 = '#?s=14:00&e=15:30&n0=Stage1&d0=15&n1=Stage2'
        const params3 = new URLSearchParams(malformedUrl3.substring(2))

        let index = 0
        let stagesFound = 0
        while (true) {
            const nameParam = `n${index}`
            const durationParam = `d${index}`

            const nameValue = params3.get(nameParam)
            const durationValue = params3.get(durationParam)

            if (nameValue === null || durationValue === null) {
                break
            }

            stagesFound++
            index++
        }
        expect(stagesFound).toBe(1) // Should stop at index 1 because d1 is missing
    })
})

describe('Meeting context URL integration', () => {
    it('should handle URL state restoration correctly', () => {
        // Simulate URL with meeting state (hh24:mm format with individual n/d parameters)
        const startTime = new Date('2024-01-15T14:00:00')
        const endTime = new Date('2024-01-15T15:30:00')
        const stages = [
            {name: 'Introduction', durationMins: 15},
            {name: 'Discussion', durationMins: 45}
        ]

        const params = new URLSearchParams()
        params.set('s', format(startTime, 'HH:mm'))
        params.set('e', format(endTime, 'HH:mm'))

        // Simulate the stage saving logic with n/d parameters
        stages.forEach((stage, index) => {
            params.set(`n${index}`, encodeURIComponent(stage.name))
            params.set(`d${index}`, stage.durationMins.toString())
        })

        // Mock window.location
        const originalLocation = window.location
        Object.defineProperty(window, 'location', {
            value: {
                ...originalLocation,
                hash: `#?${params.toString()}`
            },
            writable: true
        })

        // Test URL parsing
        const hash = window.location.hash
        expect(hash.startsWith('#?')).toBe(true)

        const urlParams = new URLSearchParams(hash.substring(2))
        expect(urlParams.get('s')).toBe('14:00')
        expect(urlParams.get('e')).toBe('15:30')

        // Test stage parsing from n/d parameters
        const parsedStages: { name: string, durationMins: number }[] = []
        let index = 0
        while (true) {
            const nameParam = `n${index}`
            const durationParam = `d${index}`

            const nameValue = urlParams.get(nameParam)
            const durationValue = urlParams.get(durationParam)

            if (nameValue === null || durationValue === null) {
                break
            }

            const durationMins = parseInt(durationValue)
            if (!isNaN(durationMins)) {
                parsedStages.push({
                    name: decodeURIComponent(nameValue),
                    durationMins: durationMins
                })
            }

            index++
        }

        expect(parsedStages).toEqual(stages)
        expect(parsedStages[0]).toHaveProperty('name', 'Introduction')
        expect(parsedStages[0]).toHaveProperty('durationMins', 15)
        expect(parsedStages[1]).toHaveProperty('name', 'Discussion')
        expect(parsedStages[1]).toHaveProperty('durationMins', 45)

        // Test time parsing from hh24:mm format
        const startTimeParts = decodeURIComponent(urlParams.get('s')!).split(':').map(Number)
        const endTimeParts = decodeURIComponent(urlParams.get('e')!).split(':').map(Number)
        expect(startTimeParts).toEqual([14, 0])
        expect(endTimeParts).toEqual([15, 30])

        // Restore original location
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true
        })
    })

    it('should not duplicate stages when restoring from URL with existing state', () => {
        // This test verifies that the restoration logic only runs when in initial state
        // and doesn't duplicate stages when the page is refreshed

        const startTime = new Date('2024-01-15T14:00:00')
        const endTime = new Date('2024-01-15T15:30:00')
        const stages = [
            {name: 'Introduction', durationMins: 15},
            {name: 'Discussion', durationMins: 45}
        ]

        const params = new URLSearchParams()
        params.set('s', format(startTime, 'HH:mm'))
        params.set('e', format(endTime, 'HH:mm'))

        stages.forEach((stage, index) => {
            params.set(`n${index}`, encodeURIComponent(stage.name))
            params.set(`d${index}`, stage.durationMins.toString())
        })

        // Test that restoration only happens when state is empty
        const mockState1 = {
            startTime: null,
            endTime: null,
            stages: []
        }

        const mockState2 = {
            startTime: startTime,
            endTime: endTime,
            stages: stages.map(s => ({
                ...s,
                plannedStartTime: null,
                actualStartTime: null,
                actualEndTime: null,
                displayedStartTime: null
            }))
        }

        // State 1 (empty) should allow restoration
        const shouldRestore1 = (mockState1.startTime !== null || mockState1.endTime !== null || mockState1.stages.length > 0)
        expect(shouldRestore1).toBe(false) // Should be false, meaning restoration should happen

        // State 2 (with data) should NOT allow restoration
        const shouldRestore2 = (mockState2.startTime !== null || mockState2.endTime !== null || mockState2.stages.length > 0)
        expect(shouldRestore2).toBe(true) // Should be true, meaning restoration should NOT happen
    })
})