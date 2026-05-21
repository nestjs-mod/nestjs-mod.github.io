---
id: ru-tests-libs-common-src-lib-nest-module-18-should-support-multiple-feature-modules-with-different-configuration-methods-edc7897d15
title: "EnvModel: Support multiple feature modules with different configuration methods"
sidebar_label: "18 Support multiple feature modules with different configuration methods"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Support multiple feature modules with different configuration methods

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L909)
- **Строка**: 909

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
    it('should support multiple feature modules with different configuration methods', async () => {
      @ConfigModel()
      class ServiceFeatureConfig {
        @ConfigModelProperty({ default: 'feature1' })
        name!: string;

        @ConfigModelProperty({ default: true })
        enabled!: boolean;
      }

      const { InjectAllFeatures } = getNestModuleDecorators({
        moduleName: 'ServiceModule',
      });

      @Injectable()
      class ServiceScannerService {
        constructor(
          @InjectAllFeatures()
          private readonly allFeatureConfigs: Record<string, InjectableFeatureConfigurationType<ServiceFeatureConfig>[]>,
        ) {}

        getAllFeatureConfigs() {
          return this.allFeatureConfigs;
        }
      }

      const { ServiceModule } = createNestModule({
        moduleName: 'ServiceModule',
        featureConfigurationModel: ServiceFeatureConfig,
        sharedProviders: [ServiceScannerService],
      });

      // Feature 1: Using class
      const { Feature1Module } = createNestModule({
        moduleName: 'Feature1Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature1',
            featureConfigurationClass: ServiceFeatureConfig,
          }),
        ],
      });

      // Feature 2: Using factory
      const { Feature2Module } = createNestModule({
        moduleName: 'Feature2Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature2',
            featureConfigurationFactory: () => ({
              name: 'feature2',
              enabled: true,
            }),
          }),
        ],
      });

      // Feature 3: Using existing
      const existingConfig = new ServiceFeatureConfig();
      existingConfig.name = 'feature3';
      existingConfig.enabled = false;

      const { Feature3Module } = createNestModule({
        moduleName: 'Feature3Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature3',
            featureConfigurationExisting: existingConfig,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          ServiceModule.forRoot(),
          Feature1Module.forRoot(),
          Feature2Module.forRoot(),
          Feature3Module.forRoot(),
        ],
      }).compile();

      const scannerService = moduleRef.get(ServiceScannerService);
      const allConfigs = scannerService.getAllFeatureConfigs();

      expect(allConfigs['default']).toHaveLength(3);
      
      // Find configs by featureModuleName since order may vary
      const feature1 = allConfigs['default'].find(c => c.featureModuleName === 'Feature1');
      const feature2 = allConfigs['default'].find(c => c.featureModuleName === 'Feature2');
      const feature3 = allConfigs['default'].find(c => c.featureModuleName === 'Feature3');
      
      expect(feature1?.featureConfiguration).toMatchObject({
        name: 'feature1',
        enabled: true,
      });
      expect(feature2?.featureConfiguration).toMatchObject({
        name: 'feature2',
        enabled: true,
      });
      expect(feature3?.featureConfiguration).toMatchObject({
        name: 'feature3',
        enabled: false,
      });
    });
```
