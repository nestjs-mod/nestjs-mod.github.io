---
id: tests-libs-common-src-lib-nest-module-04-should-return-option-value-from-service-use-env-and-contextname-e407d1cf3f
title: "EnvModel: Returns option value from service use env and contextName"
sidebar_label: "04 Returns option value from service use env and contextName"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service use env and contextName

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L99)
- **Line**: 99

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

    // full test in the block below

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

  });
});
```

## Test Code

```typescript
    it('should return option value from service use env and contextName', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['CTX_OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ contextName: 'CTX' })],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });
```
