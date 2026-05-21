---
id: ru-tests-libs-common-src-lib-nest-module-17-should-use-featureconfigurationstream-for-dynamic-configuration-1eb35a913f
title: "EnvModel: Use featureConfigurationStream for dynamic configuration"
sidebar_label: "17 Use featureConfigurationStream for dynamic configuration"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Use featureConfigurationStream for dynamic configuration

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L841)
- **Строка**: 841

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
    it('should use featureConfigurationStream for dynamic configuration', async () => {
      @ConfigModel()
      class DynamicFeatureConfig {
        @ConfigModelProperty({ default: 0 })
        value!: number;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'DynamicModule',
      });

      @Injectable()
      class DynamicService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<DynamicFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { DynamicModule } = createNestModule({
        moduleName: 'DynamicModule',
        featureConfigurationModel: DynamicFeatureConfig,
        sharedProviders: [DynamicService],
      });

      const configStream = new BehaviorSubject<DynamicFeatureConfig>({ value: 100 });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DynamicModule.forFeatureAsync({
            featureModuleName: 'LiveConfig',
            featureConfigurationStream: () => configStream,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DynamicModule.forRoot(), AppModule.forRoot()],
      }).compile();

      await moduleRef.init();

      const dynamicService = moduleRef.get(DynamicService);

      // Wait for stream to process
      await setTimeout(100);

      const featureConfigs = dynamicService.getFeatureConfigs();

      // Stream should provide the configuration
      expect(featureConfigs).toBeDefined();
      expect(featureConfigs.length).toBeGreaterThanOrEqual(0);

      // Update stream
      configStream.next({ value: 200 });
      await setTimeout(100);

      // Verify stream was processed
      const updatedConfigs = dynamicService.getFeatureConfigs();
      expect(updatedConfigs).toBeDefined();
    });
```
