---
id: tests-libs-common-src-lib-nest-module-06-should-return-error-if-option-of-env-not-set-94cdad4e56
title: "EnvModel: Returns error if option of env not set"
sidebar_label: "06 Returns error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-module/utils.spec.ts#L182)
- **Line**: 182

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
    it('should return error if option of env not set', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @EnvModel({ name: 'model name', description: 'model description' })
      class AppEnv {
        @EnvModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toMatchObject({
        info: {
          modelPropertyOptions: [{ description: 'option description', originalName: 'option' }],
          modelOptions: {
            name: 'model name',
            description: 'model description',
            originalName: 'AppEnv',
          },
          validations: {
            option: {
              constraints: { isNotEmpty: 'option should not be empty' },
            },
          },
        },
      });
    });

    it('should return option value from service use env', async () => {
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

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });
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
  });

  describe('NestJS modules with config model', () => {
```

## Test Code

```typescript
    it('should return error if option of env not set', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @ConfigModel({ name: 'model name', description: 'model description' })
      class AppConfig {
        @ConfigModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
```
