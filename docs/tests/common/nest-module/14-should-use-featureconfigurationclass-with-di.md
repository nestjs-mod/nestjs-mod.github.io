---
id: tests-libs-common-src-lib-nest-module-14-should-use-featureconfigurationclass-with-di-4d19f7a096
title: "EnvModel: Uses featureConfigurationClass with DI"
sidebar_label: "14 Uses featureConfigurationClass with DI"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Uses featureConfigurationClass with DI

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L619)
- **Line**: 619

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
    it('should use featureConfigurationClass with DI', async () => {
      @ConfigModel()
      class DatabaseFeatureConfig {
        @ConfigModelProperty({ default: 'localhost' })
        host!: string;

        @ConfigModelProperty({ default: 5432 })
        port!: number;

        @ConfigModelProperty({ default: 'mydb' })
        database!: string;
      }

      // Service to be injected into config class
      @Injectable()
      class ConfigHelper {
        getDefaultHost() {
          return 'db.example.com';
        }
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'DatabaseModule',
      });

      @Injectable()
      class DatabaseService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<DatabaseFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { DatabaseModule } = createNestModule({
        moduleName: 'DatabaseModule',
        featureConfigurationModel: DatabaseFeatureConfig,
        sharedProviders: [DatabaseService, ConfigHelper],
      });

      // Config class with DI - constructor can inject dependencies
      @Injectable()
      class DatabaseConfigClass {
        constructor(
          private readonly configHelper: ConfigHelper,
        ) {}

        host = this.configHelper.getDefaultHost();
        port = 5432;
        database = 'production_db';
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DatabaseModule.forFeatureAsync({
            featureModuleName: 'MainDatabase',
            featureConfigurationClass: DatabaseConfigClass,
            inject: [ConfigHelper],
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
        providers: [ConfigHelper],
      }).compile();

      const databaseService = moduleRef.get(DatabaseService);
      const featureConfigs = databaseService.getFeatureConfigs();

      expect(featureConfigs).toBeDefined();
      expect(featureConfigs.length).toBeGreaterThanOrEqual(1);
      
      const config = featureConfigs[0];
      expect(config.featureModuleName).toBe('MainDatabase');
      expect(config.featureConfiguration).toMatchObject({
        host: 'db.example.com', // From injected ConfigHelper
        port: 5432,
        database: 'production_db',
      });
    });
```
