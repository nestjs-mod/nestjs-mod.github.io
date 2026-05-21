---
id: tests-libs-common-src-lib-nest-module-12-should-update-configuration-value-on-runtime-a11d2c6873
title: "EnvModel: Update configuration value on runtime"
sidebar_label: "12 Update configuration value on runtime"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Update configuration value on runtime

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L512)
- **Line**: 512

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

  });

  describe('NestJS modules with config model', () => {

  });
  describe('NestJS modules with anv and config model', () => {
  });
  describe('NestJS modules with multi-providing options', () => {
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
    // full test in the block below
  });

  describe('NestJS modules with featureConfigurationClass', () => {

  });
});
```

## Test Code

```typescript
    it('should update configuration value on runtime', async () => {
      @ConfigModel()
      class RealtimeConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        increment!: number;
      }

      @Injectable()
      class RealtimeService {
        constructor(private readonly realtimeConfig: RealtimeConfig) {}
        getConfig() {
          return this.realtimeConfig;
        }
      }

      const { RealtimeModule } = createNestModule({
        globalConfigurationOptions: { debug: true },
        moduleName: 'RealtimeModule',
        providers: [RealtimeService],
        configurationModel: RealtimeConfig,
      });

      const configurationStream = new BehaviorSubject<RealtimeConfig>({ increment: 0 });

      const module = await Test.createTestingModule({
        imports: [RealtimeModule.forRootAsync({ configurationStream: () => configurationStream })],
      }).compile();
      const realtimeService = module.get(RealtimeService);

      await module.init();

      expect(realtimeService.getConfig()).toEqual({ increment: 0 });

      configurationStream.next({ increment: 1 });

      await setTimeout(500);

      expect(realtimeService.getConfig()).toEqual({ increment: 1 });
    });
```
