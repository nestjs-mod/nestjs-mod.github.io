---
id: tests-apps-example-basic-src-app-01-should-activate-onmoduleinit-only-once-9d3bc0d66c
title: "EnvModel: Activate onModuleInit only once"
sidebar_label: "01 Activate onModuleInit only once"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Activate onModuleInit only once

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [shared-providers.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/shared-providers.spec.ts#L13)
- **Line**: 13

## Setup Code

```typescript
import {
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

describe('NestJS modules with shared providers and imports', () => {
  // full test in the block below
});
```

## Test Code

```typescript
  it('should activate onModuleInit only once', async () => {
    let constructorSharedCount = 0;
    let onModuleInitSharedCount = 0;
    let onModuleDestroySharedCount = 0;

    let constructorLocalCount = 0;
    let onModuleInitLocalCount = 0;
    let onModuleDestroyLocalCount = 0;

    @ConfigModel()
    class SubModuleWithSharedServiceFeatureConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @ConfigModel()
    class SubModuleWithSharedServiceConfig {
      @ConfigModelProperty()
      increment!: number;
    }

    @EnvModel()
    class SubModuleWithSharedServiceEnv {
      @EnvModelProperty()
      increment!: number;
    }

    @Injectable()
    class LocalService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('LocalService');
        constructorLocalCount = constructorLocalCount + 1;
      }
      onModuleInit() {
        onModuleInitLocalCount = onModuleInitLocalCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroyLocalCount = onModuleDestroyLocalCount + 1;
      }
    }

    @Injectable()
    class SharedService implements OnModuleInit, OnModuleDestroy {
      constructor() {
        console.log('SharedService');
        constructorSharedCount = constructorSharedCount + 1;
      }
      onModuleInit() {
        onModuleInitSharedCount = onModuleInitSharedCount + 1;
      }
      onModuleDestroy() {
        onModuleDestroySharedCount = onModuleDestroySharedCount + 1;
      }
    }

    const { SubModuleWithSharedService } = createNestModule({
      moduleName: 'SubModuleWithSharedService',
      providers: [LocalService],
      sharedProviders: [SharedService],
      featureConfigurationModel: SubModuleWithSharedServiceFeatureConfig,
      configurationModel: SubModuleWithSharedServiceConfig,
      environmentsModel: SubModuleWithSharedServiceEnv,
    });

    const { AppModuleWithSharedService } = createNestModule({
      moduleName: 'AppModuleWithSharedService',
      sharedImports: [SubModuleWithSharedService.forFeature()],
    });

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SubModuleWithSharedService.forRootAsync({
            configuration: {
              increment: 1,
            },
          }),
          AppModuleWithSharedService.forRootAsync(),
        ],
      },
    });

    await app.close();

    expect(constructorSharedCount).toEqual(1);
    expect(onModuleInitSharedCount).toEqual(1);
    expect(onModuleDestroySharedCount).toEqual(1);

    expect(constructorLocalCount).toEqual(1);
    expect(onModuleInitLocalCount).toEqual(1);
    expect(onModuleDestroyLocalCount).toEqual(1);
  });
```
