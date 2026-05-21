---
id: tests-libs-common-src-lib-nest-application-09-should-return-markdown-of-infrastructure-6ea5fbc37f
title: "EnvModel: Returns infrastructure markdown report"
sidebar_label: "09 Returns infrastructure markdown report"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns infrastructure markdown report

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-application/utils.spec.ts#L438)
- **Line**: 438

## Setup Code

```typescript
/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import {
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import { InjectableFeatureConfigurationType } from '../nest-module/types';
import { createNestModule, getNestModuleDecorators } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

describe('NestJS application: Utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalExit: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exitStatus: any;

  beforeAll(() => {
    originalExit = process.exit;
    process.exit = (status) => {
      exitStatus = status;
      return null as never;
    };
  });

  afterAll(() => {
    process.exit = originalExit;
  });

  afterEach(() => {
    exitStatus = null;
  });

  describe('NestJS application with env model', () => {

  });

  describe('NestJS application with config model', () => {

  });
  describe('NestJS application with anv and config model', () => {
  });
  describe('NestJS application with multi-providing options', () => {
  });
  describe('NestJS application get markdown of infrastructure', () => {
    // full test in the block below
  });
});
```

## Test Code

```typescript
    it('should return markdown of infrastructure', async () => {
      process.env['NESTJS_MODE'] = 'infrastructure';
      // App1Module

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

      // Test
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
    System modules necessary for the operation of the entire application (examples: launching a NestJS application, launching microservices, etc.). Only NestJS-mod compatible modules.

    ### DefaultNestApplicationInitializer
    Default NestJS application initializer.

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`cors\`|CORS options from [CORS package](https://github.com/expressjs/cors#configuration-options)|**optional**|\`\`\`{\"credentials\":true,\"methods\":\"GET,HEAD,PUT,PATCH,POST,DELETE\"}\`\`\`|\`\`\`{\"credentials\":true,\"methods\":\"GET,HEAD,PUT,PATCH,POST,DELETE\"}\`\`\`|
    |\`bodyParser\`|Whether to use underlying platform body parser.|**optional**|-|-|
    |\`httpsOptions\`|Set of configurable HTTPS options|**optional**|-|-|
    |\`rawBody\`|Whether to register the raw request body on the request. Use \`req.rawBody\`.|**optional**|-|-|
    |\`defaultLogger\`|Default logger for application|**optional**|-|-|
    |\`logger\`|Specifies the logger to use.Pass \`false\` to turn off logging.|**optional**|-|-|
    |\`abortOnError\`|Whether to abort the process on Error. By default, the process is exited. Pass \`false\` to override the default behavior. If \`false\` is passed, Nest will not exit the application and instead will rethrow the exception. @default true|**optional**|-|-|
    |\`bufferLogs\`|If enabled, logs will be buffered until the \"Logger#flush\" method is called. @default false|**optional**|-|-|
    |\`autoFlushLogs\`|If enabled, logs will be automatically flushed and buffer detached when application initialization process either completes or fails. @default true|**optional**|-|-|
    |\`preview\`|Whether to run application in the preview mode. In the preview mode, providers/controllers are not instantiated & resolved. @default false|**optional**|-|-|
    |\`snapshot\`|Whether to generate a serialized graph snapshot. @default false|**optional**|-|-|
    |\`forceCloseConnections\`|Force close open HTTP connections. Useful if restarting your application hangs due to keep-alive connections in the HTTP adapter.|**optional**|\`\`\`true\`\`\`|\`\`\`true\`\`\`|
    |\`preCreateApplication\`|Method for additional actions before listening|**optional**|-|-|
    |\`postCreateApplication\`|Method for additional actions after listening|**optional**|-|-|

    ## Integration modules
    
    Integration modules are necessary to organize communication between feature or core modules (example: after creating a user in the UsersModule feature module, you need to send him a letter from the NotificationsModule core module). NestJS and NestJS-mod compatible modules.

    ### DefaultNestApplicationListener
    Default NestJS application listener.

    #### Static environments
    Static variables with primitive types used in the module and can be used at the time of generating module metadata (import, controllers), the values of which can be obtained from various sources, such as: process.env or consul key value.

    | Key| Description | Sources | Constraints | Default | Value |
    | ------ | ----------- | ------- | ----------- | ------- | ----- |
    |\`port\`|The port on which to run the server.|\`obj['port']\`, \`process.env['TEST_APP_PORT']\`|**optional**|\`\`\`3000\`\`\`|\`\`\`3012\`\`\`|
    |\`hostname\`|Hostname on which to listen for incoming packets.|\`obj['hostname']\`, \`process.env['TEST_APP_HOSTNAME']\`|**optional**|-|-|

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`mode\`|Mode of start application: init - for run NestJS life cycle, listen -  for full start NestJS application|**optional**|\`\`\`listen\`\`\`|\`\`\`listen\`\`\`|
    |\`preListen\`|Method for additional actions before listening|**optional**|-|-|
    |\`postListen\`|Method for additional actions after listening|**optional**|-|-|
    |\`defaultLogger\`|Default logger for application|**optional**|-|-|
    |\`enableShutdownHooks\`|Enable shutdown hooks|**optional**|\`\`\`false\`\`\`|\`\`\`false\`\`\`|
    |\`globalPrefix\`|Global prefix|**optional**|\`\`\`api\`\`\`|\`\`\`api\`\`\`|    
    |\`autoCloseTimeoutInInfrastructureMode\`|Timeout seconds for automatically closes the application in \`infrastructure mode\` if the application does not close itself (zero - disable)|**optional**|-|-|
    |\`logApplicationStart\`|Log application start|**optional**|\`\`\`true\`\`\`|\`\`\`true\`\`\`|

    ## Infrastructure modules
    Infrastructure modules are needed to create configurations that launch various external services (examples: docker-compose file for raising a database, gitlab configuration for deploying an application). Only NestJS-mod compatible modules.

    ### InfrastructureMarkdownReportStorage
    Infrastructure markdown report storage

    #### Shared providers
    \`InfrastructureMarkdownReportStorageService\`


    ### InfrastructureMarkdownReportGenerator
    Infrastructure markdown report generator.

    #### Shared providers
    \`DynamicNestModuleMetadataMarkdownReportGenerator\`

    #### Static configuration
    Static variables of primitive and complex types that are used in the module and can be used at the time of generating module metadata (import, controllers); values for them must be passed when connecting the module to the application.

    | Key| Description | Constraints | Default | Value |
    | ------ | ----------- | ----------- | ------- | ----- |
    |\`markdownFile\`|Name of the markdown-file in which to save the infrastructure report|**optional**|-|-|
    |\`skipEmptySettings\`|Skip empty values of env and config models|**optional**|-|-|
    |\`style\`|Report generation style|**optional**|\`\`\`full\`\`\`|\`\`\`full\`\`\`|

`
          .split('  ')
          .join('')
          .split('\n')
          .join(''),
      );

      await app.close();

      process.env['NESTJS_MODE'] = undefined;
    });
```
