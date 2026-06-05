import 'react-i18next';
import type {TranslationKeys} from './i18n';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: TranslationKeys;
        };
    }
}