---
id: ru-tests-apps-example-basic-src-app-sample-with-shared-config-02-should-return-error-if-environment-not-set-translated-errors-371e10c4bb
title: "EnvModel: Возвращает ошибку, если environment not set (translated errors)"
sidebar_label: "02 Возвращает ошибку, если environment not set (translated errors)"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает ошибку, если environment not set (translated errors)

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

- **Файл**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L33)
- **Строка**: 33

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
  it('should return error if environment not set (translated errors)', async () => {
    const RU_I18N_MESSAGES = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../../../../node_modules/class-validator-multi-lang/i18n/ru.json'),
      ).toString(),
    );
    setClassValidatorMessages(RU_I18N_MESSAGES);

    const TEST_APP_NAME = 'TestAppModule';

    @EnvModel({ name: TEST_APP_NAME })
    class TestAppEnvironments {
      @EnvModelProperty()
      @IsNotEmpty()
      var1!: string;
    }
    const { TestAppModule } = createNestModule({
      moduleName: TEST_APP_NAME,
      moduleCategory: NestModuleCategory.feature,
      staticEnvironmentsModel: TestAppEnvironments,
      environmentsOptions: {
        validatorPackage: require('class-validator-multi-lang'),
      },
    });

    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [TestAppModule.forRoot()],
        },
      }),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 не может быть пустым');
  });
```
