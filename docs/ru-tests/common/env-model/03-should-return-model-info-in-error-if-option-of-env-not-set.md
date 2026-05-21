---
id: ru-tests-libs-common-src-lib-env-model-03-should-return-model-info-in-error-if-option-of-env-not-set-28d547b03d
title: "EnvModel: Возвращает информацию о модели в ошибке, если option of env not set"
sidebar_label: "03 Возвращает информацию о модели в ошибке, если option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает информацию о модели в ошибке, если option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L91)
- **Строка**: 91

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
  it('should return model info in error if option of env not set', async () => {
    @EnvModel({ name: 'model name', description: 'model description' })
    class AppEnv {
      @EnvModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppEnv] })
    class AppModule {
      static forRoot(env: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env,
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
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
          originalName: 'AppEnv',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
  });
```
