---
id: tests-libs-common-src-lib-env-model-04-should-return-option-value-from-service-9a34a2d724
title: "EnvModel: Returns option value from service"
sidebar_label: "04 Returns option value from service"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `envTransform` and `EnvModel/EnvModelProperty` decorators extract and validate env values.
- We confirm expected behavior for missing or invalid required env fields.
- We lock the DI access contract for env values in services.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L143)
- **Line**: 143

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
  it('should return option value from service', async () => {
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

    @Module({ providers: [AppEnv, AppService] })
    class AppModule {
      static forRoot(env?: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env || {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
            },
          ],
        };
      }
    }

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
    const appService = moduleRef.get(AppService);

    expect(appService.getEnv()).toMatchObject({ option: 'value1' });
  });
```
