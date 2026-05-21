---
id: ru-tests-libs-common-src-lib-nest-module-14-should-use-featureconfigurationclass-with-di-581125147b
title: "EnvModel: Использует featureConfigurationClass через DI"
sidebar_label: "14 Использует featureConfigurationClass через DI"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Использует featureConfigurationClass через DI

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L619)
- **Строка**: 619

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

  });

  describe('NestJS modules with config model', () => {

  });
  describe('NestJS modules with anv and config model', () => {
  });
  describe('NestJS modules with multi-providing options', () => {
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
  });

  describe('NestJS modules with featureConfigurationClass', () => {

    // полный тест в блоке ниже

  });
});
```

## Код теста

```typescript
    it('should use featureConfigurationClass with DI', async () => {
      @ConfigModel()
      class DatabaseFeatureConfig {
        @ConfigModelProperty({ default: 'localhost' })
        host!: string;

        @ConfigModelProperty({ default: 5432 })
        port!: number;

        @ConfigModelProperty({ default: 'mydb' })
        database!: string;
      }

      // Service to be injected into config class
      @Injectable()
      class ConfigHelper {
        getDefaultHost() {
          return 'db.example.com';
        }
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'DatabaseModule',
      });

      @Injectable()
      class DatabaseService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<DatabaseFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { DatabaseModule } = createNestModule({
        moduleName: 'DatabaseModule',
        featureConfigurationModel: DatabaseFeatureConfig,
        sharedProviders: [DatabaseService, ConfigHelper],
      });

      // Config class with DI - constructor can inject dependencies
      @Injectable()
      class DatabaseConfigClass {
        constructor(
          private readonly configHelper: ConfigHelper,
        ) {}

        host = this.configHelper.getDefaultHost();
        port = 5432;
        database = 'production_db';
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DatabaseModule.forFeatureAsync({
            featureModuleName: 'MainDatabase',
            featureConfigurationClass: DatabaseConfigClass,
            inject: [ConfigHelper],
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
        providers: [ConfigHelper],
      }).compile();

      const databaseService = moduleRef.get(DatabaseService);
      const featureConfigs = databaseService.getFeatureConfigs();

      expect(featureConfigs).toBeDefined();
      expect(featureConfigs.length).toBeGreaterThanOrEqual(1);
      
      const config = featureConfigs[0];
      expect(config.featureModuleName).toBe('MainDatabase');
      expect(config.featureConfiguration).toMatchObject({
        host: 'db.example.com', // From injected ConfigHelper
        port: 5432,
        database: 'production_db',
      });
    });
```
