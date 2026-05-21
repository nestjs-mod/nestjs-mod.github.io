---
id: ru-tests-common-env-model-04-get-value-from-service-fa7ee9f967
title: "EnvModel: Возвращает значение опции из сервиса"
sidebar_label: "04 Возвращает значение опции из сервиса"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что мы тестируем

- **Чтение переменных окружения**: Убеждаемся, что значения читаются из `process.env`
- **Внедрение зависимостей**: Проверяем, что EnvModel правильно инжектируется в сервисы
- **Назначение окружения**: Подтверждаем, что переменные окружения установлены в экземпляре модели
- **Интеграция сервисов**: Тестируем, что сервисы могут accessing значения окружения через инжектированные модели

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L143-L193)
- **Строки**: 143-193

## Подготовительный код

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

@EnvModel()
class AppEnv {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class AppService {
  constructor(private readonly appEnv: AppEnv) {}

  getEnv() {
    return this.appEnv;
  }
}

@Module({ providers: [AppEnv, AppService] })
class AppModule {
  static forRoot(env?: Partial<AppEnv>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppEnv.name}_loader`,
          useFactory: async (emptyAppEnv: AppEnv) => {
            if (env && env.constructor !== Object) {
              Object.setPrototypeOf(emptyAppEnv, env);
            }
            const obj = await envTransform({
              model: AppEnv,
              data: env || {},
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
it('should return option value from service', async () => {
  process.env['OPTION'] = 'value1';

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule.forRoot({})],
  }).compile();
  const appService = moduleRef.get(AppService);

  expect(appService.getEnv()).toMatchObject({ option: 'value1' });
});
```

## Что делает этот тест

1. **Устанавливает переменную окружения** `process.env['OPTION'] = 'value1'`
2. **Создает EnvModel** с обязательным полем `option`
3. **Создает сервис**, который инжектирует EnvModel и предоставляет геттер
4. **Инициализирует модуль** с пустой конфигурацией (значения приходят из process.env)
5. **Компилирует тестовый модуль** успешно (валидация проходит из переменной окружения)
6. **Получает сервис** из контейнера модуля
7. **Проверяет**, что сервис возвращает правильное значение окружения через `getEnv()`

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.