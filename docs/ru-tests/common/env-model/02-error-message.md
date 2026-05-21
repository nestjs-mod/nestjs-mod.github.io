---
id: ru-tests-common-env-model-02-error-message-262bfa1788
title: "EnvModel: Возвращает error message if option of env not set"
sidebar_label: "02 Возвращает error message if option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает error message if option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Формат сообщения об ошибке**: Убеждаемся, что сообщения об ошибках включают информацию об отслеживании источника
- **Отображение двойного источника**: Проверяем, что показаны как имя свойства объекта, так и переменная process.env
- **Детали валидации**: Подтверждаем, что ограничение валидации включено в сообщение

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L48-L89)
- **Строки**: 48-89

## Подготовительный код

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
it('should return error message if option of env not set', async () => {
  try {
    await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
  } catch (err: any) {
    expect(err.message).toEqual(`obj['option'],process.env['OPTION']-isNotEmpty`);
  }
});
```

## Что делает этот тест

1. **Создает EnvModel** с обязательным полем `option`
2. **Пытается инициализировать** модуль без предоставления переменной окружения
3. **Ловит ошибку валидации**
4. **Проверяет сообщение об ошибке** содержит специфический формат: `obj['option'],process.env['OPTION']-isNotEmpty`

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.