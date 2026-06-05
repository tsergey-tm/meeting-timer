import React from 'react';
import {useTranslation} from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = (lng: string) => {
        void i18n.changeLanguage(lng);
    };

    return (
        <div>
            <h2>{t('translation.common.welcome')}</h2>
            <p>{t('translation.timer.title')}</p>

            <button onClick={() => changeLanguage('en')}>
                {t('translation.common.english')}
            </button>
            <button onClick={() => changeLanguage('ru')}>
                {t('translation.common.russian')}
            </button>
        </div>
    );
};

export default LanguageSwitcher;