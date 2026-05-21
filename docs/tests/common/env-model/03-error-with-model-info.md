---
id: tests-common-env-model-03-error-with-model-info-2fdf4d83d5
title: "EnvModel: Returns model info in error if option of env not set"
sidebar_label: "03 Returns model info in error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns model info in error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Error Metadata**: Ensures validation errors include model and property metadata
- **Model Options**: Verifies model name and description are included in errors
- **Property Options**: Checks that property descriptions are preserved in error info
- **Validation Details**: Confirms validation constraints are detailed in the error

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L91-L141)
- **Lines**: 91-141

## Setup Code

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

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
          inject: [AppEnv],
        },
      ],
    };
  }
}
```

## Test Code

```typescript
it('should return model info in error if option of env not set', async () => {
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
        option: { constraints: { isNotEmpty: 'option should not be empty' } },
      },
    },
  });
});
```

## What This Test Does

1. **Creates an EnvModel** with rich metadata (name, description, property description)
2. **Attempts to initialize** the module without the required environment variable
3. **Expects validation to fail** and checks the error object structure
4. **Verifies the error includes**:
   - `modelPropertyOptions`: Property-level metadata with descriptions
   - `modelOptions`: Model-level metadata with name and description
   - `validations`: Detailed validation constraint information

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.