---
id: ru-tests-libs-common-src-lib-env-model-05-should-return-option-value-from-service-of-other-module-71d2ff0fba
title: "EnvModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "05 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L195)
- **Строка**: 195

## Подготовительный код

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

describe('Env model: Utils', () => {

  // полный тест в блоке ниже
});
```

## Код теста

```typescript
  it('should return option value from service of other module', async () => {
    @EnvModel()
    class App1Env {
      @EnvModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Injectable()
    class App1Service {
      constructor(private readonly appEnv: App1Env) {}

      getEnv() {
        return this.appEnv;
      }
    }

    @Module({
      imports: [App1Module.forShareEnv()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareEnv(): DynamicModule {
        return {
          module: App1Module,
          providers: [App1Env],
          exports: [App1Env],
        };
      }
      static forRoot(env?: Partial<App1Env>): DynamicModule {
        return {
          module: App1Module,
          providers: [
            {
              provide: `${App1Env.name}_loader`,
              useFactory: async (emptyAppEnv: App1Env) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: App1Env,
                  data: env || {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [App1Env],
            },
          ],
        };
      }
    }

    @Injectable()
    class App2Service {
      constructor(private readonly appService: App1Service) {}

      getEnv() {
        return this.appService.getEnv();
      }
    }

    @Module({
      imports: [App1Module],
      providers: [App2Service],
    })
    class App2Module {}

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [App1Module.forRoot({}), App2Module],
    }).compile();
    const app2Service = moduleRef.get(App2Service);

    expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
  });
```
