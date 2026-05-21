---
id: tests-apps-example-basic-src-app-static-environments-model-01-set-env-value-and-config-value-from-forroot-089e0c6b33
title: "EnvModel: Set env value and config value from forRoot"
sidebar_label: "01 Set env value and config value from forRoot"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Set env value and config value from forRoot

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [static-environments-model-with-boolean.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/static-environments-model/static-environments-model-with-boolean.spec.ts#L19)
- **Line**: 19

## Setup Code

```typescript
import {
  BooleanTransformer,
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { join } from 'path';

describe('staticEnvironmentsModel', () => {
  it('set env value and config value from forRoot', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
```

## Test Code

```typescript
  it('set env value and config value from forRoot', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
      })
      usePipes?: boolean | null;
    }

```
