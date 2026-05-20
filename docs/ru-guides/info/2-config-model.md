---
sidebar_position: 2
---

# Модель конфигурации

Декораторы `ConfigModel`, `ConfigModelProperty` для описания доступных настроек модуля и функция `configTransform` для его сериализации и проверки. Значения должны быть описаны в коде.

### Пример обычного приложения NestJS с конфигурацией

```typescript
import {
  ConfigModel,
  ConfigModelProperty,
  configTransform,
} from "@nestjs-mod/common";
import { DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IsNotEmpty } from "class-validator";

// Describe the configuration class
@ConfigModel()
class AppConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

// Describe a module that receives configuration values when calling the forRoot method
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

// We try to launch the application and do not pass anything to the module
async function bootstrap1() {
  const app = await NestFactory.create(AppModule.forRoot({}));
  await app.listen(3000);
}

// We get a validation error
// throw new ConfigModelValidationErrors(validateErrors);
// isNotEmpty: option should not be empty
bootstrap1();

// We try to launch the application and at the same time pass configuration values to the module
async function bootstrap2() {
  const app = await NestFactory.create(AppModule.forRoot({ option: "value1" }));
  console.log(app.get(AppConfig)); // output: { option: 'value1' }
  await app.listen(3000);
}

// No error
bootstrap2();
```