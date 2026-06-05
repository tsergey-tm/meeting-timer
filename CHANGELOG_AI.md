# Changelog

All notable changes to this project will be documented in this file.

## [2026-06-04 09:35] Задача: Исправление тестов для логики завершения этапов

- **Статус:** Успешно выполнено ✅
- **Созданные/Измененные файлы:** src/__tests__/reducer.test.tsx
- **Линтер:** Пройден без ошибок и варнингов 🛡️
- **Тесты:** Пройдены успешно (Vitest) 🧪
- **Краткое описание:** Исправлены тесты для соответствия новой логике завершения этапов, которая теперь позволяет
  завершать только текущий этап. Тесты были обновлены для корректного отражения этого поведения.

## [2026-06-05 10:40] Задача: Исправление отображения переводов i18n

- **Статус:** Успешно выполнено ✅
- **Созданные/Измененные файлы:** src/pages/TimerScreen/TimerScreen.tsx,
  src/pages/TimerScreen/components/TimerDisplay.tsx, src/pages/TimerScreen/components/StageList.tsx,
  src/pages/TimerScreen/components/HelpModal.tsx, src/pages/TimerScreen/components/NotificationModal.tsx,
  src/pages/MeetingSetup/MeetingSetup.tsx, src/components/LanguageSwitcher.tsx, src/localization/locales/en.json,
  src/localization/locales/ru.json, src/__tests__/i18nRendering.test.tsx, CHANGELOG_AI.md
- **Линтер:** Пройден без ошибок и варнингов 🛡️
- **Тесты:** Пройдены успешно (Vitest) 🧪
- **Краткое описание:** Убрана лишняя часть ключа `translation.` в вызовах `t(...)`, из-за которой вместо перевода
  показывались ключи. Добавлены недостающие ключи локализации для переключателя языка и тесты на корректное разрешение
  переводов для `en` и `ru`.

## [2026-06-05 10:50] Задача: Изменение компонента LanguageSwitcher на иконку с модальным окном

- **Статус:** Успешно выполнено ✅
- **Созданные/Измененные файлы:** src/components/LanguageSwitcher.tsx
- **Линтер:** Пройден без ошибок и варнингов 🛡️
- **Тесты:** Пройдены успешно (Vitest) 🧪
- **Краткое описание:** Компонент LanguageSwitcher изменен с отображения кнопок выбора языка на отображение иконки,
  которая открывает модальное окно с выбором языка. Использована иконка GlobeIcon из @radix-ui/react-icons. Реализована
  функциональность смены языка через модальное окно.