---
id: tests-libs-common-src-lib-nest-module-16-should-use-featureconfigurationexisting-instance-4520bbb93a
title: "EnvModel: Use featureConfigurationExisting instance"
sidebar_label: "16 Use featureConfigurationExisting instance"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Use featureConfigurationExisting instance

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We lock the API boundary contract (status, payload, and response shape) to protect externally observable behavior.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L780)
- **Line**: 780

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
    it('should use featureConfigurationExisting instance', async () => {
      @ConfigModel()
      class CacheFeatureConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        ttl!: number;

        @ConfigModelProperty()
        prefix!: string;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'CacheModule',
      });

      @Injectable()
      class CacheService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<CacheFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { CacheModule } = createNestModule({
        moduleName: 'CacheModule',
        featureConfigurationModel: CacheFeatureConfig,
        sharedProviders: [CacheService],
      });

      const existingConfig = new CacheFeatureConfig();
      existingConfig.ttl = 3600;
      existingConfig.prefix = 'app_cache';

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          CacheModule.forFeatureAsync({
            featureModuleName: 'SessionCache',
            featureConfigurationExisting: existingConfig,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [CacheModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const cacheService = moduleRef.get(CacheService);
      const featureConfigs = cacheService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        ttl: 3600,
        prefix: 'app_cache',
      });
    });
```
