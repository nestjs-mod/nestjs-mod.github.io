---
id: tests-libs-common-src-lib-config-model-04-should-return-option-value-from-service-of-other-module-70cf47d308
title: "ConfigModel: Returns option value from service of other module"
sidebar_label: "04 Returns option value from service of other module"
description: "Test section context: These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters."
---

# ConfigModel: Returns option value from service of other module

## Overview

These tests validate nestjs-mod ConfigModel: configuration transformation, input validation, and error contract on invalid parameters.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
## GitHub Reference

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/config-model/utils.spec.ts#L152)
- **Line**: 152

## Setup Code

```typescript
import { DynamicModule } from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { ConfigModel, ConfigModelProperty } from './decorators';
import { configTransform } from './utils';

describe('Config model: Utils', () => {

  // full test in the block below
});
```

## Test Code

```typescript
  it('should return option value from service of other module', async () => {
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

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [App1Module.forRoot({ option: 'value1' }), App2Module],
    }).compile();
    const app2Service = moduleRef.get(App2Service);

    expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
  });
```
