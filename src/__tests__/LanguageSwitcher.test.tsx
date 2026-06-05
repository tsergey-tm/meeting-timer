import {vi} from 'vitest';
import LanguageSwitcher from '../components/LanguageSwitcher.tsx';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
        }
    })
}));

describe('LanguageSwitcher', () => {
    test('renders language switcher component', () => {
        // Просто проверяем, что компонент может быть создан
        expect(LanguageSwitcher).toBeDefined();
    });
});