---
id: tests-libs-common-src-lib-nest-module-13-should-instantiate-feature-configuration-from-class-a6eb478ae5
title: "EnvModel: Instantiate feature configuration from class"
sidebar_label: "13 Instantiate feature configuration from class"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Instantiate feature configuration from class

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L555)
- **Line**: 555

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
    it('should instantiate feature configuration from class', async () => {
      @ConfigModel()
      class DatabaseFeatureConfig {
        @ConfigModelProperty({ default: 'localhost' })
        host!: string;

        @ConfigModelProperty({ default: 'mydb' })
        database!: string;
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
        sharedProviders: [DatabaseService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DatabaseModule.forFeatureAsync({
            featureModuleName: 'UserDB',
            featureConfigurationClass: DatabaseFeatureConfig,
          }),
        ],
        providers: [
          {
            provide: 'DB_CONFIG_CHECKER',
            useFactory: (service: DatabaseService) => {
              const configs = service.getFeatureConfigs();
              return configs[0]?.featureConfiguration;
            },
            inject: [DatabaseService],
          },
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const dbConfigChecker = moduleRef.get('DB_CONFIG_CHECKER');
      expect(dbConfigChecker).toBeDefined();
      expect(dbConfigChecker).toMatchObject({
        host: 'localhost',
        database: 'mydb',
      });
    });
```
