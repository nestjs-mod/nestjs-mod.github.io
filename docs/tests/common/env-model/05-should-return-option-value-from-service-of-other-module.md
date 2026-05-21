---
id: tests-libs-common-src-lib-env-model-05-should-return-option-value-from-service-of-other-module-49aadcc540
title: "EnvModel: Returns option value from service of other module"
sidebar_label: "05 Returns option value from service of other module"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service of other module

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `envTransform` and `EnvModel/EnvModelProperty` decorators extract and validate env values.
- We confirm expected behavior for missing or invalid required env fields.
- We lock the DI access contract for env values in services.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L195)
- **Line**: 195

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

    @Module({
      imports: [App1Module.forShareEnv()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareEnv(): DynamicModule {
        return {
          module: App1Module,
          providers: [App1Env],
          exports: [App1Env],
        };
      }
      static forRoot(env?: Partial<App1Env>): DynamicModule {
        return {
          module: App1Module,
          providers: [
            {
              provide: `${App1Env.name}_loader`,
              useFactory: async (emptyAppEnv: App1Env) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: App1Env,
                  data: env || {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [App1Env],
            },
          ],
        };
      }
    }

    @Injectable()
    class App2Service {
      constructor(private readonly appService: App1Service) {}

      getEnv() {
        return this.appService.getEnv();
      }
    }

    @Module({
      imports: [App1Module],
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
