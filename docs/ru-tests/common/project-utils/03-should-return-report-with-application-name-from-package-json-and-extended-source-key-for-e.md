---
id: ru-tests-libs-common-src-lib-modules-system-project-utils-03-should-return-report-with-application-name-from-package-json-and-ext-b2a02a2438
title: "NestModule: Возвращает report with application name from package.json and extended source key for env"
sidebar_label: "03 Возвращает report with application name from package.json and extended source key for env"
description: "Контекст тестового раздела: Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию."
---

# NestModule: Возвращает report with application name from package.json and extended source key for env

## Обзор

Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию.

## Что делаем и что проверяем

- Подтверждаем корректную инициализацию module metadata и lifecycle в рамках `nestjs-mod`.
- Проверяем связывание providers/controllers и работу dependency injection.
- Фиксируем ожидаемое поведение feature-конфигурации и интеграции модулей.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L122)
- **Строка**: 122

## Подготовительный код

```typescript
import { Injectable } from '@nestjs/common';
import { basename } from 'path';
import { bootstrapNestApplication } from '../../../nest-application/utils';
import { createNestModule } from '../../../nest-module/utils';
import {
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

  // полный тест в блоке ниже

});
```

## Код теста

```typescript
  it('should return report with application name from package.json and extended source key for env', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    process.env['TEST_APP_PORT'] = '1000';

    const app = await bootstrapNestApplication({
      modules: {
        system: [
          ProjectUtils.forRoot({ staticConfiguration: { applicationPackageJsonFile: `${__filename}-package.json` } }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain('Description for test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
    expect(infrastructureMarkdownReportStorage.report).toContain('```1000```');
    process.env['TEST_APP_PORT'] = undefined;
  });
```1000```');
    process.env['TEST_APP_PORT'] = undefined;
```
