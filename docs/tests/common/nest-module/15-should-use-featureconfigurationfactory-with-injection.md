---
id: tests-libs-common-src-lib-nest-module-15-should-use-featureconfigurationfactory-with-injection-213f4a6165
title: "EnvModel: Use featureConfigurationFactory with injection"
sidebar_label: "15 Use featureConfigurationFactory with injection"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Use featureConfigurationFactory with injection

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We lock the API boundary contract (status, payload, and response shape) to protect externally observable behavior.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L705)
- **Line**: 705

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
    it('should use featureConfigurationFactory with injection', async () => {
      @ConfigModel()
      class ApiFeatureConfig {
        @ConfigModelProperty({ default: 'https://api.example.com' })
        apiUrl!: string;

        @ConfigModelProperty({ default: 5000 })
        timeout!: number;
      }

      @Injectable()
      class ConfigProvider {
        getConfig() {
          return {
            apiUrl: 'https://api.custom.com',
            timeout: 3000,
          };
        }
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'ApiModule',
      });

      @Injectable()
      class ApiService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<ApiFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { ApiModule } = createNestModule({
        moduleName: 'ApiModule',
        featureConfigurationModel: ApiFeatureConfig,
        sharedProviders: [ConfigProvider, ApiService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          ApiModule.forFeatureAsync({
            featureModuleName: 'ExternalApi',
            featureConfigurationFactory: (configProvider: ConfigProvider) => {
              const config = configProvider.getConfig();
              return {
                apiUrl: config.apiUrl,
                timeout: config.timeout,
              };
            },
            inject: [ConfigProvider],
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [ApiModule.forRoot(), AppModule.forRoot()],
      }).compile();

      await moduleRef.init();

      const apiService = moduleRef.get(ApiService);
      const featureConfigs = apiService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        apiUrl: 'https://api.custom.com',
        timeout: 3000,
      });
    });
```
