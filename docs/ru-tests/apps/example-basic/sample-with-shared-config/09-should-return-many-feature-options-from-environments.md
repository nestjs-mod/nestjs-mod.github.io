---
id: ru-tests-apps-example-basic-src-app-sample-with-shared-config-09-should-return-many-feature-options-from-environments-a39fefddb3
title: "EnvModel: Возвращает many feature options from environments"
sidebar_label: "09 Возвращает many feature options from environments"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает many feature options from environments

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

- **Файл**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L318)
- **Строка**: 318

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
  it('should return many feature options from environments', async () => {
    // first

    process.env['TEST_APPLICATION_API_41_SAMPLE_WITH_SHARED_CONFIG_ENV_FEATURE_VAR'] = 'envFeatureVar41';
    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          contextName: 'api41',
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar41' },
          featureEnvironmentsOptions: { debug: true },
        }),
      ],
    })
    class FirstModule {}

    // second

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          contextName: 'api41',
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar42' },
          featureEnvironments: { envFeatureVar: 'envFeatureVar42' },
          featureEnvironmentsOptions: { debug: true },
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
            contextName: 'api41',
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
      .get('/get-feature-environments/api41')
      .expect(200)
      .expect('[{"envFeatureVar":"envFeatureVar41"},{"envFeatureVar":"envFeatureVar42"}]');

    await app.close();
  });
```
