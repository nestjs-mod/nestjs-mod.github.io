---
id: tests-common-env-model-02-error-message-e2824015c0
title: "EnvModel: Returns error message if option of env not set"
sidebar_label: "02 Returns error message if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error message if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Error Message Format**: Ensures error messages include source tracking information
- **Dual Source Display**: Verifies both object property and process.env variable names are shown
- **Validation Details**: Confirms the validation constraint is included in the message

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/utils.spec.ts#L48-L89)
- **Lines**: 48-89

## Setup Code

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
it('should return error message if option of env not set', async () => {
  try {
    await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
  } catch (err: any) {
    expect(err.message).toEqual(`obj['option'],process.env['OPTION']-isNotEmpty`);
  }
});
```

## What This Test Does

1. **Creates an EnvModel** with a required `option` field
2. **Attempts to initialize** the module without providing the environment variable
3. **Catches the validation error**
4. **Verifies the error message** contains a specific format: `obj['option'],process.env['OPTION']-isNotEmpty`

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.