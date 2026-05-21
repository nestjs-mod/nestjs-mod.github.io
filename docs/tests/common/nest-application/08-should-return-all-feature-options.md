---
id: tests-libs-common-src-lib-nest-application-08-should-return-all-feature-options-7ad0515f13
title: "EnvModel: Returns all feature options"
sidebar_label: "08 Returns all feature options"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns all feature options

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-application/utils.spec.ts#L336)
- **Line**: 336

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
    // full test in the block below
  });
  describe('NestJS application get markdown of infrastructure', () => {
  });
});
```

## Test Code

```typescript
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
```
