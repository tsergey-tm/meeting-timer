import React, {useState} from 'react';
import Modal from 'react-modal';
import {useTranslation} from 'react-i18next';
import {GlobeIcon} from '@radix-ui/react-icons';

const LanguageSwitcher: React.FC = () => {
    const {t, i18n} = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        void i18n.changeLanguage(lng);
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full transition-colors"
                aria-label="Select language"
            >
                <GlobeIcon className="h-6 w-6"/>
            </button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                contentLabel="Select Language"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000
                    },
                    content: {
                        inset: '50% auto auto 50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '300px',
                        width: '90%',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        outline: 'none',
                        zIndex: 1001,
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto'
                    }
                }}
            >
                <div className="flex flex-col space-y-4 items-stretch p-8">
                    <h3 className="text-lg text-center font-semibold text-gray-900">{t('i18n.selectLanguage')}</h3>
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`px-4 py-2 rounded-md ${
                            i18n.language === 'en'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {t('i18n.english')}
                    </button>
                    <button
                        onClick={() => changeLanguage('ru')}
                        className={`px-4 py-2 rounded-md ${
                            i18n.language === 'ru'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {t('i18n.russian')}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        {t('i18n.close')}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default LanguageSwitcher;