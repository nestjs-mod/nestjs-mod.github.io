---
id: tests-libs-common-src-lib-nest-module-08-should-return-option-value-from-service-964e0ac1e6
title: "EnvModel: Returns option value from service"
sidebar_label: "08 Returns option value from service"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L236)
- **Line**: 236

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

    // full test in the block below

  });
  describe('NestJS modules with anv and config model', () => {
  });
  describe('NestJS modules with multi-providing options', () => {
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
  });

  describe('NestJS modules with featureConfigurationClass', () => {

  });
});
```

## Test Code

```typescript
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
        providers: [AppService],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ configuration: { option: 'value1' } })],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getConfig()).toMatchObject({ option: 'value1' });
    });
```
