import {beforeEach, describe, expect, it} from 'vitest';
import '@testing-library/jest-dom';
import i18n from '../localization/i18n';

describe('i18n key rendering', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('en');
    });

    it('resolves app title key in English', () => {
        expect(i18n.t('app.title')).toBe('Meeting Timer');
    });

    it('resolves app title key in Russian', async () => {
        await i18n.changeLanguage('ru');

        expect(i18n.t('app.title')).toBe('Таймер встречи');
    });
});


