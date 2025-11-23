# Stock Uploader - Быстрая настройка

## Что нужно получить

### 1. База данных MySQL
- Создать MySQL БД (8.0+)
- Выполнить: `mysql < database/schema.sql`
- Получить строку подключения: `mysql://user:password@host:port/database`

### 2. API ключи

**OpenRouter** (для Gemini LLM)
- Регистрация: https://openrouter.ai/
- Получить API key в dashboard

**FAL.ai** (генерация и upscale изображений)
- Регистрация: https://fal.ai/
- Получить API key в settings

**Adobe I/O** (для Adobe Stock API)
- Создать проект: https://developer.adobe.com/console
- Получить: Client ID, Client Secret

**Adobe Stock SFTP** (загрузка фото)
- Adobe Stock Contributor Portal → Submit → Upload Options → FTP/SFTP
- Получить: SFTP Host, Username, Password

**GitHub Personal Access Token** (ручной запуск worker)
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Права: `workflow` (минимум) или `repo` (полный доступ)
- Получить: токен (сохранить, показывается один раз!)

## Куда записать

### Cloudflare Pages (переменные окружения)
```
DB_URL = mysql://user:password@host:port/database
GITHUB_TOKEN = ghp_xxxxxxxxxxxxx
GITHUB_OWNER = ваш_username
GITHUB_REPO = StockUploader
```

### GitHub Secrets (Settings → Secrets → Actions)
```
DB_URL = mysql://user:password@host:port/database
OPENROUTER_API_KEY = sk-or-v1-xxxxxxxxxxxxx
FAL_KEY = xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Веб-интерфейс (после деплоя)
- Adobe Stock Settings → ввести Client ID, Client Secret
- Adobe Stock Settings → ввести SFTP Host, Username, Password

## Порядок деплоя

1. Настроить БД → выполнить schema.sql
2. Cloudflare Pages → подключить GitHub repo → добавить переменные
3. GitHub Secrets → добавить 3 секрета
4. Открыть сайт → настроить Adobe credentials в интерфейсе
5. Добавить тестовую тему → запустить вручную через кнопку "Run Worker Now"

