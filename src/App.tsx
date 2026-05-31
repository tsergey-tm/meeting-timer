import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from 'react-router-dom'
import TimerScreen from './pages/TimerScreen'
import {MeetingProvider} from './context/MeetingContext'
import "./App.css"

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<TimerScreen/>}/>
    )
)

function App() {
    return (
        <MeetingProvider>
            <RouterProvider router={router}/>
        </MeetingProvider>
    )
}

export default App
