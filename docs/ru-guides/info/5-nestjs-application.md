---
sidebar_position: 5
---

# Функция для создания приложения NestJS-mod

Это, пожалуй, самая простая функция `bootstrapNestApplication`, она просто проходит по объекту с массивом модулей и вызывает методы-обертки.

### Пример приложения

```typescript
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  EnvModel,
  EnvModelProperty,
  bootstrapNestApplication,
  createNestModule,
} from "@nestjs-mod/common";
import { Injectable, Logger } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";

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
  moduleName: "AppModule",
  environmentsModel: AppEnv,
  providers: [AppService],
});

process.env["OPTION"] = "value1";

const globalPrefix = "api";

bootstrapNestApplication({
  modules: {
    system: [
      DefaultNestApplicationInitializer.forRoot(),
      DefaultNestApplicationListener.forRoot({
        staticEnvironments: { port: 3000 },
        staticConfiguration: {
          preListen: async ({ app }) => {
            if (app) {
              const appService = app.get(AppService);
              console.log(appService.getEnv()); // output: { option: 'value1' }
              app.setGlobalPrefix(globalPrefix);
            }
          },
          postListen: async ({ current }) => {
            Logger.log(
              `🚀 Application is running on: http://${
                current.staticEnvironments?.hostname ?? "localhost"
              }:${current.staticEnvironments?.port}/${globalPrefix}`
            );
          },
        },
      }),
    ],
    feature: [AppModule.forRoot()],
  },
});
```