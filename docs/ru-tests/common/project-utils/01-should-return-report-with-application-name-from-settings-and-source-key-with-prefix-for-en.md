---
id: ru-tests-libs-common-src-lib-modules-system-project-utils-01-should-return-report-with-application-name-from-settings-and-source--8e9b45bee6
title: "NestModule: Возвращает report with application name from settings and source key with prefix for env"
sidebar_label: "01 Возвращает report with application name from settings and source key with prefix for env"
description: "Контекст тестового раздела: Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию."
---

# NestModule: Возвращает report with application name from settings and source key with prefix for env

## Обзор

Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию.

## Что делаем и что проверяем

- Подтверждаем корректную инициализацию module metadata и lifecycle в рамках `nestjs-mod`.
- Проверяем связывание providers/controllers и работу dependency injection.
- Фиксируем ожидаемое поведение feature-конфигурации и интеграции модулей.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L25)
- **Строка**: 25

## Подготовительный код

```typescript
import { Injectable } from '@nestjs/common';
import { basename } from 'path';
import { bootstrapNestApplication } from '../../../nest-application/utils';
import { createNestModule } from '../../../nest-module/utils';
import {
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorageService,
} from '../../infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../../system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../../system/default-nest-application/default-nest-application-listener';
import { ProjectUtils } from './project-utils.module';
import { ApplicationPackageJsonService } from './services/application-package-json.service';
import { DotEnvService } from './services/dot-env.service';
import { PackageJsonService } from './services/package-json.service';

describe('Project Utils', () => {
  beforeAll(() => {
    process.env['NESTJS_MODE'] = 'infrastructure';
  });

  afterAll(() => {
    process.env['NESTJS_MODE'] = undefined;
  });

  it('should return report with application name from settings and source key with prefix for env', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      // type checking
      wrapForRootAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
      wrapForFeatureAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
    });

    const app = await bootstrapNestApplication({
      globalConfigurationOptions: { skipValidation: true },
      globalEnvironmentsOptions: { skipValidation: true },
      project: { name: 'TestApp', description: 'Test application' },
```

## Код теста

```typescript
  it('should return report with application name from settings and source key with prefix for env', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      // type checking
      wrapForRootAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
      wrapForFeatureAsync: (asyncModuleOptions) => {
        return { asyncModuleOptions };
      },
    });

    const app = await bootstrapNestApplication({
      globalConfigurationOptions: { skipValidation: true },
      globalEnvironmentsOptions: { skipValidation: true },
      project: { name: 'TestApp', description: 'Test application' },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);
```
