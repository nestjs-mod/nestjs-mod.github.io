---
id: ru-tests-libs-common-src-lib-config-model-03-should-return-option-value-from-service-1a65aa7a09
title: "ConfigModel: Возвращает значение опции из сервиса"
sidebar_label: "03 Возвращает значение опции из сервиса"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает значение опции из сервиса

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L102)
- **Строка**: 102

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
