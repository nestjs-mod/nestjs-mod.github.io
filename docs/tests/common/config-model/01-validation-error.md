---
id: tests-common-config-model-01-validation-error-ba31810f67
title: "ConfigModel: Returns error if option of config not set"
sidebar_label: "01 Returns error if option of config not set"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Returns error if option of config not set

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We're Testing

- **Validation Logic**: Ensures `@IsNotEmpty()` decorator on config properties works correctly
- **Error Handling**: Verifies that missing required options throw proper validation errors
- **ConfigModel Integration**: Tests the integration between `ConfigModel`, `ConfigModelProperty`, and `configTransform` utility

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L10-L48)
- **Lines**: 10-48

## Setup Code

The test sets up a configuration model with a required field:

```typescript
import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel()
class AppConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Module({ providers: [AppConfig] })
class AppModule {
  static forRoot(config: Partial<AppConfig>): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: `${AppConfig.name}_loader`,
          useFactory: async (emptyAppConfig: AppConfig) => {
            if (config.constructor !== Object) {
              Object.setPrototypeOf(emptyAppConfig, config);
            }
            const obj = await configTransform({
              model: AppConfig,
              data: config,
            });
            Object.assign(emptyAppConfig, obj.data);
          },
          inject: [AppConfig],
        },
      ],
    };
  }
}
```

## Test Code

```typescript
it('should return error if option of config not set', async () => {
  await expect(
    Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile(),
  ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
});
```

## What This Test Does

1. **Creates a ConfigModel** with a required `option` field decorated with `@IsNotEmpty()`
2. **Attempts to initialize** the module with an empty configuration `{}`
3. **Expects the compilation to fail** with a validation error
4. **Verifies the error message** contains the correct validation constraint: `'option should not be empty'`

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.