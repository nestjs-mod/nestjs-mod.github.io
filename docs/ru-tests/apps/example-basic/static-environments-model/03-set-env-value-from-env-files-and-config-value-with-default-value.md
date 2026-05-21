---
id: ru-tests-apps-example-basic-src-app-static-environments-model-03-set-env-value-from-env-files-and-config-value-with-default-value-e071e2ede8
title: "EnvModel: Set env value from .env files and config value with default value"
sidebar_label: "03 Set env value from .env files and config value with default value"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Set env value from .env files and config value with default value

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [static-environments-model-with-boolean.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-basic/src/app/static-environments-model/static-environments-model-with-boolean.spec.ts#L174)
- **Строка**: 174

## Подготовительный код

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

## Код теста

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
