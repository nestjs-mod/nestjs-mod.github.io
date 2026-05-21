---
id: tests-common-config-model-04-cross-module-access-737953469b
title: "ConfigModel: Returns option value from service of other module"
sidebar_label: "04 Returns option value from service of other module"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Returns option value from service of other module

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We're Testing

- **Module Sharing**: Ensures ConfigModel can be exported and imported across modules
- **Cross-Module DI**: Verifies dependency injection works across module boundaries
- **Configuration Propagation**: Tests that configuration values are available in importing modules
- **Module Architecture**: Validates the pattern of shared configuration modules

## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L152-L227)
- **Lines**: 152-227

## Setup Code

The test creates two modules where App1Module shares its configuration with App2Module:

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

@ConfigModel()
class App1Config {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App1Service {
  constructor(private readonly appConfig: App1Config) {}

  getConfig() {
    return this.appConfig;
  }
}

@Module({
  imports: [App1Module.forShareConfig()],
  providers: [App1Service],
  exports: [App1Service],
})
class App1Module {
  static forShareConfig(): DynamicModule {
    return {
      module: App1Module,
      providers: [App1Config],
      exports: [App1Config],
    };
  }
  
  static forRoot(config: Partial<App1Config>): DynamicModule {
    return {
      module: App1Module,
      providers: [
        {
          provide: `${App1Config.name}_loader`,
          useFactory: async (emptyAppConfig: App1Config) => {
            if (config.constructor !== Object) {
              Object.setPrototypeOf(emptyAppConfig, config);
            }
            const obj = await configTransform({
              model: App1Config,
              data: config,
            });
            Object.assign(emptyAppConfig, obj.data);
          },
          inject: [App1Config],
        },
      ],
    };
  }
}

@Injectable()
class App2Service {
  constructor(private readonly appService: App1Service) {}

  getConfig() {
    return this.appService.getConfig();
  }
}

@Module({
  imports: [App1Module],
  providers: [App2Service],
})
class App2Module {}
```

## Test Code

```typescript
it('should return option value from service of other module', async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [App1Module.forRoot({ option: 'value1' }), App2Module],
  }).compile();
  const app2Service = moduleRef.get(App2Service);

  expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
});
```

## What This Test Does

1. **Creates App1Module** with:
   - A ConfigModel (`App1Config`)
   - A service (`App1Service`) that uses the config
   - Two static methods: `forRoot()` for configuration and `forShareConfig()` for sharing

2. **Creates App2Module** that:
   - Imports App1Module to access shared providers
   - Defines `App2Service` that depends on `App1Service`

3. **Initializes both modules** with configuration in App1Module

4. **Retrieves App2Service** from the compiled module

5. **Verifies** that App2Service can access the configuration through App1Service, even though App2Module didn't configure it directly

## Key Points

- This test locks the behavior contract of the target nestjs-mod block in this scenario.
- Assertions protect integration boundaries and reduce regression risk when internals evolve.