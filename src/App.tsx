import TimerScreen from './pages/TimerScreen'
import {MeetingProvider} from './context/MeetingContext'
import "./App.css"

function App() {
    return (
        <MeetingProvider>
            <TimerScreen/>
        </MeetingProvider>
    )
}

export default App
