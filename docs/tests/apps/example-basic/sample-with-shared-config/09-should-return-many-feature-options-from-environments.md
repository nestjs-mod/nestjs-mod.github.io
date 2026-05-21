---
id: tests-apps-example-basic-src-app-sample-with-shared-config-09-should-return-many-feature-options-from-environments-87c819f735
title: "EnvModel: Returns many feature options from environments"
sidebar_label: "09 Returns many feature options from environments"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns many feature options from environments

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

- **File**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L318)
- **Line**: 318

## Setup Code

```typescript
import {
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { IsNotEmpty, setClassValidatorMessages } from 'class-validator-multi-lang';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import request from 'supertest';
import { SampleWithSharedConfig } from './sample-with-shared-config.module';
import { SampleWithSharedConfigService } from './sample-with-shared-config.service';

describe('SampleWithSharedConfigController', () => {

  // full test in the block below
});
```

## Test Code

```typescript
  it('should return many feature options from environments', async () => {
    // first

    process.env['TEST_APPLICATION_API_41_SAMPLE_WITH_SHARED_CONFIG_ENV_FEATURE_VAR'] = 'envFeatureVar41';
    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          contextName: 'api41',
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar41' },
          featureEnvironmentsOptions: { debug: true },
        }),
      ],
    })
    class FirstModule {}

    // second

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          contextName: 'api41',
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar42' },
          featureEnvironments: { envFeatureVar: 'envFeatureVar42' },
          featureEnvironmentsOptions: { debug: true },
        }),
      ],
    })
    class SecondModule {}

    const app = await bootstrapNestApplication({
      project: {
        name: 'TestApplication',
        description: 'Test application',
      },
      modules: {
        system: [DefaultTestNestApplicationCreate.forRoot(), DefaultTestNestApplicationInitializer.forRoot()],
        feature: [
          SampleWithSharedConfig.forRoot({
            contextName: 'api41',
            environments: { var1: 'var1value' },
          }),
          createNestModule({
            moduleName: 'ChildModules',
            moduleDescription: 'Child modules',
            imports: [SecondModule, FirstModule],
          }).ChildModules.forRoot(),
        ],
      },
    });

    await request(app.getHttpServer())
      .get('/get-feature-environments/api41')
      .expect(200)
      .expect('[{"envFeatureVar":"envFeatureVar41"},{"envFeatureVar":"envFeatureVar42"}]');

    await app.close();
  });
```
