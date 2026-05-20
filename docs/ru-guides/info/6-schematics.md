---
sidebar_position: 6
---

# Схематики

Целевой тип приложения для использования NestJS-mod — монорепозиторий на https://nx.dev.

Поскольку шаблон NestJS-mod немного отличается от nx, существуют дополнительные правила проверки качества кода и более строгие правила конфигурации typescript, для более быстрого начала разработки приложений на этой архитектуре были разработаны наборы схематиков https://www.npmjs.com/package/@nestjs-mod/schematics для генерации кода.

## Схематик для создания базового приложения

### Команды для создания пустого приложения NestJS-mod

```bash
# Создание пустого nx проекта
npx --yes create-nx-workspace@17.2.8 --name=project-name --preset=empty --interactive=false --nx-cloud=false

# Переход в созданную папку
cd project-name

# Установка схематика для генерации приложения NestJS-mod
npm install --save-dev @nestjs-mod/schematics@latest

# Создание приложения NestJS-mod
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/app-name --name=app-name --projectNameAndRootFormat=as-provided --strict=true
```

> Пример сгенерированного приложения: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/apps/app-name

### Запуск созданного приложения в режиме разработки

```bash
# Подготовка всех файлов
npm run manual:prepare

# Запуск приложения в режиме отслеживания
npm run serve:dev:app-name
```

### Сборка и запуск приложения в продакшн режиме

```bash
## Сборка приложений
npm run build:prod:app-name

## Запуск собранного приложения
npm run start:prod:app-name
```

### Интегрировано:

- Pino - логгер для потоковых логов, сайт: https://github.com/pinojs/pino.
- Terminus - для получения статуса приложения, сайт: https://docs.nestjs.com/recipes/terminus.
- InfrastructureMarkdownReportGenerator - генератор документации по инфраструктуре ([пример](https://github.com/nestjs-mod/nestjs-mod-example/blob/master/apps/app-name/INFRASTRUCTURE.MD)).
- PM2 - генератор скриптов для запуска приложения, сайт: https://pm2.keymetrics.io/

## Схематик для создания типичной библиотеки NestJS-mod

### Команда для создания пустой библиотеки

```bash
# Создание библиотеки NestJS-mod
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=feature-name --buildable --publishable --directory=libs/feature-name --simpleName=true --strict=true --linter=eslint --unitTestRunner=jest
```

> Пример сгенерированной библиотеки: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/libs/feature-name

### Интегрировано:

- Команды для создания релизов для Github - action: https://github.com/TheUnderScorer/nx-semantic-release.
- Пустые классы конфигурации и переменных окружения - пример: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/libs/feature-name/src/lib.
