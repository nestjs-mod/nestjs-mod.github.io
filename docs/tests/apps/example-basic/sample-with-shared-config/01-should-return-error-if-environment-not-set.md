---
id: tests-apps-example-basic-src-app-sample-with-shared-config-01-should-return-error-if-environment-not-set-42640d552e
title: "EnvModel: Returns error if environment not set"
sidebar_label: "01 Returns error if environment not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns error if environment not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `envTransform` and `EnvModel/EnvModelProperty` decorators extract and validate env values.
- We confirm expected behavior for missing or invalid required env fields.
- We lock the DI access contract for env values in services.

- We lock the API boundary contract (status, payload, and response shape) to protect externally observable behavior.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L18)
- **Line**: 18

## Setup Code

```typescript
import {
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { IsNotEmpty, setClassValidatorMessages } from 'class-validator-multi-lang';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import request from 'supertest';
import { SampleWithSharedConfig } from './sample-with-shared-config.module';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

describe('SampleWithSharedConfigController', () => {
  it('should return error if environment not set', async () => {
    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [SampleWithSharedConfig.forRoot()],
        },
      }),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 should not be empty');
  });

  it('should return error if environment not set (translated errors)', async () => {
    const RU_I18N_MESSAGES = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../../../../node_modules/class-validator-multi-lang/i18n/ru.json'),
      ).toString(),
    );
    setClassValidatorMessages(RU_I18N_MESSAGES);

```

## Test Code

```typescript
  it('should return error if environment not set', async () => {
    await expect(
      bootstrapNestApplication({
        project: {
          name: 'TestApplication',
          description: 'Test application',
        },
        modules: {
          system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
          feature: [SampleWithSharedConfig.forRoot()],
        },
      }),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'var1 should not be empty');
  });

  it('should return error if environment not set (translated errors)', async () => {
    const RU_I18N_MESSAGES = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../../../../node_modules/class-validator-multi-lang/i18n/ru.json'),
      ).toString(),
    );
    setClassValidatorMessages(RU_I18N_MESSAGES);

    const TEST_APP_NAME = 'TestAppModule';

    @EnvModel({ name: TEST_APP_NAME })
```
