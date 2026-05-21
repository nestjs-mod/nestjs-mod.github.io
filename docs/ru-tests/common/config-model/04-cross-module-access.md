---
id: ru-tests-common-config-model-04-cross-module-access-6eff1c8ea8
title: "ConfigModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "04 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах."
---

# ConfigModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют ConfigModel в nestjs-mod: преобразование конфигурации, валидацию данных и контракт ошибок при некорректных параметрах.

## Что мы тестируем

- **Шаринг модулей**: Убеждаемся, что ConfigModel может быть экспортирован и импортирован across модулей
- **Кросс-модульное DI**: Проверяем, что внедрение зависимостей работает across границ модулей
- **Распространение конфигурации**: Тестируем, что значения конфигурации доступны в импортирующих модулях
- **Архитектура модулей**: Валидируем паттерн общих модулей конфигурации

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L152-L227)
- **Строки**: 152-227

## Подготовительный код

Тест создает два модуля, где App1Module делится своей конфигурацией с App2Module:

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel()
class App1Config {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App1Service {
  constructor(private readonly appConfig: App1Config) {}

  getConfig() {
    return this.appConfig;
  }
}

@Module({
  imports: [App1Module.forShareConfig()],
  providers: [App1Service],
  exports: [App1Service],
})
class App1Module {
  static forShareConfig(): DynamicModule {
    return {
      module: App1Module,
      providers: [App1Config],
      exports: [App1Config],
    };
  }
  
  static forRoot(config: Partial<App1Config>): DynamicModule {
    return {
      module: App1Module,
      providers: [
        {
          provide: `${App1Config.name}_loader`,
          useFactory: async (emptyAppConfig: App1Config) => {
            if (config.constructor !== Object) {
              Object.setPrototypeOf(emptyAppConfig, config);
            }
            const obj = await configTransform({
              model: App1Config,
              data: config,
            });
            Object.assign(emptyAppConfig, obj.data);
          },
          inject: [App1Config],
        },
      ],
    };
  }
}

@Injectable()
class App2Service {
  constructor(private readonly appService: App1Service) {}

  getConfig() {
    return this.appService.getConfig();
  }
}

@Module({
  imports: [App1Module],
  providers: [App2Service],
})
class App2Module {}
```

## Код теста

```typescript
it('should return option value from service of other module', async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [App1Module.forRoot({ option: 'value1' }), App2Module],
  }).compile();
  const app2Service = moduleRef.get(App2Service);

  expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
});
```

## Что делает этот тест

1. **Создает App1Module** с:
   - ConfigModel (`App1Config`)
   - Сервисом (`App1Service`), который использует конфигурацию
   - Двумя статическими методами: `forRoot()` для конфигурации и `forShareConfig()` для шаринга

2. **Создает App2Module**, который:
   - Импортирует App1Module для доступа к общим провайдерам
   - Определяет `App2Service`, который зависит от `App1Service`

3. **Инициализирует оба модуля** с конфигурацией в App1Module

4. **Получает App2Service** из скомпилированного модуля

5. **Проверяет**, что App2Service может accessing конфигурацию через App1Service, даже несмотря на то, что App2Module не настраивал ее напрямую

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.