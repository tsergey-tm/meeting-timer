import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируем переводы
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';
// Импортируем расширение типов
import './i18n-types';

// Определяем типы для ключей перевода
export type TranslationKeys = keyof typeof enTranslations.translation;

// Настройки i18next
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations.translation
            },
            ru: {
                translation: ruTranslations.translation
            }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;