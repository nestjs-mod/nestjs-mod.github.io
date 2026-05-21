---
id: tests-libs-common-src-lib-nest-module-18-should-support-multiple-feature-modules-with-different-configuration-methods-07fd86c314
title: "EnvModel: Support multiple feature modules with different configuration methods"
sidebar_label: "18 Support multiple feature modules with different configuration methods"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Support multiple feature modules with different configuration methods

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We lock the API boundary contract (status, payload, and response shape) to protect externally observable behavior.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L909)
- **Line**: 909

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
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
  });

  describe('NestJS modules with featureConfigurationClass', () => {

    // full test in the block below
  });
});
```

## Test Code

```typescript
    it('should support multiple feature modules with different configuration methods', async () => {
      @ConfigModel()
      class ServiceFeatureConfig {
        @ConfigModelProperty({ default: 'feature1' })
        name!: string;

        @ConfigModelProperty({ default: true })
        enabled!: boolean;
      }

      const { InjectAllFeatures } = getNestModuleDecorators({
        moduleName: 'ServiceModule',
      });

      @Injectable()
      class ServiceScannerService {
        constructor(
          @InjectAllFeatures()
          private readonly allFeatureConfigs: Record<string, InjectableFeatureConfigurationType<ServiceFeatureConfig>[]>,
        ) {}

        getAllFeatureConfigs() {
          return this.allFeatureConfigs;
        }
      }

      const { ServiceModule } = createNestModule({
        moduleName: 'ServiceModule',
        featureConfigurationModel: ServiceFeatureConfig,
        sharedProviders: [ServiceScannerService],
      });

      // Feature 1: Using class
      const { Feature1Module } = createNestModule({
        moduleName: 'Feature1Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature1',
            featureConfigurationClass: ServiceFeatureConfig,
          }),
        ],
      });

      // Feature 2: Using factory
      const { Feature2Module } = createNestModule({
        moduleName: 'Feature2Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature2',
            featureConfigurationFactory: () => ({
              name: 'feature2',
              enabled: true,
            }),
          }),
        ],
      });

      // Feature 3: Using existing
      const existingConfig = new ServiceFeatureConfig();
      existingConfig.name = 'feature3';
      existingConfig.enabled = false;

      const { Feature3Module } = createNestModule({
        moduleName: 'Feature3Module',
        imports: [
          ServiceModule.forFeatureAsync({
            featureModuleName: 'Feature3',
            featureConfigurationExisting: existingConfig,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          ServiceModule.forRoot(),
          Feature1Module.forRoot(),
          Feature2Module.forRoot(),
          Feature3Module.forRoot(),
        ],
      }).compile();

      const scannerService = moduleRef.get(ServiceScannerService);
      const allConfigs = scannerService.getAllFeatureConfigs();

      expect(allConfigs['default']).toHaveLength(3);
      
      // Find configs by featureModuleName since order may vary
      const feature1 = allConfigs['default'].find(c => c.featureModuleName === 'Feature1');
      const feature2 = allConfigs['default'].find(c => c.featureModuleName === 'Feature2');
      const feature3 = allConfigs['default'].find(c => c.featureModuleName === 'Feature3');
      
      expect(feature1?.featureConfiguration).toMatchObject({
        name: 'feature1',
        enabled: true,
      });
      expect(feature2?.featureConfiguration).toMatchObject({
        name: 'feature2',
        enabled: true,
      });
      expect(feature3?.featureConfiguration).toMatchObject({
        name: 'feature3',
        enabled: false,
      });
    });
```
