---
id: tests-common-nest-module-06-feature-config-class-di-4f775a0370
title: "ConfigModel: Uses featureConfigurationClass with DI"
sidebar_label: "06 Uses featureConfigurationClass with DI"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Uses featureConfigurationClass with DI

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We're Testing

- **Class-Based Configuration**: Ensures configuration can be provided as an injectable class
- **Dependency Injection in Config**: Verifies config classes can inject and use other services
- **Factory Pattern**: Tests the async factory pattern for feature configuration
- **Service Integration**: Confirms injected services work correctly within config classes

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-module/utils.spec.ts#L619-L703)
- **Lines**: 619-703

## Setup Code

This test creates a config class that injects a helper service:

```typescript
import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

@ConfigModel()
class DatabaseFeatureConfig {
  @ConfigModelProperty({ default: 'localhost' })
  host!: string;

  @ConfigModelProperty({ default: 5432 })
  port!: number;

  @ConfigModelProperty({ default: 'mydb' })
  database!: string;
}

// Service to be injected into config class
@Injectable()
class ConfigHelper {
  getDefaultHost() {
    return 'db.example.com';
  }
}

const { InjectFeatures } = getNestModuleDecorators({
  moduleName: 'DatabaseModule',
});

@Injectable()
class DatabaseService {
  constructor(
    @InjectFeatures()
    private readonly featureConfigs: InjectableFeatureConfigurationType<DatabaseFeatureConfig>[],
  ) {}

  getFeatureConfigs() {
    return this.featureConfigs;
  }
}

const { DatabaseModule } = createNestModule({
  moduleName: 'DatabaseModule',
  featureConfigurationModel: DatabaseFeatureConfig,
  sharedProviders: [DatabaseService, ConfigHelper],
});

// Config class with DI - constructor can inject dependencies
@Injectable()
class DatabaseConfigClass {
  constructor(private readonly configHelper: ConfigHelper) {}

  host = this.configHelper.getDefaultHost();
  port = 5432;
  database = 'production_db';
}
```

## Test Code

```typescript
it('should use featureConfigurationClass with DI', async () => {
  const { AppModule } = createNestModule({
    moduleName: 'AppModule',
    imports: [
      DatabaseModule.forFeatureAsync({
        featureModuleName: 'MainDatabase',
        featureConfigurationClass: DatabaseConfigClass,
        inject: [ConfigHelper],
      }),
    ],
  });

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
    providers: [ConfigHelper],
  }).compile();

  const databaseService = moduleRef.get(DatabaseService);
  const featureConfigs = databaseService.getFeatureConfigs();

  expect(featureConfigs).toBeDefined();
  expect(featureConfigs.length).toBeGreaterThanOrEqual(1);
  
  const config = featureConfigs[0];
  expect(config.featureModuleName).toBe('MainDatabase');
  expect(config.featureConfiguration).toMatchObject({
    host: 'db.example.com', // From injected ConfigHelper
    port: 5432,
    database: 'production_db',
  });
});
```

## What This Test Does

1. **Creates a ConfigHelper service** that provides default configuration values
2. **Creates a DatabaseConfigClass** that:
   - Is decorated with `@Injectable()` to support DI
   - Injects `ConfigHelper` in its constructor
   - Uses the injected helper to compute the `host` value
   - Sets other properties directly

3. **Creates DatabaseModule** with:
   - `featureConfigurationModel` defining the config structure
   - Both `DatabaseService` and `ConfigHelper` as shared providers

4. **Creates AppModule** that:
   - Uses `forFeatureAsync` with `featureConfigurationClass`
   - Specifies which dependencies to `inject` ([ConfigHelper])
   - Names the feature module 'MainDatabase'

5. **Compiles the module** and retrieves `DatabaseService`

6. **Verifies** that:
   - Feature configs are defined
   - The configuration was instantiated from the class
   - The `host` value came from the injected `ConfigHelper` ('db.example.com')
   - Other values match the class properties

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.