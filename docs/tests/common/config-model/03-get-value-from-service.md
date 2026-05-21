---
id: tests-common-config-model-03-get-value-from-service-efc3bb1edf
title: "ConfigModel: Returns option value from service"
sidebar_label: "03 Returns option value from service"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Returns option value from service

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We're Testing

- **Dependency Injection**: Ensures ConfigModel is properly injected into services
- **Configuration Assignment**: Verifies provided config values are set on the model instance
- **Service Integration**: Tests that services can access configuration through injected models
- **configTransform Integration**: Confirms the transform utility properly processes config data

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L102-L150)
- **Lines**: 102-150

## Setup Code

The test creates a ConfigModel, a service that uses it, and a module that provides both:

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel()
class AppConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class AppService {
  constructor(private readonly appConfig: AppConfig) {}

  getConfig() {
    return this.appConfig;
  }
}

@Module({ providers: [AppConfig, AppService] })
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
it('should return option value from service', async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule.forRoot({ option: 'value1' })],
  }).compile();
  const appService = moduleRef.get(AppService);

  expect(appService.getConfig()).toMatchObject({ option: 'value1' });
});
```

## What This Test Does

1. **Creates a ConfigModel** with a required `option` field
2. **Creates a service** that injects the ConfigModel and provides a getter
3. **Initializes the module** with configuration `{ option: 'value1' }`
4. **Compiles the testing module** successfully (validation passes)
5. **Retrieves the service** from the module container
6. **Verifies the service** returns the correct configuration value through `getConfig()`

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.