---
id: tests-common-config-model-02-error-with-model-info-d8339c842f
title: "ConfigModel: Returns model info in error if option of config not set"
sidebar_label: "02 Returns model info in error if option of config not set"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Returns model info in error if option of config not set

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We're Testing

- **Error Metadata**: Ensures validation errors include model and property metadata
- **Model Options**: Verifies model name and description are included in errors
- **Property Options**: Checks that property descriptions are preserved in error info
- **Validation Details**: Confirms validation constraints are detailed in the error

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L50-L100)
- **Lines**: 50-100

## Setup Code

The test creates a ConfigModel with detailed metadata:

```typescript
import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel({ name: 'model name', description: 'model description' })
class AppConfig {
  @ConfigModelProperty({ description: 'option description' })
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
it('should return model info in error if option of config not set', async () => {
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
        originalName: 'AppConfig',
      },
      validations: {
        option: { constraints: { isNotEmpty: 'option should not be empty' } },
      },
    },
  });
});
```

## What This Test Does

1. **Creates a ConfigModel** with rich metadata (name, description, property description)
2. **Attempts to initialize** the module with an empty configuration
3. **Expects validation to fail** and checks the error object structure
4. **Verifies the error includes**:
   - `modelPropertyOptions`: Property-level metadata with descriptions
   - `modelOptions`: Model-level metadata with name and description
   - `validations`: Detailed validation constraint information

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.