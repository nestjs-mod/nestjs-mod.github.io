---
id: ru-tests-libs-common-src-lib-nest-module-08-should-return-option-value-from-service-eb8a5d372a
title: "EnvModel: Возвращает значение опции из сервиса"
sidebar_label: "08 Возвращает значение опции из сервиса"
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
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-module/utils.spec.ts#L236)
- **Строка**: 236

## Подготовительный код

```typescript
import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { BehaviorSubject } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

describe('NestJS modules: Utils', () => {
  describe('NestJS modules with env model', () => {
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

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @EnvModel({ name: 'model name', description: 'model description' })
      class AppEnv {
        @EnvModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toMatchObject({
        info: {
          modelPropertyOptions: [{ description: 'option description', originalName: 'option' }],
          modelOptions: {
            name: 'model name',
            description: 'model description',
            originalName: 'AppEnv',
          },
          validations: {
            option: {
              constraints: { isNotEmpty: 'option should not be empty' },
            },
          },
        },
      });
    });

    it('should return option value from service use env', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });
    it('should return option value from service use env and contextName', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['CTX_OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ contextName: 'CTX' })],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @EnvModel()
      class App1Env {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appEnv: App1Env) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        environmentsModel: App1Env,
        sharedProviders: [App1Service],
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appService: App1Service) {}

        getEnv() {
          return this.appService.getEnv();
        }
      }

      @Module({
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      })
      class App2Module {}

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot({}), App2Module],
      }).compile();
      const app2Service = moduleRef.get(App2Service);

      expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
    });
  });

  describe('NestJS modules with config model', () => {
    it('should return error if option of env not set', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @ConfigModel({ name: 'model name', description: 'model description' })
      class AppConfig {
        @ConfigModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toMatchObject({
        info: {
          modelPropertyOptions: [{ description: 'option description', originalName: 'option' }],
          modelOptions: {
            name: 'model name',
            description: 'model description',
            originalName: 'AppConfig',
          },
          validations: {
            option: {
              constraints: { isNotEmpty: 'option should not be empty' },
            },
          },
        },
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
        providers: [AppService],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ configuration: { option: 'value1' } })],
      }).compile();
```
