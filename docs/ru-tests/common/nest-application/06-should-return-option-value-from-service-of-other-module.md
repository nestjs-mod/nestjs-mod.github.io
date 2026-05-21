---
id: ru-tests-libs-common-src-lib-nest-application-06-should-return-option-value-from-service-of-other-module-399d0f8f10
title: "EnvModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "06 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-application/utils.spec.ts#L218)
- **Строка**: 218

## Подготовительный код

```typescript
/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import {
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import { InjectableFeatureConfigurationType } from '../nest-module/types';
import { createNestModule, getNestModuleDecorators } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

describe('NestJS application: Utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalExit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  describe('NestJS application with env model', () => {

  });

  describe('NestJS application with config model', () => {

    // полный тест в блоке ниже
  });
  describe('NestJS application with anv and config model', () => {
  });
  describe('NestJS application with multi-providing options', () => {
  });
  describe('NestJS application get markdown of infrastructure', () => {
  });
});
```

## Код теста

```typescript
    it('should return option value from service of other module', async () => {
      @ConfigModel()
      class App1Config {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appConfig: App1Config) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        configurationModel: App1Config,
        sharedProviders: [App1Service],
      });
      const { InjectService } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @Injectable()
      class App2Service {
        constructor(
          @InjectService(App1Service)
          private readonly appService: App1Service,
        ) {}

        getConfig() {
          return this.appService.getConfig();
        }
      }
      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot({ configuration: { option: 'value1' } }), App2Module.forRoot()],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
    });
```
