---
id: ru-tests-libs-common-src-lib-env-model-05-should-return-option-value-from-service-of-other-module-71d2ff0fba
title: "EnvModel: Возвращает значение опции из сервиса of other module"
sidebar_label: "05 Возвращает значение опции из сервиса of other module"
description: "Контекст тестового раздела: Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI."
---

# EnvModel: Возвращает значение опции из сервиса of other module

## Обзор

Тесты проверяют EnvModel в nestjs-mod: чтение переменных окружения, валидацию обязательных полей и передачу значений в сервисы через DI.

## Что делаем и что проверяем

- Проверяем, как `envTransform` и декораторы `EnvModel/EnvModelProperty` извлекают и валидируют значения окружения.
- Подтверждаем ожидаемое поведение при отсутствии или некорректности обязательных env-полей.
- Фиксируем контракт доступа сервисов к env-значениям через DI.

- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/libs/common/src/lib/env-model/utils.spec.ts#L195)
- **Строка**: 195

## Подготовительный код

```typescript
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty } from 'class-validator';
import { EnvModel, EnvModelProperty } from './decorators';
import { envTransform } from './utils';

describe('Env model: Utils', () => {
  it('should return error if option of env not set', async () => {
    @EnvModel()
    class AppEnv {
      @EnvModelProperty()
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppEnv] })
    class AppModule {
      static forRoot(env: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env,
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
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

  it('should return error message if option of env not set', async () => {
    try {
      @EnvModel()
      class AppEnv {
        @EnvModelProperty()
        @IsNotEmpty()
        option!: string;
      }

      @Module({ providers: [AppEnv] })
      class AppModule {
        static forRoot(env: Partial<AppEnv>): DynamicModule {
          return {
            module: AppModule,
            providers: [
              {
                provide: `${AppEnv.name}_loader`,
                useFactory: async (emptyAppEnv: AppEnv) => {
                  if (env.constructor !== Object) {
                    Object.setPrototypeOf(emptyAppEnv, env);
                  }
                  const obj = await envTransform({
                    model: AppEnv,
                    data: env,
                  });
                  Object.assign(emptyAppEnv, obj.data);
                },
                inject: [AppEnv],
              },
            ],
          };
        }
      }

      await Test.createTestingModule({
        imports: [AppModule.forRoot({})],
      }).compile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      expect(err.message).toEqual(`obj['option'],process.env['OPTION']-isNotEmpty`);
    }
  });

  it('should return model info in error if option of env not set', async () => {
    @EnvModel({ name: 'model name', description: 'model description' })
    class AppEnv {
      @EnvModelProperty({ description: 'option description' })
      @IsNotEmpty()
      option!: string;
    }

    @Module({ providers: [AppEnv] })
    class AppModule {
      static forRoot(env: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env,
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
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
          originalName: 'AppEnv',
        },
        validations: {
          option: { constraints: { isNotEmpty: 'option should not be empty' } },
        },
      },
    });
  });

  it('should return option value from service', async () => {
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

    @Module({ providers: [AppEnv, AppService] })
    class AppModule {
      static forRoot(env?: Partial<AppEnv>): DynamicModule {
        return {
          module: AppModule,
          providers: [
            {
              provide: `${AppEnv.name}_loader`,
              useFactory: async (emptyAppEnv: AppEnv) => {
                if (env && env.constructor !== Object) {
                  Object.setPrototypeOf(emptyAppEnv, env);
                }
                const obj = await envTransform({
                  model: AppEnv,
                  data: env || {},
                });
                Object.assign(emptyAppEnv, obj.data);
              },
              inject: [AppEnv],
            },
          ],
        };
      }
    }

    process.env['OPTION'] = 'value1';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot({})],
    }).compile();
    const appService = moduleRef.get(AppService);

    expect(appService.getEnv()).toMatchObject({ option: 'value1' });
  });

```

## Код теста

```typescript
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

    @Module({
      imports: [App1Module.forShareEnv()],
      providers: [App1Service],
      exports: [App1Service],
    })
    class App1Module {
      static forShareEnv(): DynamicModule {
        return {
          module: App1Module,
```
