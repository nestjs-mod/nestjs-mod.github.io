---
id: ru-tests-libs-common-src-lib-nest-module-15-should-use-featureconfigurationfactory-with-injection-57eee05587
title: "EnvModel: Use featureConfigurationFactory with injection"
sidebar_label: "15 Use featureConfigurationFactory with injection"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Use featureConfigurationFactory with injection

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L705)
- **Строка**: 705

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
    it('should use featureConfigurationFactory with injection', async () => {
      @ConfigModel()
      class ApiFeatureConfig {
        @ConfigModelProperty({ default: 'https://api.example.com' })
        apiUrl!: string;

        @ConfigModelProperty({ default: 5000 })
        timeout!: number;
      }

      @Injectable()
      class ConfigProvider {
        getConfig() {
          return {
            apiUrl: 'https://api.custom.com',
            timeout: 3000,
          };
        }
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'ApiModule',
      });

      @Injectable()
      class ApiService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<ApiFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { ApiModule } = createNestModule({
        moduleName: 'ApiModule',
        featureConfigurationModel: ApiFeatureConfig,
        sharedProviders: [ConfigProvider, ApiService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          ApiModule.forFeatureAsync({
            featureModuleName: 'ExternalApi',
            featureConfigurationFactory: (configProvider: ConfigProvider) => {
              const config = configProvider.getConfig();
              return {
                apiUrl: config.apiUrl,
                timeout: config.timeout,
              };
            },
            inject: [ConfigProvider],
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [ApiModule.forRoot(), AppModule.forRoot()],
      }).compile();

      await moduleRef.init();

      const apiService = moduleRef.get(ApiService);
      const featureConfigs = apiService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        apiUrl: 'https://api.custom.com',
        timeout: 3000,
      });
    });
```
