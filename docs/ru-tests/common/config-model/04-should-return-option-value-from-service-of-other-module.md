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

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L152)
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

  // полный тест в блоке ниже
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
          providers: [App1Config],
          exports: [App1Config],
        };
      }
      static forRoot(config: Partial<App1Config>): DynamicModule {
        return {
          module: App1Module,
          providers: [
            {
              provide: `${App1Config.name}_loader`,
              useFactory: async (emptyAppConfig: App1Config) => {
                if (config.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppConfig, config);
                }
                const obj = await configTransform({
                  model: App1Config,
                  data: config,
                });
                Object.assign(emptyAppConfig, obj.data);
              },
              inject: [App1Config],
            },
          ],
        };
      }
    }

    @Injectable()
    class App2Service {
      constructor(private readonly appService: App1Service) {}

      getConfig() {
        return this.appService.getConfig();
      }
    }

    @Module({
      imports: [App1Module],
      providers: [App2Service],
    })
    class App2Module {}

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [App1Module.forRoot({ option: 'value1' }), App2Module],
    }).compile();
    const app2Service = moduleRef.get(App2Service);

    expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
  });
```
