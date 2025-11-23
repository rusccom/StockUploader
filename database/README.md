# Database Setup and Migration

## Initial Setup

Для создания базы данных с нуля выполните:

```bash
mysql -u your_user -p your_database < schema.sql
```

## Migration: Add Upload Statistics

Если у вас уже существует база данных, выполните миграцию для добавления отслеживания статистики загрузки:

```bash
mysql -u your_user -p your_database < migration-add-upload-stats.sql
```

### Что добавляет миграция:

- `uploaded_count` (INT) - количество успешно загруженных фотографий на Adobe Stock
- `uploaded_at` (DATETIME) - дата и время последней загрузки

### Проверка миграции:

```sql
DESCRIBE topics;
```

Должны появиться новые поля:
- `uploaded_count` - по умолчанию 0
- `uploaded_at` - по умолчанию NULL

## Schema Structure

### Table: `topics`

Хранит темы для генерации изображений:

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| topic_name | VARCHAR(255) | Название темы |
| image_count | INT | Количество изображений для генерации |
| model | VARCHAR(50) | Модель генерации (flux/imagen4) |
| upscale_model | VARCHAR(50) | Модель апскейла (flux-vision/seedvr) |
| status | VARCHAR(50) | Статус (new/processing/done) |
| created_at | DATETIME | Дата создания |
| uploaded_count | INT | **NEW** Количество загруженных фото |
| uploaded_at | DATETIME | **NEW** Дата загрузки |

### Table: `adobe_credentials`

Хранит учетные данные Adobe Stock API (single-row table):

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Always 1 |
| client_id | VARCHAR(255) | Adobe API Client ID |
| client_secret | VARCHAR(255) | Adobe API Client Secret |
| access_token | TEXT | Cached access token (optional) |
| token_expires_at | DATETIME | Token expiration (optional) |
| updated_at | DATETIME | Last update timestamp |

