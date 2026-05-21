---
id: tests-libs-common-src-lib-nest-module-10-should-use-env-model-and-config-model-70fe77af2b
title: "EnvModel: Use env model and config model"
sidebar_label: "10 Use env model and config model"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Use env model and config model

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L320)
- **Line**: 320

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
    // full test in the block below
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

      process.env['OPTION_ENV'] = 'optionEnv1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            configuration: { optionConfig: 'optionConfig1' },
          }),
        ],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getConfig()).toMatchObject({
        optionConfig: 'optionConfig1',
      });
      expect(appService.getEnv()).toMatchObject({ optionEnv: 'optionEnv1' });
    });
```
