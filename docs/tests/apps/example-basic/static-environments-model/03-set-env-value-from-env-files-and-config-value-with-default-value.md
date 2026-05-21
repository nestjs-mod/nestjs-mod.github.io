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

- **File**: [static-environments-model-with-boolean.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/src/app/static-environments-model/static-environments-model-with-boolean.spec.ts#L174)
- **Line**: 174

## Setup Code

```typescript
import {
import { DefaultTestNestApplicationCreate, DefaultTestNestApplicationInitializer } from '@nestjs-mod/testing';
import { join } from 'path';

describe('staticEnvironmentsModel', () => {

  // full test in the block below
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

    delete process.env['SERVER_WEBHOOK_USE_GUARDS'];

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
