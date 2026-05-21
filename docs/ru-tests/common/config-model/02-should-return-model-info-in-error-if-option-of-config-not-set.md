---
id: ru-tests-libs-common-src-lib-config-model-02-should-return-model-info-in-error-if-option-of-config-not-set-539a79be97
title: "ConfigModel: Возвращает информацию о модели в ошибке, если option of config not set"
sidebar_label: "02 Возвращает информацию о модели в ошибке, если option of config not set"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает информацию о модели в ошибке, если option of config not set

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L50)
- **Строка**: 50

## Подготовительный код

```typescript
import { DynamicModule } from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

describe('Config model: Utils', () => {
  it('should return error if option of config not set', async () => {
    @ConfigModel()
    class AppConfig {
      @ConfigModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
    class AppModule {
      static forRoot(config: Partial<AppConfig>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppConfig.name}_loader`,
              useFactory: async (emptyAppConfig: AppConfig) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: AppConfig,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [AppConfig],
            },
          ],
        };
      }
    }

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile(),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
  });

```

## Код теста

```typescript
  it('should return model info in error if option of config not set', async () => {
    @ConfigModel({ name: 'model name', description: 'model description' })
    class AppConfig {
      @ConfigModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
    class AppModule {
      static forRoot(config: Partial<AppConfig>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppConfig.name}_loader`,
              useFactory: async (emptyAppConfig: AppConfig) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: AppConfig,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
```
