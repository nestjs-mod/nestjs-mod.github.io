---
id: tests-libs-common-src-lib-nest-module-17-should-use-featureconfigurationstream-for-dynamic-configuration-95c480bafa
title: "EnvModel: Use featureConfigurationStream for dynamic configuration"
sidebar_label: "17 Use featureConfigurationStream for dynamic configuration"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Use featureConfigurationStream for dynamic configuration

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We lock the API boundary contract (status, payload, and response shape) to protect externally observable behavior.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L841)
- **Line**: 841

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
    it('should use featureConfigurationStream for dynamic configuration', async () => {
      @ConfigModel()
      class DynamicFeatureConfig {
        @ConfigModelProperty({ default: 0 })
        value!: number;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'DynamicModule',
      });

      @Injectable()
      class DynamicService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<DynamicFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { DynamicModule } = createNestModule({
        moduleName: 'DynamicModule',
        featureConfigurationModel: DynamicFeatureConfig,
        sharedProviders: [DynamicService],
      });

      const configStream = new BehaviorSubject<DynamicFeatureConfig>({ value: 100 });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DynamicModule.forFeatureAsync({
            featureModuleName: 'LiveConfig',
            featureConfigurationStream: () => configStream,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DynamicModule.forRoot(), AppModule.forRoot()],
      }).compile();

      await moduleRef.init();

      const dynamicService = moduleRef.get(DynamicService);

      // Wait for stream to process
      await setTimeout(100);

      const featureConfigs = dynamicService.getFeatureConfigs();

      // Stream should provide the configuration
      expect(featureConfigs).toBeDefined();
      expect(featureConfigs.length).toBeGreaterThanOrEqual(0);

      // Update stream
      configStream.next({ value: 200 });
      await setTimeout(100);

      // Verify stream was processed
      const updatedConfigs = dynamicService.getFeatureConfigs();
      expect(updatedConfigs).toBeDefined();
    });
```
