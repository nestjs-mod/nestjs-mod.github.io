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

- **File**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/config-model/utils.spec.ts#L152)
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
  it('should return error if option of config not set', async () => {
    @ConfigModel()
    class AppConfig {
      @ConfigModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
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

    await expect(
      Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile(),
    ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
  });

  it('should return model info in error if option of config not set', async () => {
    @ConfigModel({ name: 'model name', description: 'model description' })
    class AppConfig {
      @ConfigModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppConfig] })
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
          originalName: 'AppConfig',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
  });

  it('should return option value from service', async () => {
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

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({ option: 'value1' })],
    }).compile();
    const appService = moduleRef.get(AppService);

    expect(appService.getConfig()).toMatchObject({ option: 'value1' });
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
```
