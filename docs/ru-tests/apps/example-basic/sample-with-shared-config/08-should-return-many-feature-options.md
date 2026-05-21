---
id: ru-tests-apps-example-basic-src-app-sample-with-shared-config-08-should-return-many-feature-options-8d834d8c4c
title: "EnvModel: Возвращает many feature options"
sidebar_label: "08 Возвращает many feature options"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает many feature options

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L265)
- **Строка**: 265

## Подготовительный код

```typescript
import {
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { IsNotEmpty, setClassValidatorMessages } from 'class-validator-multi-lang';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import request from 'supertest';
import { SampleWithSharedConfig } from './sample-with-shared-config.module';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

describe('SampleWithSharedConfigController', () => {

  // полный тест в блоке ниже

});
```

## Код теста

```typescript
  it('should return many feature options', async () => {
    // first

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar41' },
        }),
      ],
    })
    class FirstModule {}

    // second

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar42' },
        }),
      ],
    })
    class SecondModule {}

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            environments: { var1: 'var1value' },
          }),
          createNestModule({
            moduleName: 'ChildModules',
            moduleDescription: 'Child modules',
            imports: [SecondModule, FirstModule],
          }).ChildModules.forRoot(),
        ],
      },
    });

    await request(app.getHttpServer())
      .get('/get-features')
      .expect(200)
      .expect('[{"featureVar":"featureVar41"},{"featureVar":"featureVar42"}]');

    await app.close();
  });
```
