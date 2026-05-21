---
id: ru-tests-common-nest-application-01-app-env-validation-error-8564cc202d
title: "EnvModel: Возвращает ошибку, если option of env not set"
sidebar_label: "01 Возвращает ошибку, если option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает ошибку, если option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Загрузка приложения**: Убеждаемся, что bootstrapNestApplication валидирует модели окружения
- **Обработка кода выхода**: Проверяем, что процесс завершается с кодом 1 при ошибке валидации
- **Интеграция EnvModel**: Тестируем валидацию окружения в полном контексте приложения
- **Мокирование Process Exit**: Подтверждаем правильную обработку process.exit во время тестов

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-application/utils.spec.ts#L40-L62)
- **Строки**: 40-62

## Подготовительный код

Тест мокирует `process.exit` для предотвращения фактического завершения процесса во время тестирования:

```typescript
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { createNestModule } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

// Мокируем process.exit
let originalExit: any;
let exitStatus: any;

beforeAll(() => {
  originalExit = process.exit;
  process.exit = (status) => {
    exitStatus = status;
    return null as never;
  };
});

afterAll(() => {
  process.exit = originalExit;
});

afterEach(() => {
  exitStatus = null;
});
```

## Код теста

```typescript
it('should return error if option of env not set', async () => {
  @EnvModel()
  class AppEnv {
    @EnvModelProperty()
    @IsNotEmpty()
    option!: string;
  }

  const { AppModule } = createNestModule({
    moduleName: 'AppModule',
    environmentsModel: AppEnv,
  });

  await bootstrapNestApplication({
    project: { name: 'TestApp', description: 'Test application' },
    modules: {
      system: [DefaultNestApplicationInitializer.forRoot()],
      feature: [AppModule.forRoot()],
    },
  });

  expect(exitStatus).toEqual(1);
});
```

## Что делает этот тест

1. **Мокирует process.exit** для захвата кодов выхода без завершения процесса теста
2. **Создает EnvModel** с обязательным полем `option`
3. **Создает NestModule** используя `createNestModule` с EnvModel
4. **Пытается загрузить** приложение без установки обязательной переменной окружения
5. **Ожидает**, что загрузка вызовет `process.exit(1)` из-за ошибки валидации
6. **Проверяет код выхода** равен 1, что указывает на неудачный запуск приложения

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.