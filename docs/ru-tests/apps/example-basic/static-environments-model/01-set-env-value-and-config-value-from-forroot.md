---
id: ru-tests-apps-example-basic-src-app-static-environments-model-01-set-env-value-and-config-value-from-forroot-dc700ff4a3
title: "EnvModel: Set env value and config value from forRoot"
sidebar_label: "01 Set env value and config value from forRoot"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Set env value and config value from forRoot

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [static-environments-model-with-boolean.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/static-environments-model/static-environments-model-with-boolean.spec.ts#L19)
- **Строка**: 19

## Подготовительный код

```typescript
import {
  BooleanTransformer,
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { join } from 'path';

describe('staticEnvironmentsModel', () => {
  it('set env value and config value from forRoot', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
```

## Код теста

```typescript
  it('set env value and config value from forRoot', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
      })
      usePipes?: boolean | null;
    }

```
