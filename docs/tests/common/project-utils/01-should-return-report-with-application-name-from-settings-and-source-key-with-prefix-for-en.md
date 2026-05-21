---
id: tests-libs-common-src-lib-modules-system-project-utils-01-should-return-report-with-application-name-from-settings-and-source--cb6c1030a3
title: "NestModule: Returns report with application name from settings and source key with prefix for env"
sidebar_label: "01 Returns report with application name from settings and source key with prefix for env"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: Returns report with application name from settings and source key with prefix for env

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L25)
- **Line**: 25

## Setup Code

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

## Test Code

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
