---
id: ru-tests-apps-example-basic-src-app-01-should-activate-onmoduleinit-only-once-6284b19862
title: "EnvModel: Activate onModuleInit only once"
sidebar_label: "01 Activate onModuleInit only once"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Activate onModuleInit only once

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [shared-providers.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/shared-providers.spec.ts#L13)
- **Строка**: 13

## Подготовительный код

```typescript
import {
  bootstrapNestApplication,
  ConfigModel,
  ConfigModelProperty,
  createNestModule,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

describe('NestJS modules with shared providers and imports', () => {
  it('should activate onModuleInit only once', async () => {
    let constructorSharedCount = 0;
    let onModuleInitSharedCount = 0;
    let onModuleDestroySharedCount = 0;

    let constructorLocalCount = 0;
    let onModuleInitLocalCount = 0;
    let onModuleDestroyLocalCount = 0;

    @ConfigModel()
    class SubModuleWithSharedServiceFeatureConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @ConfigModel()
    class SubModuleWithSharedServiceConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @EnvModel()
    class SubModuleWithSharedServiceEnv {
      @EnvModelProperty()
      increment!: number;
    }

    @Injectable()
```

## Код теста

```typescript
  it('should activate onModuleInit only once', async () => {
    let constructorSharedCount = 0;
    let onModuleInitSharedCount = 0;
    let onModuleDestroySharedCount = 0;

    let constructorLocalCount = 0;
    let onModuleInitLocalCount = 0;
    let onModuleDestroyLocalCount = 0;

    @ConfigModel()
    class SubModuleWithSharedServiceFeatureConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @ConfigModel()
    class SubModuleWithSharedServiceConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @EnvModel()
    class SubModuleWithSharedServiceEnv {
      @EnvModelProperty()
      increment!: number;
    }
```
