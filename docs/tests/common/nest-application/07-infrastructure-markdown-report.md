---
id: tests-common-nest-application-07-infrastructure-markdown-report-e9e8e06af0
title: "NestModule: NestJS App Infrastructure Markdown Report Test"
sidebar_label: "07 NestJS App Infrastructure Markdown Report Test"
description: "Test section context: These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration."
---

# NestModule: NestJS App Infrastructure Markdown Report Test

## Overview

These tests validate nestjs-mod module architecture: module assembly via createNestModule, DI wiring, and feature configuration.

## What We're Testing

- **Infrastructure Mode**: Ensures application can run in infrastructure documentation generation mode
- **Report Generation**: Verifies complete markdown report is generated with all module details
- **Configuration Documentation**: Tests that all static configurations and environments are documented
- **Module Metadata**: Confirms module descriptions, shared providers, and settings are included
- **Table Formatting**: Validates proper markdown table generation for configuration options

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-application/utils.spec.ts#L437-L572)
- **Lines**: 437-572

## Setup Code

This test sets up infrastructure modules for report generation:

```typescript
import { Injectable } from '@nestjs/common';
import { InfrastructureMarkdownReportGenerator, 
         InfrastructureMarkdownReportStorage,
         InfrastructureMarkdownReportStorageService } from '../modules/infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import { createNestModule } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

@Injectable()
class AppReportService {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService) {}

  getReport() {
    return this.infrastructureMarkdownReportStorage.report;
  }
}

const { App1Module } = createNestModule({
  moduleName: 'App1Module',
  imports: [InfrastructureMarkdownReportStorage.forFeature()],
  providers: [AppReportService],
});
```

## Test Code

```typescript
it('should return markdown of infrastructure', async () => {
  process.env['NESTJS_MODE'] = 'infrastructure';
  
  const app = await bootstrapNestApplication({
    project: { name: 'TestApp', description: 'Test application' },
    modules: {
      infrastructure: [
        InfrastructureMarkdownReportStorage.forRoot(),
        InfrastructureMarkdownReportGenerator.forRoot(),
      ],
      system: [
        DefaultNestApplicationInitializer.forRoot(),
        DefaultNestApplicationListener.forRoot({
          staticEnvironments: { port: 3012 },
        }),
      ],
      feature: [App1Module.forRoot()],
    },
  });

  const appReportService = app.get(AppReportService);
  expect(appReportService.getReport().split('  ').join('').split('\n').join('')).toEqual(
    `# TestApp

Test application

## System modules
System modules necessary for the operation of the entire application...

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration
| Key| Description | Constraints | Default | Value |
| ------ | ----------- | ----------- | ------- | ----- |
| cors |CORS options...|optional|{"credentials":true...}|{"credentials":true...}|
...

## Integration modules
...

### DefaultNestApplicationListener
...

#### Static environments
| Key| Description | Sources | Constraints | Default | Value |
| ------ | ----------- | ------- | ----------- | ------- | ----- |
| port |The port...|obj['port'], process.env['TEST_APP_PORT']|optional|3000|3012|
...

## Infrastructure modules
...
`.split('  ').join('').split('\n').join('')
  );

  await app.close();
  process.env['NESTJS_MODE'] = undefined;
});
```

## What This Test Does

1. **Sets infrastructure mode** via `process.env['NESTJS_MODE'] = 'infrastructure'`
2. **Configures infrastructure modules** for report storage and generation
3. **Sets up system modules** with custom port configuration (3012)
4. **Bootstraps the application** in infrastructure mode
5. **Retrieves the generated report** from InfrastructureMarkdownReportStorageService
6. **Normalizes whitespace** and compares against expected markdown structure
7. **Verifies the report contains**:
   - Project name and description
   - System modules with their static configurations
   - Integration modules with environments and configurations
   - Infrastructure modules with shared providers
   - Detailed tables showing keys, descriptions, sources, constraints, defaults, and values
8. **Cleans up** by closing the app and resetting the mode

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.