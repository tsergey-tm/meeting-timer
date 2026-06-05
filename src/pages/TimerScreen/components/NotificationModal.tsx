import Modal from 'react-modal'
import {useTranslation} from 'react-i18next';

interface NotificationModalProps {
    isOpen: boolean
    onRequestClose: () => void
    handleNotificationPermission: (mode: string) => Promise<void>
}

const NotificationModal = ({
                               isOpen,
                               onRequestClose,
                               handleNotificationPermission
                           }: NotificationModalProps) => {
    const {t} = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            contentLabel={t("translation.notification.title")}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 2000
                },
                content: {
                    inset: '50% auto auto 50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '400px',
                    width: '90%',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    outline: 'none',
                    zIndex: 2001
                }
            }}
        >
            <div className="text-center p-5">
                <h2 className="text-xl font-bold text-gray-900 pb-1">Notification Settings</h2>
                <p className="text-gray-600 pb-4">Choose how you would like to receive meeting notifications:</p>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            void handleNotificationPermission('both')
                        }}
                        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                        Both notifications and sounds
                    </button>
                    <button
                        onClick={() => {
                            void handleNotificationPermission('notifications')
                        }}
                        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                        Notifications only
                    </button>
                    <button
                        onClick={() => {
                            void handleNotificationPermission('sound_only')
                        }}
                        className="w-full px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                    >
                        Sound only
                    </button>
                    <button
                        onClick={() => {
                            void handleNotificationPermission('none')
                        }}
                        className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                    >
                        No notifications
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default NotificationModal