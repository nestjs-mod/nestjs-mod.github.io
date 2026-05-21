---
id: ru-tests-common-env-model-01-validation-error-44d61be1c3
title: "EnvModel: Возвращает ошибку, если option of env not set"
sidebar_label: "01 Возвращает ошибку, если option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает ошибку, если option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Валидация окружения**: Убеждаемся, что декоратор `@IsNotEmpty()` для свойств окружения работает корректно
- **Обработка ошибок**: Проверяем, что отсутствующие обязательные переменные окружения выбрасывают правильные ошибки валидации
- **Интеграция EnvModel**: Тестируем интеграцию между `EnvModel`, `EnvModelProperty` и утилитой `envTransform`
- **Маппинг Process.env**: Проверяем, что переменные окружения читаются из `process.env`

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L8-L46)
- **Строки**: 8-46

## Подготовительный код

Тест настраивает модель окружения с обязательным полем:

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
```

## Код теста

```typescript
it('should return error if option of env not set', async () => {
  await expect(
    Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile(),
  ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
});
```

## Что делает этот тест

1. **Создает EnvModel** с обязательным полем `option`, декорированным `@IsNotEmpty()`
2. **Пытается инициализировать** модуль с пустой конфигурацией `{}`
3. **Ожидает ошибку компиляции** с ошибкой валидации
4. **Проверяет сообщение об ошибке** содержит правильную.constraint валидации: `'option should not be empty'`

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.