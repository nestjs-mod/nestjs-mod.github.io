---
id: ru-tests-libs-common-src-lib-env-model-04-should-return-option-value-from-service-7b6deb98b7
title: "EnvModel: Возвращает значение опции из сервиса"
sidebar_label: "04 Возвращает значение опции из сервиса"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L143)
- **Строка**: 143

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
  it('should return option value from service', async () => {
    @EnvModel()
    class AppEnv {
      @EnvModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Injectable()
    class AppService {
      constructor(private readonly appEnv: AppEnv) {}

      getEnv() {
        return this.appEnv;
      }
    }

    @Module({ providers: [AppEnv, AppService] })
    class AppModule {
      static forRoot(env?: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env || {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
            },
          ],
        };
      }
    }

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
    const appService = moduleRef.get(AppService);

    expect(appService.getEnv()).toMatchObject({ option: 'value1' });
  });
```
