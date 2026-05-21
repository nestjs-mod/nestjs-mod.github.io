---
id: ru-tests-common-env-model-05-cross-module-access-bee5e824d9
title: "EnvModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "05 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Шаринг модулей**: Убеждаемся, что EnvModel может быть экспортирован и импортирован across модулей
- **Кросс-модульное DI**: Проверяем, что внедрение зависимостей работает across границ модулей
- **Распространение окружения**: Тестируем, что значения окружения доступны в импортирующих модулях
- **Архитектура модулей**: Валидируем паттерн общих модулей окружения

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L195-L272)
- **Строки**: 195-272

## Подготовительный код

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

@EnvModel()
class App1Env {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App1Service {
  constructor(private readonly appEnv: App1Env) {}

  getEnv() {
    return this.appEnv;
  }
}

@Module({
  imports: [App1Module.forShareEnv()],
  providers: [App1Service],
  exports: [App1Service],
})
class App1Module {
  static forShareEnv(): DynamicModule {
    return {
      module: App1Module,
      providers: [App1Env],
      exports: [App1Env],
    };
  }
  
  static forRoot(env?: Partial<App1Env>): DynamicModule {
    return {
      module: App1Module,
      providers: [
        {
          provide: `${App1Env.name}_loader`,
          useFactory: async (emptyAppEnv: App1Env) => {
            if (env && env.constructor !== Object) {
              Object.setPrototypeOf(emptyAppEnv, env);
            }
            const obj = await envTransform({
              model: App1Env,
              data: env || {},
            });
            Object.assign(emptyAppEnv, obj.data);
          },
          inject: [App1Env],
        },
      ],
    };
  }
}

@Injectable()
class App2Service {
  constructor(private readonly appService: App1Service) {}

  getEnv() {
    return this.appService.getEnv();
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
  process.env['OPTION'] = 'value1';

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [App1Module.forRoot({}), App2Module],
  }).compile();
  const app2Service = moduleRef.get(App2Service);

  expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
});
```

## Что делает этот тест

1. **Устанавливает переменную окружения** `process.env['OPTION'] = 'value1'`

2. **Создает App1Module** с:
   - EnvModel (`App1Env`), который читает из окружения
   - Сервисом (`App1Service`), который использует модель окружения
   - Двумя статическими методами: `forRoot()` для инициализации и `forShareEnv()` для шаринга

3. **Создает App2Module**, который:
   - Импортирует App1Module для доступа к общим провайдерам
   - Определяет `App2Service`, который зависит от `App1Service`

4. **Инициализирует оба модуля** (переменная окружения предоставляет значение)

5. **Получает App2Service** из скомпилированного модуля

6. **Проверяет**, что App2Service может accessing значение окружения через App1Service

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.