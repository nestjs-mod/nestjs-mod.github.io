---
id: tests-common-env-model-01-validation-error-019ca9e4a5
title: "EnvModel: Returns error if option of env not set"
sidebar_label: "01 Returns error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Environment Validation**: Ensures `@IsNotEmpty()` decorator on env properties works correctly
- **Error Handling**: Verifies that missing required environment variables throw proper validation errors
- **EnvModel Integration**: Tests the integration between `EnvModel`, `EnvModelProperty`, and `envTransform` utility
- **Process.env Mapping**: Validates that environment variables are read from `process.env`

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L8-L46)
- **Lines**: 8-46

## Setup Code

The test sets up an environment model with a required field:

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
```

## Test Code

```typescript
it('should return error if option of env not set', async () => {
  await expect(
    Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile(),
  ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
});
```

## What This Test Does

1. **Creates an EnvModel** with a required `option` field decorated with `@IsNotEmpty()`
2. **Attempts to initialize** the module with an empty configuration `{}`
3. **Expects the compilation to fail** with a validation error
4. **Verifies the error message** contains the correct validation constraint: `'option should not be empty'`

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.