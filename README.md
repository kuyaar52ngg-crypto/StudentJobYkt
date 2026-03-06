# StudentJobYkt 🎓💼

**StudentJobYkt** — это современная платформа для поиска работы и стажировок, созданная специально для студентов в Якутске. Проект помогает молодым специалистам находить первые возможности для карьеры, а работодателям — талантливых и энергичных сотрудников.

## 🚀 Стек технологий

Проект построен на современном и производительном стеке:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TailwindCSS](https://tailwindcss.com/)
- **Backend**: [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **База данных**: PostgreSQL (через [Prisma ORM](https://www.prisma.io/))
- **Аутентификация**: [NextAuth.js](https://next-auth.js.org/)
- **Управление состоянием**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Анимации**: [GSAP](https://gsap.com/)

## 🛠️ Начало работы

### Предварительные требования

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

## 📁 Структура проекта

- `src/app` — Страницы и API роуты (Next.js App Router)
- `src/components` — Общие React компоненты
- `prisma` — Схема базы данных и конфигурация Prisma
- `public` — Статические файлы (изображения, шрифты)

## 📄 Лицензия

Этот проект является частной собственностью.
