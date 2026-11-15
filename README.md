# DRIP & COIL — production architecture

## Что здесь есть
- современный адаптивный магазин;
- Supabase Auth для регистрации/входа;
- Profiles;
- каталог и категории: electronics / clothing / vape / liquids;
- корзина;
- создание заказов;
- история и статусы заказов;
- новости;
- Telegram support;
- RLS-политики;
- заготовка Telegram Edge Function;
- структура для админ-роли.

## Запуск
1. Создайте проект Supabase.
2. SQL Editor → вставьте `supabase/schema.sql` → Run.
3. Зарегистрируйте аккаунт через сайт.
4. В Supabase Table Editor → profiles найдите свой UUID и поставьте `role=admin`.
5. Скопируйте `config.example.js` в `config.js` и вставьте Project URL + anon/public key.
6. Загрузите файлы в GitHub.
7. Для Vercel импортируйте GitHub repository. Vercel сам отдаст HTTPS-домен.

## Важно
Никогда не помещайте `service_role` key в браузер. Для фронтенда используйте только публичный anon/publishable key с включёнными RLS.

## Telegram
Для уведомлений нужен Telegram Bot Token и Chat ID. Их задают как secrets в Supabase Edge Function. Никогда не кладите bot token в `app.js`.

Deployment update - Drip & Coil
