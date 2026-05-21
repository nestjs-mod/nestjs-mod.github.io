---
id: tests-libs-common-src-lib-env-model-03-should-return-model-info-in-error-if-option-of-env-not-set-8a6323a1ff
title: "EnvModel: Returns model info in error if option of env not set"
sidebar_label: "03 Returns model info in error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns model info in error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `envTransform` and `EnvModel/EnvModelProperty` decorators extract and validate env values.
- We confirm expected behavior for missing or invalid required env fields.
- We lock the DI access contract for env values in services.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L91)
- **Line**: 91

## Setup Code

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

describe('Env model: Utils', () => {
  it('should return error if option of env not set', async () => {
    @EnvModel()
    class AppEnv {
      @EnvModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppEnv] })
    class AppModule {
      static forRoot(env: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env,
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
            },
          ],
        };
      }
    }

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile(),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
  });

  it('should return error message if option of env not set', async () => {
    try {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Module({ providers: [AppEnv] })
      class AppModule {
        static forRoot(env: Partial<AppEnv>): DynamicModule {
          return {
            module: AppModule,
            providers: [
              {
                provide: `${AppEnv.name}_loader`,
                useFactory: async (emptyAppEnv: AppEnv) => {
                  if (env.constructor !== Object) {
                    Object.setPrototypeOf(emptyAppEnv, env);
                  }
                  const obj = await envTransform({
                    model: AppEnv,
                    data: env,
                  });
                  Object.assign(emptyAppEnv, obj.data);
                },
                inject: [AppEnv],
              },
            ],
          };
        }
      }

      await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      expect(err.message).toEqual(`obj['option'],process.env['OPTION']-isNotEmpty`);
    }
  });

```

## Test Code

```typescript
  it('should return model info in error if option of env not set', async () => {
    @EnvModel({ name: 'model name', description: 'model description' })
    class AppEnv {
      @EnvModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppEnv] })
    class AppModule {
      static forRoot(env: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env,
                });
                Object.assign(emptyAppEnv, obj.data);
              },
```
