---
id: tests-common-nest-application-01-app-env-validation-error-8b8b71ffde
title: "EnvModel: Returns error if option of env not set"
sidebar_label: "01 Returns error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We're Testing

- **Application Bootstrap**: Ensures bootstrapNestApplication validates environment models
- **Exit Code Handling**: Verifies the process exits with code 1 on validation failure
- **EnvModel Integration**: Tests environment validation in full application context
- **Process Exit Mocking**: Confirms proper handling of process.exit during tests

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-application/utils.spec.ts#L40-L62)
- **Lines**: 40-62

## Setup Code

The test mocks `process.exit` to prevent actual process termination during testing:

```typescript
import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { createNestModule } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

// Mock process.exit
let originalExit: any;
let exitStatus: any;

beforeAll(() => {
  originalExit = process.exit;
  process.exit = (status) => {
    exitStatus = status;
    return null as never;
  };
});

afterAll(() => {
  process.exit = originalExit;
});

afterEach(() => {
  exitStatus = null;
});
```

## Test Code

```typescript
it('should return error if option of env not set', async () => {
  @EnvModel()
  class AppEnv {
    @EnvModelProperty()
    @IsNotEmpty()
    option!: string;
  }

  const { AppModule } = createNestModule({
    moduleName: 'AppModule',
    environmentsModel: AppEnv,
  });

  await bootstrapNestApplication({
    project: { name: 'TestApp', description: 'Test application' },
    modules: {
      system: [DefaultNestApplicationInitializer.forRoot()],
      feature: [AppModule.forRoot()],
    },
  });

  expect(exitStatus).toEqual(1);
});
```

## What This Test Does

1. **Mocks process.exit** to capture exit codes without terminating the test process
2. **Creates an EnvModel** with a required `option` field
3. **Creates a NestModule** using `createNestModule` with the EnvModel
4. **Attempts to bootstrap** the application without setting the required environment variable
5. **Expects the bootstrap** to trigger `process.exit(1)` due to validation failure
6. **Verifies exit code** is 1, indicating application failed to start

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.