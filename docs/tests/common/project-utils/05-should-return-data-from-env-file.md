---
id: tests-libs-common-src-lib-modules-system-project-utils-05-should-return-data-from-env-file-f3b76b91e3
title: "NestModule: Returns data from env-file"
sidebar_label: "05 Returns data from env-file"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: Returns data from env-file

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L197)
- **Line**: 197

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

```

## Test Code

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
