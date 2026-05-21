---
id: ru-tests-common-config-model-03-get-value-from-service-0d0c7e4ee8
title: "ConfigModel: Возвращает значение опции из сервиса"
sidebar_label: "03 Возвращает значение опции из сервиса"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает значение опции из сервиса

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что мы тестируем

- **Внедрение зависимостей**: Убеждаемся, что ConfigModel правильно инжектируется в сервисы
- **Назначение конфигурации**: Проверяем, что предоставленные значения конфигурации установлены в экземпляре модели
- **Интеграция сервисов**: Тестируем, что сервисы могут accessing конфигурацию через инжектированные модели
- **Интеграция configTransform**: Подтверждаем, что утилита transform правильно обрабатывает данные конфигурации

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L102-L150)
- **Строки**: 102-150

## Подготовительный код

Тест создает ConfigModel, сервис, который его использует, и модуль, который предоставляет оба:

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

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
```

## Код теста

```typescript
it('should return option value from service', async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule.forRoot({ option: 'value1' })],
  }).compile();
  const appService = moduleRef.get(AppService);

  expect(appService.getConfig()).toMatchObject({ option: 'value1' });
});
```

## Что делает этот тест

1. **Создает ConfigModel** с обязательным полем `option`
2. **Создает сервис**, который инжектирует ConfigModel и предоставляет геттер
3. **Инициализирует модуль** с конфигурацией `{ option: 'value1' }`
4. **Компилирует тестовый модуль** успешно (валидация проходит)
5. **Получает сервис** из контейнера модуля
6. **Проверяет**, что сервис возвращает правильное значение конфигурации через `getConfig()`

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.