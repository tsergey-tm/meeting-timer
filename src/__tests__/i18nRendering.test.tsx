import {beforeEach, describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
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

    it('renders localized labels in LanguageSwitcher', () => {
        render(<LanguageSwitcher/>);

        expect(screen.getByRole('button', {name: 'English'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Russian'})).toBeInTheDocument();
    });
});


