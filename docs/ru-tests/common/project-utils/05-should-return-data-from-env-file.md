---
id: ru-tests-libs-common-src-lib-modules-system-project-utils-05-should-return-data-from-env-file-6c7b6322f2
title: "NestModule: Возвращает data from env-file"
sidebar_label: "05 Возвращает data from env-file"
description: "Контекст тестового раздела: Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию."
---

# NestModule: Возвращает data from env-file

## Обзор

Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию.

## Что делаем и что проверяем

- Подтверждаем корректную инициализацию module metadata и lifecycle в рамках `nestjs-mod`.
- Проверяем связывание providers/controllers и работу dependency injection.
- Фиксируем ожидаемое поведение feature-конфигурации и интеграции модулей.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L197)
- **Строка**: 197

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
```1000```');
    process.env['TEST_APP_PORT'] = undefined;
  });

  it('should return report with application name from package.json and extended source key for env and use contextName, use .env file for receiving', async () => {
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            contextName: 'new',
            staticConfiguration: {
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-.env`,
            },
          }),
          DefaultNestApplicationInitializer.forRoot({
            contextName: 'new',
          }),
          DefaultNestApplicationListener.forRoot({
            contextName: 'new',
            staticConfiguration: { mode: 'init' },
          }),
        ],
        feature: [
          AppModule.forRoot({
            contextName: 'new',
          }),
        ],
        infrastructure: [
          InfrastructureMarkdownReportGenerator.forRoot({
            contextName: 'new',
          }),
        ],
      },
    });

    const infrastructureMarkdownReportStorage = app.get(InfrastructureMarkdownReportStorageService);

    expect(infrastructureMarkdownReportStorage.report).toContain('# test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain('Description for test-app');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_NEW_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_NEW_HOSTNAME']");
    expect(infrastructureMarkdownReportStorage.report).toContain('```2000```');
    process.env['TEST_APP_NEW_PORT'] = undefined;
  });

```

## Код теста

```typescript
  it('should return data from env-file', async () => {
    @Injectable()
    class GetEnv {
      constructor(private readonly dotEnvService: DotEnvService) {}
      getEnv() {
        return this.dotEnvService.read();
      }

      getKeys() {
        return this.dotEnvService.keys(true);
      }
    }
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      imports: [ProjectUtils.forFeature()],
      providers: [GetEnv],
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              applicationPackageJsonFile: `${__filename}-package.json`,
              envFile: `${__filename}-.env`,
            },
          }),
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [AppModule.forRoot()],
        infrastructure: [InfrastructureMarkdownReportGenerator.forRoot()],
      },
    });
    const getEnv = app.get(GetEnv);

    expect(getEnv.getEnv()).toMatchObject({ TEST_APP_PORT: '2000', TEST_APP_HOSTNAME: 'host' });
    expect(getEnv.getKeys()).toEqual(['TEST_APP_PORT', 'TEST_APP_HOSTNAME']);
  });
```
