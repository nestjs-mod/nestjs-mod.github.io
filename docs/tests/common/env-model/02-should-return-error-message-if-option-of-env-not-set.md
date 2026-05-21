---
id: tests-libs-common-src-lib-env-model-02-should-return-error-message-if-option-of-env-not-set-556310cd6a
title: "EnvModel: Returns error message if option of env not set"
sidebar_label: "02 Returns error message if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error message if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `envTransform` and `EnvModel/EnvModelProperty` decorators extract and validate env values.
- We confirm expected behavior for missing or invalid required env fields.
- We lock the DI access contract for env values in services.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L48)
- **Line**: 48

## Setup Code

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

describe('Env model: Utils', () => {

  // full test in the block below

});
```

## Test Code

```typescript
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
