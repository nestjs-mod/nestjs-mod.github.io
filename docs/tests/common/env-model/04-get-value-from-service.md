---
id: tests-common-env-model-04-get-value-from-service-4e223e10b3
title: "EnvModel: Returns option value from service"
sidebar_label: "04 Returns option value from service"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns option value from service

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Environment Variable Reading**: Ensures values are read from `process.env`
- **Dependency Injection**: Verifies EnvModel is properly injected into services
- **Environment Assignment**: Confirms environment variables are set on the model instance
- **Service Integration**: Tests that services can access environment values through injected models

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L143-L193)
- **Lines**: 143-193

## Setup Code

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
```

## Test Code

```typescript
it('should return option value from service', async () => {
  process.env['OPTION'] = 'value1';

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule.forRoot({})],
  }).compile();
  const appService = moduleRef.get(AppService);

  expect(appService.getEnv()).toMatchObject({ option: 'value1' });
});
```

## What This Test Does

1. **Sets an environment variable** `process.env['OPTION'] = 'value1'`
2. **Creates an EnvModel** with a required `option` field
3. **Creates a service** that injects the EnvModel and provides a getter
4. **Initializes the module** with an empty config (values come from process.env)
5. **Compiles the testing module** successfully (validation passes from environment variable)
6. **Retrieves the service** from the module container
7. **Verifies the service** returns the correct environment value through `getEnv()`

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.