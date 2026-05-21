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

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-application/utils.spec.ts#L438)
- **Line**: 438

## Setup Code

```typescript
/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import {
  InfrastructureMarkdownReportGenerator,
  InfrastructureMarkdownReportStorage,
  InfrastructureMarkdownReportStorageService,
} from '../modules/infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
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
    it('should return error if option of env not set', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      expect(exitStatus).toEqual(1);
    });

    it('should return option value from service', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['TEST_APP_OPTION'] = 'value1';

      const app = await bootstrapNestApplication({
        globalEnvironmentsOptions: { debug: true },
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @EnvModel()
      class App1Env {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appEnv: App1Env) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        environmentsModel: App1Env,
        sharedProviders: [App1Service],
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appService: App1Service) {}

        getEnv() {
          return this.appService.getEnv();
        }
      }

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      });

      process.env['TEST_APP_OPTION'] = 'value1';

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot({}), App2Module.forRoot()],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
    });
  });

  describe('NestJS application with config model', () => {
    it('should return error if option of env not set', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot()],
        },
      });

      expect(exitStatus).toEqual(1);
    });

    it('should return option value from service', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appConfig: AppConfig) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
        sharedProviders: [AppService],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [AppModule.forRoot({ configuration: { option: 'value1' } })],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getConfig()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @ConfigModel()
      class App1Config {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appConfig: App1Config) {}

        getConfig() {
          return this.appConfig;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        configurationModel: App1Config,
        sharedProviders: [App1Service],
      });
      const { InjectService } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @Injectable()
      class App2Service {
        constructor(
          @InjectService(App1Service)
          private readonly appService: App1Service,
        ) {}

        getConfig() {
          return this.appService.getConfig();
        }
      }
      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      });

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot({ configuration: { option: 'value1' } }), App2Module.forRoot()],
        },
      });

      const app2Service = app.get(App2Service);

      expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
    });
  });
  describe('NestJS application with anv and config model', () => {
    it('should use env model and config model', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        optionConfig!: string;
      }

      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        optionEnv!: string;
      }

      @Injectable()
      class AppService {
        constructor(
          private readonly appConfig: AppConfig,
          private readonly appEnv: AppEnv,
        ) {}

        getEnv() {
          return this.appEnv;
        }

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        providers: [AppService],
        configurationModel: AppConfig,
        environmentsModel: AppEnv,
      });

      process.env['TEST_APP_OPTION_ENV'] = 'optionEnv1';

      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [
            AppModule.forRoot({
              configuration: { optionConfig: 'optionConfig1' },
            }),
          ],
        },
      });

      const appService = app.get(AppService);

      expect(appService.getConfig()).toMatchObject({
        optionConfig: 'optionConfig1',
      });
      expect(appService.getEnv()).toMatchObject({ optionEnv: 'optionEnv1' });
    });
  });
  describe('NestJS application with multi-providing options', () => {
    it('should return all feature options', async () => {
      // App1Module

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @ConfigModel()
      class AppFeatureConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        featureOptionConfig!: string;
      }

      @Injectable()
      class AppFeatureScannerService {
        constructor(
          @InjectFeatures()
          private readonly appFeatureConfigs: InjectableFeatureConfigurationType<AppFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.appFeatureConfigs.map(({ featureConfiguration }) => featureConfiguration);
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        sharedProviders: [AppFeatureScannerService],
        featureConfigurationModel: AppFeatureConfig,
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      // App2Module

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App1Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app2' },
          }),
        ],
        providers: [App2Service],
      });

      @Injectable()
      class App3Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }
      }

      const { App3Module } = createNestModule({
        moduleName: 'App3Module',
        imports: [
          App1Module.forFeatureAsync({
            featureModuleName: 'App3Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app3' },
          }),
        ],
        providers: [App3Service],
      });

      // Test
      const app = await bootstrapNestApplication({
        project: { name: 'TestApp', description: 'Test application' },
        modules: {
          system: [DefaultNestApplicationInitializer.forRoot()],
          feature: [App1Module.forRoot(), App2Module.forRoot(), App3Module.forRoot()],
        },
      });

      const appFeatureScannerService = app.get(AppFeatureScannerService);
      const app2Service = app.get(App2Service);
      const app3Service = app.get(App3Service);

      expect(app2Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(app3Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(appFeatureScannerService.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
    });
  });
  describe('NestJS application get markdown of infrastructure', () => {
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
```
