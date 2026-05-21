---
id: ru-tests-libs-common-src-lib-nest-module-12-should-update-configuration-value-on-runtime-471300aab2
title: "EnvModel: Update configuration value on runtime"
sidebar_label: "12 Update configuration value on runtime"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Update configuration value on runtime

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L512)
- **Строка**: 512

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
    // полный тест в блоке ниже
  });

  describe('NestJS modules with featureConfigurationClass', () => {

  });
});
```

## Код теста

```typescript
    it('should update configuration value on runtime', async () => {
      @ConfigModel()
      class RealtimeConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        increment!: number;
      }

      @Injectable()
      class RealtimeService {
        constructor(private readonly realtimeConfig: RealtimeConfig) {}
        getConfig() {
          return this.realtimeConfig;
        }
      }

      const { RealtimeModule } = createNestModule({
        globalConfigurationOptions: { debug: true },
        moduleName: 'RealtimeModule',
        providers: [RealtimeService],
        configurationModel: RealtimeConfig,
      });

      const configurationStream = new BehaviorSubject<RealtimeConfig>({ increment: 0 });

      const module = await Test.createTestingModule({
        imports: [RealtimeModule.forRootAsync({ configurationStream: () => configurationStream })],
      }).compile();
      const realtimeService = module.get(RealtimeService);

      await module.init();

      expect(realtimeService.getConfig()).toEqual({ increment: 0 });

      configurationStream.next({ increment: 1 });

      await setTimeout(500);

      expect(realtimeService.getConfig()).toEqual({ increment: 1 });
    });
```
