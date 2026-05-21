---
id: ru-tests-common-nest-module-06-feature-config-class-di-f54c68257a
title: "ConfigModel: Использует featureConfigurationClass через DI"
sidebar_label: "06 Использует featureConfigurationClass через DI"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Использует featureConfigurationClass через DI

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что мы тестируем

- **Конфигурация на основе классов**: Убеждаемся, что конфигурация может быть предоставлена как инжектируемый класс
- **Внедрение зависимостей в конфигурацию**: Проверяем, что классы конфигурации могут инжектировать и использовать другие сервисы
- **Фабричный паттерн**: Тестируем асинхронный фабричный паттерн для конфигурации фич
- **Интеграция сервисов**: Подтверждаем, что инжектированные сервисы работают корректно внутри классов конфигурации

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L619-L703)
- **Строки**: 619-703

## Подготовительный код

Этот тест создает класс конфигурации, который инжектирует вспомогательный сервис:

```typescript
import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

@ConfigModel()
class DatabaseFeatureConfig {
  @ConfigModelProperty({ default: 'localhost' })
  host!: string;

  @ConfigModelProperty({ default: 5432 })
  port!: number;

  @ConfigModelProperty({ default: 'mydb' })
  database!: string;
}

// Сервис для внедрения в класс конфигурации
@Injectable()
class ConfigHelper {
  getDefaultHost() {
    return 'db.example.com';
  }
}

const { InjectFeatures } = getNestModuleDecorators({
  moduleName: 'DatabaseModule',
});

@Injectable()
class DatabaseService {
  constructor(
    @InjectFeatures()
    private readonly featureConfigs: InjectableFeatureConfigurationType<DatabaseFeatureConfig>[],
  ) {}

  getFeatureConfigs() {
    return this.featureConfigs;
  }
}

const { DatabaseModule } = createNestModule({
  moduleName: 'DatabaseModule',
  featureConfigurationModel: DatabaseFeatureConfig,
  sharedProviders: [DatabaseService, ConfigHelper],
});

// Класс конфигурации с DI - конструктор может инжектировать зависимости
@Injectable()
class DatabaseConfigClass {
  constructor(private readonly configHelper: ConfigHelper) {}

  host = this.configHelper.getDefaultHost();
  port = 5432;
  database = 'production_db';
}
```

## Код теста

```typescript
it('should use featureConfigurationClass with DI', async () => {
  const { AppModule } = createNestModule({
    moduleName: 'AppModule',
    imports: [
      DatabaseModule.forFeatureAsync({
        featureModuleName: 'MainDatabase',
        featureConfigurationClass: DatabaseConfigClass,
        inject: [ConfigHelper],
      }),
    ],
  });

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
    providers: [ConfigHelper],
  }).compile();

  const databaseService = moduleRef.get(DatabaseService);
  const featureConfigs = databaseService.getFeatureConfigs();

  expect(featureConfigs).toBeDefined();
  expect(featureConfigs.length).toBeGreaterThanOrEqual(1);
  
  const config = featureConfigs[0];
  expect(config.featureModuleName).toBe('MainDatabase');
  expect(config.featureConfiguration).toMatchObject({
    host: 'db.example.com', // От инжектированного ConfigHelper
    port: 5432,
    database: 'production_db',
  });
});
```

## Что делает этот тест

1. **Создает сервис ConfigHelper**, который предоставляет значения конфигурации по умолчанию

2. **Создает DatabaseConfigClass**, который:
   - Декорирован `@Injectable()` для поддержки DI
   - Инжектирует `ConfigHelper` в своем конструкторе
   - Использует инжектированный хелпер для вычисления значения `host`
   - Устанавливает другие свойства напрямую

3. **Создает DatabaseModule** с:
   - `featureConfigurationModel`, определяющим структуру конфигурации
   - Оба `DatabaseService` и `ConfigHelper` как общие провайдеры

4. **Создает AppModule**, который:
   - Использует `forFeatureAsync` с `featureConfigurationClass`
   - Указывает, какие зависимости `inject` ([ConfigHelper])
   - Называет модуль фичи 'MainDatabase'

5. **Компилирует модуль** и получает `DatabaseService`

6. **Проверяет**, что:
   - Конфигурации фич определены
   - Конфигурация создана из класса
   - Значение `host` пришло от инжектированного `ConfigHelper` ('db.example.com')
   - Другие значения соответствуют свойствам класса

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.