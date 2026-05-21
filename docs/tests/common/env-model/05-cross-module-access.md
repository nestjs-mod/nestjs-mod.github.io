---
id: tests-common-env-model-05-cross-module-access-8b442316f6
title: "EnvModel: Returns option value from service of other module"
sidebar_label: "05 Returns option value from service of other module"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service of other module

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Module Sharing**: Ensures EnvModel can be exported and imported across modules
- **Cross-Module DI**: Verifies dependency injection works across module boundaries
- **Environment Propagation**: Tests that environment values are available in importing modules
- **Module Architecture**: Validates the pattern of shared environment modules

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L195-L272)
- **Lines**: 195-272

## Setup Code

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
```

## Test Code

```typescript
it('should return option value from service of other module', async () => {
  process.env['OPTION'] = 'value1';

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [App1Module.forRoot({}), App2Module],
  }).compile();
  const app2Service = moduleRef.get(App2Service);

  expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
});
```

## What This Test Does

1. **Sets an environment variable** `process.env['OPTION'] = 'value1'`

2. **Creates App1Module** with:
   - An EnvModel (`App1Env`) that reads from environment
   - A service (`App1Service`) that uses the env model
   - Two static methods: `forRoot()` for initialization and `forShareEnv()` for sharing

3. **Creates App2Module** that:
   - Imports App1Module to access shared providers
   - Defines `App2Service` that depends on `App1Service`

4. **Initializes both modules** (environment variable provides the value)

5. **Retrieves App2Service** from the compiled module

6. **Verifies** that App2Service can access the environment value through App1Service

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.