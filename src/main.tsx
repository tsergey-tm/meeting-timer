import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import Modal from 'react-modal'
import './index.css'
import App from './App.tsx'
import './localization/i18n'

Modal.setAppElement('#root')

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
