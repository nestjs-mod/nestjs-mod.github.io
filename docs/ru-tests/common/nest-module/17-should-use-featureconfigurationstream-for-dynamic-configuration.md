---
id: ru-tests-libs-common-src-lib-nest-module-17-should-use-featureconfigurationstream-for-dynamic-configuration-1eb35a913f
title: "EnvModel: Use featureConfigurationStream for dynamic configuration"
sidebar_label: "17 Use featureConfigurationStream for dynamic configuration"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Use featureConfigurationStream for dynamic configuration

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `configTransform` и декораторы `ConfigModel/ConfigModelProperty` обрабатывают входные параметры.
- Фиксируем контракт валидации и формат ошибок для потребителей модуля конфигурации.
- Подтверждаем, что модуль/сервис получает корректно подготовленные значения конфигурации.

- Фиксируем контракт на границе API (статус, payload и формат ответа), чтобы защитить внешнее поведение приложения.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/nest-module/utils.spec.ts#L841)
- **Строка**: 841

## Подготовительный код

```typescript
import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { BehaviorSubject } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { ConfigModel, ConfigModelProperty } from '../config-model/decorators';
import { EnvModel, EnvModelProperty } from '../env-model/decorators';
import { InjectableFeatureConfigurationType } from './types';
import { createNestModule, getNestModuleDecorators } from './utils';

describe('NestJS modules: Utils', () => {
  describe('NestJS modules with env model', () => {
    it('should return error if option of env not set', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @EnvModel({ name: 'model name', description: 'model description' })
      class AppEnv {
        @EnvModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
      });

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
            originalName: 'AppEnv',
          },
          validations: {
            option: {
              constraints: { isNotEmpty: 'option should not be empty' },
            },
          },
        },
      });
    });

    it('should return option value from service use env', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });
    it('should return option value from service use env and contextName', async () => {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class AppService {
        constructor(private readonly appEnv: AppEnv) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        environmentsModel: AppEnv,
        providers: [AppService],
      });

      process.env['CTX_OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ contextName: 'CTX' })],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getEnv()).toMatchObject({ option: 'value1' });
    });

    it('should return option value from service of other module', async () => {
      @EnvModel()
      class App1Env {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Injectable()
      class App1Service {
        constructor(private readonly appEnv: App1Env) {}

        getEnv() {
          return this.appEnv;
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        environmentsModel: App1Env,
        sharedProviders: [App1Service],
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appService: App1Service) {}

        getEnv() {
          return this.appService.getEnv();
        }
      }

      @Module({
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      })
      class App2Module {}

      process.env['OPTION'] = 'value1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot({}), App2Module],
      }).compile();
      const app2Service = moduleRef.get(App2Service);

      expect(app2Service.getEnv()).toMatchObject({ option: 'value1' });
    });
  });

  describe('NestJS modules with config model', () => {
    it('should return error if option of env not set', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

      await expect(
        Test.createTestingModule({
          imports: [AppModule.forRoot({})],
        }).compile(),
      ).rejects.toHaveProperty('errors.0.constraints.isNotEmpty', 'option should not be empty');
    });

    it('should return model info in error if option of env not set', async () => {
      @ConfigModel({ name: 'model name', description: 'model description' })
      class AppConfig {
        @ConfigModelProperty({ description: 'option description' })
        @IsNotEmpty()
        option!: string;
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
      });

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
            option: {
              constraints: { isNotEmpty: 'option should not be empty' },
            },
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

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        configurationModel: AppConfig,
        providers: [AppService],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule.forRoot({ configuration: { option: 'value1' } })],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getConfig()).toMatchObject({ option: 'value1' });
    });

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

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        configurationModel: App1Config,
        sharedProviders: [App1Service],
      });
      const { InjectService } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @Injectable()
      class App2Service {
        constructor(
          @InjectService(App1Service)
          private readonly appService: App1Service,
        ) {}

        getConfig() {
          return this.appService.getConfig();
        }
      }

      @Module({
        imports: [App1Module.forFeature()],
        providers: [App2Service],
      })
      class App2Module {}

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot({ configuration: { option: 'value1' } }), App2Module],
      }).compile();
      const app2Service = moduleRef.get(App2Service);

      expect(app2Service.getConfig()).toMatchObject({ option: 'value1' });
    });
  });
  describe('NestJS modules with anv and config model', () => {
    it('should use env model and config model', async () => {
      @ConfigModel()
      class AppConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        optionConfig!: string;
      }

      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        optionEnv!: string;
      }

      @Injectable()
      class AppService {
        constructor(
          private readonly appConfig: AppConfig,
          private readonly appEnv: AppEnv,
        ) {}

        getEnv() {
          return this.appEnv;
        }

        getConfig() {
          return this.appConfig;
        }
      }

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        providers: [AppService],
        configurationModel: AppConfig,
        environmentsModel: AppEnv,
      });

      process.env['OPTION_ENV'] = 'optionEnv1';

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            configuration: { optionConfig: 'optionConfig1' },
          }),
        ],
      }).compile();
      const appService = moduleRef.get(AppService);

      expect(appService.getConfig()).toMatchObject({
        optionConfig: 'optionConfig1',
      });
      expect(appService.getEnv()).toMatchObject({ optionEnv: 'optionEnv1' });
    });
  });
  describe('NestJS modules with multi-providing options', () => {
    it('should return all feature options', async () => {
      // App1Module

      const { InjectFeatures, InjectAllFeatures } = getNestModuleDecorators({
        moduleName: 'App1Module',
      });

      @ConfigModel()
      class AppFeatureConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        featureOptionConfig!: string;
      }

      @Injectable()
      class AppFeatureScannerService {
        constructor(
          @InjectFeatures()
          private readonly appFeatureConfigs: InjectableFeatureConfigurationType<AppFeatureConfig>[],
          @InjectAllFeatures()
          private readonly appAllFeatureConfigs: Record<string, InjectableFeatureConfigurationType<AppFeatureConfig>[]>,
        ) {}

        getFeatureConfigs() {
          return this.appFeatureConfigs.map(({ featureConfiguration }) => featureConfiguration);
        }

        getAllFeatureConfigs() {
          return Object.entries(this.appAllFeatureConfigs)
            .map(([key, value]) => ({
              [key]: value.map(({ featureConfiguration }) => featureConfiguration),
            }))
            .reduce((all, cur) => ({ ...all, ...cur }), {});
        }
      }

      const { App1Module } = createNestModule({
        moduleName: 'App1Module',
        sharedProviders: [AppFeatureScannerService],
        featureConfigurationModel: AppFeatureConfig,
      });

      @Injectable()
      class App2Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }

        getAllFeatureConfigs() {
          return this.appFeatureScannerService.getAllFeatureConfigs();
        }
      }

      // App2Module

      const { App2Module } = createNestModule({
        moduleName: 'App2Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App2Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app2' },
          }),
        ],
        providers: [App2Service],
      });

      @Injectable()
      class App3Service {
        constructor(private readonly appFeatureScannerService: AppFeatureScannerService) {}

        getFeatureConfigs() {
          return this.appFeatureScannerService.getFeatureConfigs();
        }

        getAllFeatureConfigs() {
          return this.appFeatureScannerService.getAllFeatureConfigs();
        }
      }

      const { App3Module } = createNestModule({
        moduleName: 'App3Module',
        imports: [
          App1Module.forFeature({
            featureModuleName: 'App3Module',
            featureConfiguration: { featureOptionConfig: 'featureOptionConfig-app3' },
          }),
        ],
        providers: [App3Service],
      });

      // Test

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [App1Module.forRoot(), App2Module.forRoot(), App3Module.forRoot()],
      }).compile();

      const appFeatureScannerService = moduleRef.get(AppFeatureScannerService);
      const app2Service = moduleRef.get(App2Service);
      const app3Service = moduleRef.get(App3Service);

      expect(app2Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(app3Service.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);
      expect(appFeatureScannerService.getFeatureConfigs()).toMatchObject([
        { featureOptionConfig: 'featureOptionConfig-app2' },
        { featureOptionConfig: 'featureOptionConfig-app3' },
      ]);

      expect(app2Service.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
      expect(app3Service.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
      expect(appFeatureScannerService.getAllFeatureConfigs()).toMatchObject({
        default: [
          { featureOptionConfig: 'featureOptionConfig-app2' },
          { featureOptionConfig: 'featureOptionConfig-app3' },
        ],
      });
    });
  });
  describe('NestJS modules with useObservable (configurationStream)', () => {
    it('should update configuration value on runtime', async () => {
      @ConfigModel()
      class RealtimeConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        increment!: number;
      }

      @Injectable()
      class RealtimeService {
        constructor(private readonly realtimeConfig: RealtimeConfig) {}
        getConfig() {
          return this.realtimeConfig;
        }
      }

      const { RealtimeModule } = createNestModule({
        globalConfigurationOptions: { debug: true },
        moduleName: 'RealtimeModule',
        providers: [RealtimeService],
        configurationModel: RealtimeConfig,
      });

      const configurationStream = new BehaviorSubject<RealtimeConfig>({ increment: 0 });

      const module = await Test.createTestingModule({
        imports: [RealtimeModule.forRootAsync({ configurationStream: () => configurationStream })],
      }).compile();
      const realtimeService = module.get(RealtimeService);

      await module.init();

      expect(realtimeService.getConfig()).toEqual({ increment: 0 });

      configurationStream.next({ increment: 1 });

      await setTimeout(500);

      expect(realtimeService.getConfig()).toEqual({ increment: 1 });
    });
  });

  describe('NestJS modules with featureConfigurationClass', () => {
    it('should instantiate feature configuration from class', async () => {
      @ConfigModel()
      class DatabaseFeatureConfig {
        @ConfigModelProperty({ default: 'localhost' })
        host!: string;

        @ConfigModelProperty({ default: 'mydb' })
        database!: string;
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
        sharedProviders: [DatabaseService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          DatabaseModule.forFeatureAsync({
            featureModuleName: 'UserDB',
            featureConfigurationClass: DatabaseFeatureConfig,
          }),
        ],
        providers: [
          {
            provide: 'DB_CONFIG_CHECKER',
            useFactory: (service: DatabaseService) => {
              const configs = service.getFeatureConfigs();
              return configs[0]?.featureConfiguration;
            },
            inject: [DatabaseService],
          },
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [DatabaseModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const dbConfigChecker = moduleRef.get('DB_CONFIG_CHECKER');
      expect(dbConfigChecker).toBeDefined();
      expect(dbConfigChecker).toMatchObject({
        host: 'localhost',
        database: 'mydb',
      });
    });

    it('should use featureConfigurationClass with DI', async () => {
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
        constructor(
          private readonly configHelper: ConfigHelper,
        ) {}

        host = this.configHelper.getDefaultHost();
        port = 5432;
        database = 'production_db';
      }

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

    it('should use featureConfigurationFactory with injection', async () => {
      @ConfigModel()
      class ApiFeatureConfig {
        @ConfigModelProperty({ default: 'https://api.example.com' })
        apiUrl!: string;

        @ConfigModelProperty({ default: 5000 })
        timeout!: number;
      }

      @Injectable()
      class ConfigProvider {
        getConfig() {
          return {
            apiUrl: 'https://api.custom.com',
            timeout: 3000,
          };
        }
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'ApiModule',
      });

      @Injectable()
      class ApiService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<ApiFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { ApiModule } = createNestModule({
        moduleName: 'ApiModule',
        featureConfigurationModel: ApiFeatureConfig,
        sharedProviders: [ConfigProvider, ApiService],
      });

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          ApiModule.forFeatureAsync({
            featureModuleName: 'ExternalApi',
            featureConfigurationFactory: (configProvider: ConfigProvider) => {
              const config = configProvider.getConfig();
              return {
                apiUrl: config.apiUrl,
                timeout: config.timeout,
              };
            },
            inject: [ConfigProvider],
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [ApiModule.forRoot(), AppModule.forRoot()],
      }).compile();

      await moduleRef.init();

      const apiService = moduleRef.get(ApiService);
      const featureConfigs = apiService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        apiUrl: 'https://api.custom.com',
        timeout: 3000,
      });
    });

    it('should use featureConfigurationExisting instance', async () => {
      @ConfigModel()
      class CacheFeatureConfig {
        @ConfigModelProperty()
        @IsNotEmpty()
        ttl!: number;

        @ConfigModelProperty()
        prefix!: string;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'CacheModule',
      });

      @Injectable()
      class CacheService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<CacheFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { CacheModule } = createNestModule({
        moduleName: 'CacheModule',
        featureConfigurationModel: CacheFeatureConfig,
        sharedProviders: [CacheService],
      });

      const existingConfig = new CacheFeatureConfig();
      existingConfig.ttl = 3600;
      existingConfig.prefix = 'app_cache';

      const { AppModule } = createNestModule({
        moduleName: 'AppModule',
        imports: [
          CacheModule.forFeatureAsync({
            featureModuleName: 'SessionCache',
            featureConfigurationExisting: existingConfig,
          }),
        ],
      });

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [CacheModule.forRoot(), AppModule.forRoot()],
      }).compile();

      const cacheService = moduleRef.get(CacheService);
      const featureConfigs = cacheService.getFeatureConfigs();

      expect(featureConfigs).toHaveLength(1);
      expect(featureConfigs[0].featureConfiguration).toMatchObject({
        ttl: 3600,
        prefix: 'app_cache',
      });
    });

```

## Код теста

```typescript
    it('should use featureConfigurationStream for dynamic configuration', async () => {
      @ConfigModel()
      class DynamicFeatureConfig {
        @ConfigModelProperty({ default: 0 })
        value!: number;
      }

      const { InjectFeatures } = getNestModuleDecorators({
        moduleName: 'DynamicModule',
      });

      @Injectable()
      class DynamicService {
        constructor(
          @InjectFeatures()
          private readonly featureConfigs: InjectableFeatureConfigurationType<DynamicFeatureConfig>[],
        ) {}

        getFeatureConfigs() {
          return this.featureConfigs;
        }
      }

      const { DynamicModule } = createNestModule({
        moduleName: 'DynamicModule',
        featureConfigurationModel: DynamicFeatureConfig,
```
