import * as React from 'react'
import {useState} from 'react'
import {format} from 'date-fns'
import {CalendarIcon, ClockIcon, Pencil2Icon, PlusIcon, TrashIcon} from '@radix-ui/react-icons'
import {useMeeting} from "../context/useMeeting.ts";

interface MeetingSetupProps {
    onClose?: () => void
}

const MeetingSetup: React.FC<MeetingSetupProps> = ({onClose}) => {
    const {state, dispatch, validateMeeting, getTotalStageDuration, getMeetingDuration} = useMeeting()
    const [startTime, setStartTime] = useState(state.startTime ? format(state.startTime, 'HH:mm') : '')
    const [endTime, setEndTime] = useState(state.endTime ? format(state.endTime, 'HH:mm') : '')
    const [newStageName, setNewStageName] = useState('')
    const [newStageDuration, setNewStageDuration] = useState('')
    const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null)
    const [editDuration, setEditDuration] = useState('')
    const [editName, setEditName] = useState('')

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const [hours, minutes] = e.target.value.split(':').map(Number)
            const today = new Date()
            const time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
            dispatch({type: 'SET_START_TIME', payload: time})
            setStartTime(e.target.value)
        } catch {
            // Ignore invalid time format
        }
    }

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const [hours, minutes] = e.target.value.split(':').map(Number)
            const today = new Date()
            const time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
            dispatch({type: 'SET_END_TIME', payload: time})
            setEndTime(e.target.value)
        } catch {
            // Ignore invalid time format
        }
    }

    const handleAddStage = (e: React.SubmitEvent) => {
        e.preventDefault()
        if (newStageName.trim() === '' || newStageDuration === '') return

        const duration = parseInt(newStageDuration)
        if (isNaN(duration) || duration <= 0) return

        dispatch({
            type: 'ADD_STAGE',
            payload: {
                name: newStageName.trim(),
                duration: duration,
                actualEndTime: null,
                actualStartTime: null,
                plannedStartTime: null,
                displayedStartTime: null
            }
        })

        setNewStageName('')
        setNewStageDuration('')
    }

    const handleUpdateStage = (stageIndex: number, newDuration: number) => {
        if (isNaN(newDuration) || newDuration <= 0) return
        dispatch({
            type: 'UPDATE_STAGE',
            payload: {index: stageIndex, duration: newDuration, ...(editName.trim() !== '' && {name: editName.trim()})}
        })
        setEditingStageIndex(null)
        setEditDuration('')
        setEditName('')
    }

    const handleRemoveStage = (stageIndex: number) => {
        dispatch({type: 'REMOVE_STAGE', payload: stageIndex})
        if (editingStageIndex === stageIndex) {
            setEditingStageIndex(null)
            setEditDuration('')
        }
    }

    const handleStartEditing = (stageIndex: number, currentDuration: number, currentName: string) => {
        setEditingStageIndex(stageIndex)
        setEditDuration(currentDuration.toString())
        setEditName(currentName)
    }

    const {isValid, errors} = validateMeeting()
    const totalStageDuration = getTotalStageDuration()
    const meetingDuration = getMeetingDuration()

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <ClockIcon className="h-8 w-8 text-blue-600 mr-3"/>
                        <h1 className="text-2xl font-bold text-gray-900">Meeting Timer Setup</h1>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Start Time</label>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2"/>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={handleStartTimeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting End Time</label>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2"/>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={handleEndTimeChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {errors.includes('Meeting end time must be after start time') && (
                                <p className="mt-1 text-sm text-red-600">End time must be after start time</p>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Meeting Stages</h2>
                                <span className="text-sm text-gray-600">
                  Total stage time: {totalStageDuration} min{meetingDuration > 0 && `, meeting: ${meetingDuration} min, free time: ${meetingDuration - totalStageDuration}`}
                </span>
                            </div>

                            {meetingDuration > 0 && totalStageDuration > meetingDuration && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                                    <p className="text-sm text-yellow-700">⚠️ Total stage time exceeds meeting duration
                                        by {totalStageDuration - meetingDuration} minutes</p>
                                </div>
                            )}

                            <div className="space-y-3 mb-4">
                                {state.stages.map((stage, index) => (
                                    <div key={index}
                                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{stage.name}</div>
                                            <div className="text-sm text-gray-600">{stage.duration} minutes</div>
                                        </div>
                                        {editingStageIndex === index ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    value={editDuration}
                                                    onChange={(e) => setEditDuration(e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => handleUpdateStage(index, parseInt(editDuration) || 0)}
                                                    className="p-1 text-green-600 hover:text-green-800"
                                                    aria-label="Save"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setEditingStageIndex(null)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    aria-label="Cancel"
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleStartEditing(index, stage.duration, stage.name)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                    aria-label="Edit stage"
                                                >
                                                    <Pencil2Icon className="h-4 w-4"/>
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveStage(index)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    aria-label="Remove stage"
                                                >
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddStage} className="space-y-3">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Stage name"
                                        value={newStageName}
                                        onChange={(e) => setNewStageName(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Duration (min)"
                                        value={newStageDuration}
                                        onChange={(e) => setNewStageDuration(e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isValid && onClose) {
                                        onClose()
                                    }
                                }}
                                disabled={!isValid}
                                className={`flex-1 px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isValid ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400 cursor-not-allowed focus:ring-gray-500'}`}
                            >
                                Save Configuration
                            </button>
                        </div>

                        {!isValid && errors.length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400">
                                <h3 className="text-sm font-medium text-red-800">Please fix these errors:</h3>
                                <ul className="mt-2 text-sm text-red-700">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MeetingSetup