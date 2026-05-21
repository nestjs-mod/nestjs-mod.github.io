---
id: tests-libs-common-src-lib-nest-module-05-should-return-option-value-from-service-of-other-module-205e1c22b7
title: "EnvModel: Returns option value from service of other module"
sidebar_label: "05 Returns option value from service of other module"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service of other module

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L132)
- **Line**: 132

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
    it('should return option value from service of other module', async () => {
      @EnvModel()
      class App1Env {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appEnv: App1Env) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        environmentsModel: App1Env,
        sharedProviders: [App1Service],
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appService: App1Service) {}

        getEnv() {
          return this.appService.getEnv();
        }
      }

      @Module({
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      })
      class App2Module {}

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot({}), App2Module],
      }).compile();
      const app2Service = moduleRef.get(App2Service);

      expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
    });
```
