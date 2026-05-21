---
id: tests-apps-example-basic-src-app-sample-with-shared-config-08-should-return-many-feature-options-3ebab62991
title: "EnvModel: Returns many feature options"
sidebar_label: "08 Returns many feature options"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Returns many feature options

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

- **File**: [sample-with-shared-config.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/sample-with-shared-config/sample-with-shared-config.controller.spec.ts#L265)
- **Line**: 265

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
  it('should return many feature options', async () => {
    // first

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar41' },
        }),
      ],
    })
    class FirstModule {}

    // second

    @Module({
      imports: [
        SampleWithSharedConfig.forFeature({
          featureModuleName: 'SampleWithSharedConfig',
          featureConfiguration: { featureVar: 'featureVar42' },
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
      .get('/get-features')
      .expect(200)
      .expect('[{"featureVar":"featureVar41"},{"featureVar":"featureVar42"}]');

    await app.close();
  });
```
