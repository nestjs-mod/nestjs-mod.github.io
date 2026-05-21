---
id: tests-libs-common-src-lib-modules-system-project-utils-04-should-return-report-with-application-name-from-package-json-and-ext-ca547a3aec
title: "NestModule: Returns report with application name from package.json and extended source key for env and use contextName, use .env file for receiving"
sidebar_label: "04 Returns report with application name from package.json and extended source key for env and use contextName, use .env file for receiving"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: Returns report with application name from package.json and extended source key for env and use contextName, use .env file for receiving

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [project-utils.module.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/modules/system/project-utils/project-utils.module.spec.ts#L150)
- **Line**: 150

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

    expect(infrastructureMarkdownReportStorage.report).toContain('# TestApp');
    expect(infrastructureMarkdownReportStorage.report).toContain('Test application');
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_PORT']");
    expect(infrastructureMarkdownReportStorage.report).toContain("process.env['TEST_APP_HOSTNAME']");
  });

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

```

## Test Code

```typescript
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
```
