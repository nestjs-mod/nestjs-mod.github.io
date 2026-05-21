---
id: ru-tests-libs-common-src-lib-modules-system-project-utils-02-should-return-report-without-override-application-name-from-package--585427cc0c
title: "NestModule: Возвращает report without override application name from package.json"
sidebar_label: "02 Возвращает report without override application name from package.json"
description: "Контекст тестового раздела: Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию."
---

# NestModule: Возвращает report without override application name from package.json

## Обзор

Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию.

## Что делаем и что проверяем

- Подтверждаем корректную инициализацию module metadata и lifecycle в рамках `nestjs-mod`.
- Проверяем связывание providers/controllers и работу dependency injection.
- Фиксируем ожидаемое поведение feature-конфигурации и интеграции модулей.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L58)
- **Строка**: 58

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
  it('should return report without override application name from package.json', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    const app = await bootstrapNestApplication({
      globalConfigurationOptions: { skipValidation: true, debug: true },
      globalEnvironmentsOptions: { skipValidation: true, debug: true },
      project: { name: 'TestApp', description: 'Test application' },
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              updateEnvFile: true,
              // todo: add tests
              saveFilesWithCheckSum: true,
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-2-test.env`,
              // todo: add tests
              filesCheckSumToEnvironments: {
                VERSION: {
                  folders: [__dirname],
                  glob: `**/*${basename(`${__filename}-package.json`)}`,
                  prepare: (content: string) => {
                    const json = JSON.parse(content);
                    return JSON.stringify(
                      json['version'] || new Date().toISOString().split(':').join('_').split('.').join('-'),
                    );
                  },
                },
                BASE_VERSION: {
                  folders: [__dirname],
                  glob: `**/*${basename(`${__filename}-package.json`)}`,
                  prepare: (content: string) => {
                    const json = JSON.parse(content);
                    return JSON.stringify({
                      devDependencies: json['devDependencies'] || {},
                      dependencies: json['dependencies'] || {},
                    });
                  },
                },
              },
              // todo: add tests
              prepareProcessedFilesCheckSumToEnvironments: (p) => {
                console.log(p);
                return p;
              },
            },
          }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# TestApp');
    expect(infrastructureMarkdownReportStorage.report).toContain('Test application');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
  });
```
