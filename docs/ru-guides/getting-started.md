---
sidebar_position: 2
---

# Начало работы

### Создание нового приложения

Команды для создания пустого приложения NestJS-mod

```bash
# Создание пустого nx проекта
npx --yes create-nx-workspace@20.3.0 --name=project-name --preset=apps --interactive=false --ci=skip

# Переход в созданный проект
cd project-name

# Установка всех необходимых основных dev-зависимостей
npm install --save-dev @nestjs-mod/schematics@latest

# Создание приложения NestJS-mod
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/app-name --name=app-name --projectNameAndRootFormat=as-provided --strict=true
```

Запуск созданного приложения

```bash
# Подготовка всех файлов
npm run manual:prepare

# Запуск приложения в режиме разработки
npm run serve:dev:app-name

# Сборка и запуск приложения в продакшн режиме

## Сборка
npm run build:prod:app-name

## Запуск
npm run start:prod:app-name
```

### Создание новой библиотеки

Команды для создания пустой библиотеки NestJS-mod

```bash
# Создание библиотеки NestJS-mod
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=feature-name --buildable --publishable --directory=libs/feature-name --simpleName=true --strict=true --linter=eslint --unitTestRunner=jest
```

Добавление созданной библиотеки в `apps/app-name/src/main.ts`

```ts

// Пример без опций
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot()],
  }
});

// Пример с опциями
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      configuration: { optionsName: 'options name' },
    })],
  }
});


// По умолчанию в примере приложение ищет env по ключу `APP_NAME_ENV_NAME`, но вы можете переопределить его, например:
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      environments: { envName: 'env name' },
    })],
  }
});
```

### Создание отчета об инфраструктуре

Вы можете сгенерировать отчет для всех модулей и их конфигураций.

```bash
# Сборка всех приложений и библиотек
npm run build

# Генерация отчета в формате markdown
npm run docs:infrastructure
```

После этого файл `INFRASTRUCTURE.MD` появится в папке приложения `apps/app-name`.
