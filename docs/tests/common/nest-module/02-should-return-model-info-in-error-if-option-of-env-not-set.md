---
id: tests-libs-common-src-lib-nest-module-02-should-return-model-info-in-error-if-option-of-env-not-set-d53ff83f65
title: "EnvModel: Returns model info in error if option of env not set"
sidebar_label: "02 Returns model info in error if option of env not set"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns model info in error if option of env not set

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-module/utils.spec.ts#L33)
- **Line**: 33

## Setup Code

```typescript
import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { BehaviorSubject } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

describe('NestJS modules: Utils', () => {
  describe('NestJS modules with env model', () => {
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

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @EnvModel({ name: 'model name', description: 'model description' })
      class AppEnv {
        @EnvModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

```

## Test Code

```typescript
    it('should return model info in error if option of env not set', async () => {
      @EnvModel({ name: 'model name', description: 'model description' })
      class AppEnv {
        @EnvModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

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
```
