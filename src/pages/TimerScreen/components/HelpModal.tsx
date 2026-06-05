import Modal from 'react-modal';
import {useTranslation} from 'react-i18next';

interface HelpModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
}

const HelpModal = ({isOpen, onRequestClose}: HelpModalProps) => {
    const {t} = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            contentLabel={t("translation.help.title")}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                },
                content: {
                    inset: '50% auto auto 50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '600px',
                    width: '90%',
                    padding: 0,
                    overflow: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    outline: 'none',
                    zIndex: 1001
                }
            }}
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Meeting Timer Help</h2>
                    <button
                        onClick={onRequestClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 text-gray-700">
                    <p>
                        <strong>How to use the Meeting Timer:</strong>
                    </p>

                    <ol className="list-decimal list-inside space-y-2">
                        <li>At the beginning of each meeting, select how you want to be notified about upcoming
                            stages.
                        </li>
                        <li>Set the start and end time for your meeting.</li>
                        <li>Define the stages and their durations.</li>
                        <li>One minute before a stage change and during stage transitions, you'll receive
                            notifications.
                        </li>
                        <li>When you actually start the meeting, click "Start meeting".</li>
                        <li>When each stage is completed, click the "Next" button for that stage.</li>
                        <li>The assistant will track delays and show how stage start times shift if you're running
                            late.
                        </li>
                        <li>You can save meetings using the URL.</li>
                    </ol>

                    <p className="mt-4">
                        <strong>Features:</strong>
                    </p>

                    <ul className="list-disc list-inside space-y-1">
                        <li>Visual stage tracking with current stage highlighting</li>
                        <li>Automatic time adjustment for late meetings</li>
                        <li>Notification options (browser notifications, sound only, or no notifications)</li>
                        <li>URL-based meeting state saving</li>
                    </ul>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onRequestClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;