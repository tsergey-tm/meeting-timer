import React from 'react';
import {useTranslation} from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = (lng: string) => {
        void i18n.changeLanguage(lng);
    };

    return (
        <div>
            <h2>{t('common.welcome')}</h2>

            <button onClick={() => changeLanguage('en')}>
                {t('common.english')}
            </button>
            <button onClick={() => changeLanguage('ru')}>
                {t('common.russian')}
            </button>
        </div>
    );
};

export default LanguageSwitcher;