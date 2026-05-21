---
id: ru-tests-libs-common-src-lib-nest-module-16-should-use-featureconfigurationexisting-instance-89fad573db
title: "EnvModel: Use featureConfigurationExisting instance"
sidebar_label: "16 Use featureConfigurationExisting instance"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Use featureConfigurationExisting instance

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L780)
- **Строка**: 780

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
    it('should use featureConfigurationExisting instance', async () => {
      @ConfigModel()
      class CacheFeatureConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        ttl!: number;

        @ConfigModelProperty()
        prefix!: string;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'CacheModule',
      });

      @Injectable()
      class CacheService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<CacheFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { CacheModule } = createNestModule({
        moduleName: 'CacheModule',
        featureConfigurationModel: CacheFeatureConfig,
        sharedProviders: [CacheService],
      });

      const existingConfig = new CacheFeatureConfig();
      existingConfig.ttl = 3600;
      existingConfig.prefix = 'app_cache';

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          CacheModule.forFeatureAsync({
            featureModuleName: 'SessionCache',
            featureConfigurationExisting: existingConfig,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [CacheModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const cacheService = moduleRef.get(CacheService);
      const featureConfigs = cacheService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        ttl: 3600,
        prefix: 'app_cache',
      });
    });
```
