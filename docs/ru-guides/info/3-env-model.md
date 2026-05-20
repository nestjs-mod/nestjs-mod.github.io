---
sidebar_position: 3
---

# Переменные окружения

Декораторы `EnvModel`, `EnvModelProperty` для описания переменных окружения модуля и функция `envTransform` для его сериализации и проверки. Значения могут быть автоматически прочитаны из `process.env` или других источников, таких как https://www.vaultproject.io или https://developer.hashicorp.com/consul/docs/dynamic-app-config/kv.

### Пример приложения NestJS с различными способами использования переменных окружения

```typescript
import { EnvModel, EnvModelProperty, envTransform } from "@nestjs-mod/common";
import { DynamicModule, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IsNotEmpty } from "class-validator";

// Describe a class for working with environment variables
@EnvModel()
class AppEnv {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

// Describe a module that receives the values of environment variables when calling the forRoot method
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

// We try to run the application and at the same time we do not pass anything to the module and do not have the necessary variables in process.env
async function bootstrap1() {
  const app = await NestFactory.create(AppModule.forRoot({}));
  await app.listen(3000);
}

// We get a validation error
// throw new ConfigModelValidationErrors(validateErrors);
// isNotEmpty: option should not be empty
bootstrap1();

// We try to launch the application and manually transfer the values of environment variables to the module, process.env is still empty
async function bootstrap2() {
  const app = await NestFactory.create(AppModule.forRoot({ option: "value1" }));
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

// No error
bootstrap2();

// We try to launch the application and do not pass the values of environment variables to the module, but put them in process.env
async function bootstrap3() {
  process.env["OPTION"] = "value1";
  const app = await NestFactory.create(AppModule.forRoot({}));
  console.log(app.get(AppEnv)); // output: { option: 'value1' }
  await app.listen(3000);
}

// No error
bootstrap3();
```

### Имена ключей полей формируются с использованием форматировщиков.

Примеры:

- основной форматировщик - преобразует цепочку имен: приложение, контекст, модуль, свойства, которые формируются в процессе старта создания приложения и модуля (пример: *PROJECT_NAME+CONTEXT_NAME+MODULE_NAME+PROPERTY_NAME*). ([код](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/formatters/dot-env-property-name.formatter.ts))
- пользовательский форматировщик - наследуется от основного трансформера и включает в цепочку именования дополнительную статическую строку *PROJECT_NAME+CONTEXT_NAME+MODULE_NAME+STATIC_STRING+PROPERTY_NAME*) ([код](https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/libs/core/prisma/src/lib/formatters/dot-env-property-name.formatter.ts))

### Значения переменных окружения получаются с использованием экстракторов, которые в своей работе используют имена ключей, которые создали форматировщики.

Примеры:

- основной экстрактор - получает значение по ключу из объекта, который был передан в функцию `configTransform` ([код](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/extractors/default-property-value.extractor.ts))
- экстрактор `process.env` - получает значения из окружения текущего процесса ([код](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/env-model/extractors/process-env-property-value.extractor.ts))
