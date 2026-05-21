---
id: ru-tests-libs-common-src-lib-config-model-04-should-return-option-value-from-service-of-other-module-b39da35e63
title: "ConfigModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "04 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L152)
- **Строка**: 152

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
    ).rejects.toMatchObject({
      info: {
        modelPropertyOptions: [{ description: 'option description', originalName: 'option' }],
        modelOptions: {
          name: 'model name',
          description: 'model description',
          originalName: 'AppConfig',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
  });

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

    @Module({ providers: [AppConfig, AppService] })
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

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({ option: 'value1' })],
    }).compile();
    const appService = moduleRef.get(AppService);

    expect(appService.getConfig()).toMatchObject({ option: 'value1' });
  });

```

## Код теста

```typescript
  it('should return option value from service of other module', async () => {
    @ConfigModel()
    class App1Config {
      @ConfigModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Injectable()
    class App1Service {
      constructor(private readonly appConfig: App1Config) {}

      getConfig() {
        return this.appConfig;
      }
    }

    @Module({
      imports: [App1Module.forShareConfig()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareConfig(): DynamicModule {
        return {
          module: App1Module,
```
