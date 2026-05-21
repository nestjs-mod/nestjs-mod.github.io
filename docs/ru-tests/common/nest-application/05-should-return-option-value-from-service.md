---
id: ru-tests-libs-common-src-lib-nest-application-05-should-return-option-value-from-service-c7c0514f71
title: "EnvModel: Возвращает значение опции из сервиса"
sidebar_label: "05 Возвращает значение опции из сервиса"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-application/utils.spec.ts#L182)
- **Строка**: 182

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
    it('should return option value from service', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appConfig: AppConfig) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
        sharedProviders: [AppService],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot({ configuration: { option: 'value1' } })],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getConfig()).toMatchObject({ option: 'value1' });
    });
```
