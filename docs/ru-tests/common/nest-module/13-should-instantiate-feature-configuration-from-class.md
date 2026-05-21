---
id: ru-tests-libs-common-src-lib-nest-module-13-should-instantiate-feature-configuration-from-class-62ad0e2ceb
title: "EnvModel: Instantiate feature configuration from class"
sidebar_label: "13 Instantiate feature configuration from class"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Instantiate feature configuration from class

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L555)
- **Строка**: 555

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
    it('should instantiate feature configuration from class', async () => {
      @ConfigModel()
      class DatabaseFeatureConfig {
        @ConfigModelProperty({ default: 'localhost' })
        host!: string;

        @ConfigModelProperty({ default: 'mydb' })
        database!: string;
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
        sharedProviders: [DatabaseService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DatabaseModule.forFeatureAsync({
            featureModuleName: 'UserDB',
            featureConfigurationClass: DatabaseFeatureConfig,
          }),
        ],
        providers: [
          {
            provide: 'DB_CONFIG_CHECKER',
            useFactory: (service: DatabaseService) => {
              const configs = service.getFeatureConfigs();
              return configs[0]?.featureConfiguration;
            },
            inject: [DatabaseService],
          },
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const dbConfigChecker = moduleRef.get('DB_CONFIG_CHECKER');
      expect(dbConfigChecker).toBeDefined();
      expect(dbConfigChecker).toMatchObject({
        host: 'localhost',
        database: 'mydb',
      });
    });
```
