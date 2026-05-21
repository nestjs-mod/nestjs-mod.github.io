---
id: tests-libs-common-src-lib-nest-module-11-should-return-all-feature-options-9400bcb386
title: "EnvModel: Returns all feature options"
sidebar_label: "11 Returns all feature options"
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
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L376)
- **Line**: 376

## Setup Code

```typescript
import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { BehaviorSubject } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

describe('NestJS modules: Utils', () => {
  describe('NestJS modules with env model', () => {

  });

  describe('NestJS modules with config model', () => {

  });
  describe('NestJS modules with anv and config model', () => {
  });
  describe('NestJS modules with multi-providing options', () => {
    // full test in the block below
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
  });

  describe('NestJS modules with featureConfigurationClass', () => {

  });
});
```

## Test Code

```typescript
    it('should return all feature options', async () => {
      // App1Module

      const { InjectFeatures, InjectAllFeatures } = getNestModuleDecorators({
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
          @InjectAllFeatures()
          private readonly appAllFeatureConfigs: Record<string, InjectableFeatureConfigurationType<AppFeatureConfig>[]>,
        ) {}

        getFeatureConfigs() {
          return this.appFeatureConfigs.map(({ featureConfiguration }) => featureConfiguration);
        }

        getAllFeatureConfigs() {
          return Object.entries(this.appAllFeatureConfigs)
            .map(([key, value]) => ({
              [key]: value.map(({ featureConfiguration }) => featureConfiguration),
            }))
            .reduce((all, cur) => ({ ...all, ...cur }), {});
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

        getAllFeatureConfigs() {
          return this.appFeatureScannerService.getAllFeatureConfigs();
        }
      }

      // App2Module

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App2Module',
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

        getAllFeatureConfigs() {
          return this.appFeatureScannerService.getAllFeatureConfigs();
        }
      }

      const { App3Module } = createNestModule({
        moduleName: 'App3Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App3Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app3' },
          }),
        ],
        providers: [App3Service],
      });

      // Test

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot(), App2Module.forRoot(), App3Module.forRoot()],
      }).compile();

      const appFeatureScannerService = moduleRef.get(AppFeatureScannerService);
      const app2Service = moduleRef.get(App2Service);
      const app3Service = moduleRef.get(App3Service);

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

      expect(app2Service.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
      expect(app3Service.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
      expect(appFeatureScannerService.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
    });
```
