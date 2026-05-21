---
id: ru-tests-common-env-model-03-error-with-model-info-cb6635e9de
title: "EnvModel: Возвращает информацию о модели в ошибке, если option of env not set"
sidebar_label: "03 Возвращает информацию о модели в ошибке, если option of env not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает информацию о модели в ошибке, если option of env not set

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Метаданные ошибки**: Убеждаемся, что ошибки валидации включают метаданные модели и свойств
- **Опции модели**: Проверяем, что имя и описание модели включены в ошибки
- **Опции свойств**: Проверяем, что описания свойств сохранены в информации об ошибке
- **Детали валидации**: Подтверждаем, что ограничения валидации детализированы в ошибке

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L91-L141)
- **Строки**: 91-141

## Подготовительный код

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
```

## Код теста

```typescript
it('should return model info in error if option of env not set', async () => {
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

## Что делает этот тест

1. **Создает EnvModel** с богатыми метаданными (имя, описание, описание свойства)
2. **Пытается инициализировать** модуль без обязательной переменной окружения
3. **Ожидает ошибку валидации** и проверяет структуру объекта ошибки
4. **Проверяет, что ошибка включает**:
   - `modelPropertyOptions`: Метаданные уровня свойств с описаниями
   - `modelOptions`: Метаданные уровня модели с именем и описанием
   - `validations`: Детальная информация об ограничениях валидации

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.