---
id: ru-tests-common-config-model-01-validation-error-1ed95eb734
title: "ConfigModel: Возвращает ошибку, если option of config not set"
sidebar_label: "01 Возвращает ошибку, если option of config not set"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает ошибку, если option of config not set

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что мы тестируем

- **Логика валидации**: Убеждаемся, что декоратор `@IsNotEmpty()` для свойств конфигурации работает корректно
- **Обработка ошибок**: Проверяем, что отсутствующие обязательные опции выбрасывают правильные ошибки валидации
- **Интеграция ConfigModel**: Тестируем интеграцию между `ConfigModel`, `ConfigModelProperty` и утилитой `configTransform`

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L10-L48)
- **Строки**: 10-48

## Подготовительный код

Тест настраивает модель конфигурации с обязательным полем:

```typescript
import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

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
```

## Код теста

```typescript
it('should return error if option of config not set', async () => {
  await expect(
    Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile(),
  ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
});
```

## Что делает этот тест

1. **Создает ConfigModel** с обязательным полем `option`, декорированным `@IsNotEmpty()`
2. **Пытается инициализировать** модуль с пустой конфигурацией `{}`
3. **Ожидает ошибку компиляции** с ошибкой валидации
4. **Проверяет сообщение об ошибке** содержит правильную.constraint валидации: `'option should not be empty'`

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.