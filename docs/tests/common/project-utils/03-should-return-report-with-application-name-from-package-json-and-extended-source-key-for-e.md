---
id: tests-libs-common-src-lib-modules-system-project-utils-03-should-return-report-with-application-name-from-package-json-and-ext-3d30766c7a
title: "NestModule: Returns report with application name from package.json and extended source key for env"
sidebar_label: "03 Returns report with application name from package.json and extended source key for env"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: Returns report with application name from package.json and extended source key for env

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L122)
- **Line**: 122

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
```

## Test Code

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
