---
id: tests-libs-common-src-lib-modules-system-project-utils-06-should-return-data-from-package-json-file-40c11a05a8
title: "NestModule: Returns data from package.json-file"
sidebar_label: "06 Returns data from package.json-file"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: Returns data from package.json-file

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L238)
- **Line**: 238

## Setup Code

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

  // full test in the block below
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

## Test Code

```typescript
  it('should return data from package.json-file', async () => {
    @Injectable()
    class GetPackageJson {
      constructor(
        private readonly applicationPackageJsonService: ApplicationPackageJsonService,
        private readonly packageJsonService: PackageJsonService,
      ) {}

      getApplicationPackageJson() {
        return this.applicationPackageJsonService.read();
      }

      getPackageJson() {
        return this.packageJsonService.read();
      }
    }
    const { AppModule } = createNestModule({
      moduleName: 'AppModule',
      imports: [ProjectUtils.forFeature()],
      providers: [GetPackageJson],
    });

    const app = await bootstrapNestApplication({
      globalEnvironmentsOptions: { debug: true },
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              packageJsonFile: `${__filename}-second-package.json`,
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
    const getPackageJson = app.get(GetPackageJson);

    expect(getPackageJson.getApplicationPackageJson()).toEqual({
      name: 'test-app',
      description: 'Description for test-app',
      version: '1.0.0',
      devDependencies: {
        '@commitlint/cli': '^17.0.0',
      },
      dependencies: {
        '@fastify/cookie': '^9.3.1',
      },
    });
    expect(getPackageJson.getPackageJson()).toEqual({
      name: 'second-test-app',
      description: 'Description for second-test-app',
      version: '1.0.0',
    });
  });
```
