---
id: ru-tests-common-config-model-02-error-with-model-info-9b2ab6e972
title: "ConfigModel: Возвращает информацию о модели в ошибке, если option of config not set"
sidebar_label: "02 Возвращает информацию о модели в ошибке, если option of config not set"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает информацию о модели в ошибке, если option of config not set

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что мы тестируем

- **Метаданные ошибки**: Убеждаемся, что ошибки валидации включают метаданные модели и свойств
- **Опции модели**: Проверяем, что имя и описание модели включены в ошибки
- **Опции свойств**: Проверяем, что описания свойств сохранены в информации об ошибке
- **Детали валидации**: Подтверждаем, что ограничения валидации детализированы в ошибке

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L50-L100)
- **Строки**: 50-100

## Подготовительный код

Тест создает ConfigModel с детальными метаданными:

```typescript
import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel({ name: 'model name', description: 'model description' })
class AppConfig {
  @ConfigModelProperty({ description: 'option description' })
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
it('should return model info in error if option of config not set', async () => {
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
        originalName: 'AppConfig',
      },
      validations: {
        option: { constraints: { isNotEmpty: 'option should not be empty' } },
      },
    },
  });
});
```

## Что делает этот тест

1. **Создает ConfigModel** с богатыми метаданными (имя, описание, описание свойства)
2. **Пытается инициализировать** модуль с пустой конфигурацией
3. **Ожидает ошибку валидации** и проверяет структуру объекта ошибки
4. **Проверяет, что ошибка включает**:
   - `modelPropertyOptions`: Метаданные уровня свойств с описаниями
   - `modelOptions`: Метаданные уровня модели с именем и описанием
   - `validations`: Детальная информация об ограничениях валидации

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.