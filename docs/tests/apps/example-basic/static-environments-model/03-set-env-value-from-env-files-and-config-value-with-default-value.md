---
id: tests-apps-example-basic-src-app-static-environments-model-03-set-env-value-from-env-files-and-config-value-with-default-value-277ea507f8
title: "EnvModel: Set env value from .env files and config value with default value"
sidebar_label: "03 Set env value from .env files and config value with default value"
description: "Test section context: These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services."
---

# EnvModel: Set env value from .env files and config value with default value

## Overview

These tests validate nestjs-mod EnvModel: environment variable reading, required field validation, and DI value propagation into services.

## What We Do And Verify

- We verify how `configTransform` and `ConfigModel/ConfigModelProperty` decorators process input parameters.
- We lock the validation contract and error shape expected by configuration consumers.
- We confirm that modules/services receive properly prepared configuration values.

- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [static-environments-model-with-boolean.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/static-environments-model/static-environments-model-with-boolean.spec.ts#L174)
- **Line**: 174

## Setup Code

```typescript
import {
  BooleanTransformer,
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  NestModuleCategory,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
} from '@nestjs-mod/common';
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { join } from 'path';

describe('staticEnvironmentsModel', () => {
  it('set env value and config value from forRoot', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
      })
      usePipes?: boolean | null;
    }

    const { WebhookModule } = createNestModule({
      moduleName: WEBHOOK_MODULE,
      moduleCategory: NestModuleCategory.feature,
      staticEnvironmentsModel: WebhookEnvironments,
      staticConfigurationModel: WebhookConfiguration,
      wrapForRootAsync: (asyncModuleOptions) => {
        if (!asyncModuleOptions) {
          asyncModuleOptions = {};
        }
        const FomatterClass = getFeatureDotEnvPropertyNameFormatter(WEBHOOK_ENV_PREFIX);
        Object.assign(asyncModuleOptions, {
          environmentsOptions: {
            propertyNameFormatters: [new FomatterClass()],
            name: WEBHOOK_ENV_PREFIX,
          },
        });

        return { asyncModuleOptions };
      },
      preWrapApplication: async (options) => {
        useGuardsFromEnv = options.current.staticEnvironments?.useGuards;
        usePipesFromConfig = options.current.staticConfiguration?.usePipes;
      },
    });

    process.env['SERVER_WEBHOOK_USE_GUARDS'] = null as unknown as string;

    await bootstrapNestApplication({
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              applicationPackageJsonFile: join(__dirname, PACKAGE_JSON_FILE),
              packageJsonFile: join(__dirname, 'root-' + PACKAGE_JSON_FILE),
              nxProjectJsonFile: join(__dirname, PROJECT_JSON_FILE),
              envFile: join(__dirname, 'static-environments-model-with-boolean.env'),
            },
          }),
          DefaultTestNestApplicationCreate.forRoot(),
          DefaultTestNestApplicationInitializer.forRoot(),
        ],
        feature: [
          WebhookModule.forRoot({
            staticEnvironments: { useGuards: false },
            staticConfiguration: { usePipes: false },
          }),
        ],
      },
    });

    expect(useGuardsFromEnv).toEqual(false);
    expect(usePipesFromConfig).toEqual(false);
  });

  it('set env value from process.env and config value with default value', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
      })
      usePipes?: boolean | null;
    }

    const { WebhookModule } = createNestModule({
      moduleName: WEBHOOK_MODULE,
      moduleCategory: NestModuleCategory.feature,
      staticEnvironmentsModel: WebhookEnvironments,
      staticConfigurationModel: WebhookConfiguration,
      wrapForRootAsync: (asyncModuleOptions) => {
        if (!asyncModuleOptions) {
          asyncModuleOptions = {};
        }
        const FomatterClass = getFeatureDotEnvPropertyNameFormatter(WEBHOOK_ENV_PREFIX);
        Object.assign(asyncModuleOptions, {
          environmentsOptions: {
            propertyNameFormatters: [new FomatterClass()],
            name: WEBHOOK_ENV_PREFIX,
          },
        });

        return { asyncModuleOptions };
      },
      preWrapApplication: async (options) => {
        useGuardsFromEnv = options.current.staticEnvironments?.useGuards;
        usePipesFromConfig = options.current.staticConfiguration?.usePipes;
      },
    });

    process.env['SERVER_WEBHOOK_USE_GUARDS'] = 'false';

    await bootstrapNestApplication({
      modules: {
        system: [
          ProjectUtils.forRoot({
            staticConfiguration: {
              applicationPackageJsonFile: join(__dirname, PACKAGE_JSON_FILE),
              packageJsonFile: join(__dirname, 'root-' + PACKAGE_JSON_FILE),
              nxProjectJsonFile: join(__dirname, PROJECT_JSON_FILE),
              envFile: join(__dirname, 'static-environments-model-with-boolean.env'),
            },
          }),
          DefaultTestNestApplicationCreate.forRoot(),
          DefaultTestNestApplicationInitializer.forRoot(),
        ],
        feature: [WebhookModule.forRoot()],
      },
    });

    expect(useGuardsFromEnv).toEqual(false);
    expect(usePipesFromConfig).toEqual(true);
  });

```

## Test Code

```typescript
  it('set env value from .env files and config value with default value', async () => {
    const WEBHOOK_MODULE = 'WebhookModule';
    const WEBHOOK_ENV_PREFIX = 'webhook';

    let useGuardsFromEnv: boolean | undefined | null = undefined;
    let usePipesFromConfig: boolean | undefined | null = undefined;

    @EnvModel()
    class WebhookEnvironments {
      @EnvModelProperty({
        description: 'Use guards',
        default: 'true',
        transform: new BooleanTransformer(),
      })
      useGuards?: boolean | null;
    }

    @ConfigModel()
    class WebhookConfiguration {
      @ConfigModelProperty({
        description: 'Use pipes',
        default: true,
      })
      usePipes?: boolean | null;
    }

```
