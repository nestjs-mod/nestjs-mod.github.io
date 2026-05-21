---
id: ru-tests-libs-common-src-lib-env-model-02-should-return-error-message-if-option-of-env-not-set-52a1bb8f2b
title: "EnvModel: Возвращает error message if option of env not set"
sidebar_label: "02 Возвращает error message if option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает error message if option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L48)
- **Строка**: 48

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
  it('should return error message if option of env not set', async () => {
    try {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
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

      await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      expect(err.message).toEqual(`obj['option'],process.env['OPTION']-isNotEmpty`);
    }
  });
```
