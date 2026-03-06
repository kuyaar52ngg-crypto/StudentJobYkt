Убедитесь, что у вас установлены:
- [Node.js](https://nodejs.org/) (версия 18 или выше)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) или [pnpm](https://pnpm.io/)

### Установка

1. Клонируйте репозиторий:
   ```bash
   git clone git@github.com:kuyaar52ngg-crypto/StudentJobYkt.git
   cd StudentJobYkt
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Настройте переменные окружения:
   Создайте файл `.env` в корне проекта и добавьте необходимые данные (см. `.env.example`, если есть).

4. Запустите миграции базы данных:
   ```bash
   npx prisma db push
   ```

### Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере, чтобы увидеть результат.
