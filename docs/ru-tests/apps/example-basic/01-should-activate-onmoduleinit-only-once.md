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

- **Файл**: [shared-providers.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/shared-providers.spec.ts#L13)
- **Строка**: 13

## Подготовительный код

```typescript
import {
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

describe('NestJS modules with shared providers and imports', () => {
  // полный тест в блоке ниже
});
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

    @Injectable()
    class LocalService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('LocalService');
        constructorLocalCount = constructorLocalCount + 1;
      }
      onModuleInit() {
        onModuleInitLocalCount = onModuleInitLocalCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroyLocalCount = onModuleDestroyLocalCount + 1;
      }
    }

    @Injectable()
    class SharedService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('SharedService');
        constructorSharedCount = constructorSharedCount + 1;
      }
      onModuleInit() {
        onModuleInitSharedCount = onModuleInitSharedCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroySharedCount = onModuleDestroySharedCount + 1;
      }
    }

    const { SubModuleWithSharedService } = createNestModule({
      moduleName: 'SubModuleWithSharedService',
      providers: [LocalService],
      sharedProviders: [SharedService],
      featureConfigurationModel: SubModuleWithSharedServiceFeatureConfig,
      configurationModel: SubModuleWithSharedServiceConfig,
      environmentsModel: SubModuleWithSharedServiceEnv,
    });

    const { AppModuleWithSharedService } = createNestModule({
      moduleName: 'AppModuleWithSharedService',
      sharedImports: [SubModuleWithSharedService.forFeature()],
    });

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SubModuleWithSharedService.forRootAsync({
            configuration: {
              increment: 1,
            },
          }),
          AppModuleWithSharedService.forRootAsync(),
        ],
      },
    });

    await app.close();

    expect(constructorSharedCount).toEqual(1);
    expect(onModuleInitSharedCount).toEqual(1);
    expect(onModuleDestroySharedCount).toEqual(1);

    expect(constructorLocalCount).toEqual(1);
    expect(onModuleInitLocalCount).toEqual(1);
    expect(onModuleDestroyLocalCount).toEqual(1);
  });
```
