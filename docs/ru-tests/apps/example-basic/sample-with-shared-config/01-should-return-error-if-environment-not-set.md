---
id: ru-tests-apps-example-basic-src-app-sample-with-shared-config-01-should-return-error-if-environment-not-set-edf5d36921
title: "EnvModel: Возвращает ошибку, если environment not set"
sidebar_label: "01 Возвращает ошибку, если environment not set"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает ошибку, если environment not set

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

- **Файл**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L18)
- **Строка**: 18

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
  it('should return error if environment not set', async () => {
    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [SampleWithSharedConfig.forRoot()],
        },
      }),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 should not be empty');
  });
```
