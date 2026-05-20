---
sidebar_position: 4
---

# Функция для создания модуля NestJS-mod

Функция `createNestModule` для создания динамического модуля NestJS с возможностью настройки через конфигурации или переменные окружения, а также предоставляющая возможность использования части сервисов модуля через метод `forFeature` или передачи части конфигураций из feature модуля.

Все модули имеют возможность создания нескольких параллельных именованных экземпляров модуля с различными входными параметрами; для этого нужно передать имя экземпляра в опцию `contextName`.

В отличие от модулей NestJS, модули NestJS-mod могут содержать дополнительные методы-обертки, которые будут вызываться при построении приложения NestJS.

## Пример создания нативного модуля NestJS с использованием функции createNestModule и передачи различных типов конфигураций

```typescript
import {
  ConfigModel,
  ConfigModelProperty,
  EnvModel,
  EnvModelProperty,
  createNestModule,
  getNestModuleDecorators,
  InjectableFeatureConfigurationType,
} from "@nestjs-mod/common";
import { Injectable } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IsNotEmpty } from "class-validator";

// App1Module

const { InjectFeatures } = getNestModuleDecorators({
  moduleName: "App1Module",
});

@ConfigModel()
class AppFeatureConfig {
  @ConfigModelProperty()
  @IsNotEmpty()
  featureOptionConfig!: string;
}

@Injectable()
class AppFeaturesService {
  constructor(
    @InjectFeatures()
    private readonly appFeatureConfigs: InjectableFeatureConfigurationType<AppFeatureConfig>[]
  ) {}

  getFeatureConfigs() {
    return this.appFeatureConfigs.map(
      ({ featureConfiguration }) => featureConfiguration
    );
  }
}

const { App1Module } = createNestModule({
  moduleName: "App1Module",
  sharedProviders: [AppFeaturesService],
  featureConfigurationModel: AppFeatureConfig,
});

@ConfigModel()
class App2Config {
  @ConfigModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App2Service {
  constructor(
    private readonly appFeaturesService: AppFeaturesService,
    private readonly app2Config: App2Config
  ) {}

  getFeatureConfigs() {
    return this.appFeaturesService.getFeatureConfigs();
  }

  getConfig() {
    return this.app2Config;
  }
}

// App2Module

const { App2Module } = createNestModule({
  moduleName: "App2Module",
  imports: [
    App1Module.forFeature({
      featureModuleName: "App2Module",
      featureConfiguration: { featureOptionConfig: "featureOptionConfig-app2" },
    }),
  ],
  providers: [App2Service],
  configurationModel: App2Config,
});

@EnvModel()
class App3Env {
  @EnvModelProperty()
  @IsNotEmpty()
  option!: string;
}

@Injectable()
class App3Service {
  constructor(
    private readonly appFeaturesService: AppFeaturesService,
    private readonly app3Env: App3Env
  ) {}

  getFeatureConfigs() {
    return this.appFeaturesService.getFeatureConfigs();
  }

  getEnv() {
    return this.app3Env;
  }
}

const { App3Module } = createNestModule({
  moduleName: "App3Module",
  imports: [
    App1Module.forFeature({
      featureModuleName: "App2Module",
      featureConfiguration: { featureOptionConfig: "featureOptionConfig-app3" },
    }),
  ],
  providers: [App3Service],
  environmentsModel: App3Env,
});

// Test

const { AppModule } = createNestModule({
  moduleName: "AppModule",
  imports: [
    App1Module.forRoot(),
    App2Module.forRoot({ configuration: { option: "appConfig3value" } }),
    App3Module.forRoot({ environments: { option: "appEnv2value" } }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forRoot());
  const appFeatureScannerService = app.get(AppFeaturesService);
  const app2Service = app.get(App2Service);
  const app3Service = app.get(App3Service);

  console.log(appFeatureScannerService.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app2Service.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app3Service.getFeatureConfigs()); // output: [{ featureOptionConfig: 'featureOptionConfig-app2' }, { featureOptionConfig: 'featureOptionConfig-app3' }]
  console.log(app2Service.getConfig()); // output: { option: 'appConfig3value' }
  console.log(app3Service.getEnv()); // output: { option: 'appEnv2value' }
}

bootstrap();
```

### Методы-обертки

- preWrapApplication - вызывается для всех корневых модулей, здесь мы можем создать еще один дополнительный корневой модуль, конфигурация для которого будет динамически сгенерирована на основе исходного модуля, например: установить новый префикс к имени ключей при работе с переменными окружения ([пример кода](https://github.com/nestjs-mod/nestjs-mod/blob/8ab5dc5a340215bdba8cea63e004dea2c3676e95/libs/common/src/lib/modules/system/project-utils/project-utils.module.ts#L50))
- wrapApplication - метод, который может создать приложение или микросервис NestJS, возвращает экземпляр созданного приложения. ([пример кода](https://github.com/nestjs-mod/nestjs-mod/blob/8ab5dc5a340215bdba8cea63e004dea2c3676e95/libs/common/src/lib/modules/system/default-nest-application/default-nest-application-initializer.ts#L106))
- postWrapApplication - этот метод работает после создания приложения, например, нужно начать прослушивание на HTTP порту ([пример кода](https://github.com/nestjs-mod/nestjs-mod/blob/8ab5dc5a340215bdba8cea63e004dea2c3676e95/libs/common/src/lib/modules/system/default-nest-application/default-nest-application-listener.ts#L79))

При создании модуля можно передать множество различных новых параметров, есть как оригинальные опции NestJS, так и расширенные.

Описания и примеры использования каждой опции будут рассмотрены в отдельных постах; сейчас я опишу только опции настройки модуля.

### Опции создания модуля NestJS-mod

**environmentsModel**

Класс и его свойства помечены декораторами типа "Переменные окружения" (Env model), он содержит свойства с примитивными типами, используемыми в модуле, значения которых могут быть получены из различных источников, таких как: `process.env` или `consul-kv`.

**configurationModel**

Класс и его свойства помечены декораторами типа "Config model"; описаны свойства примитивных и сложных типов, которые используются в модуле, значения для которых должны быть переданы при подключении модуля к приложению, в коде.

**staticEnvironmentsModel**

Класс "Переменные окружения" (Env model) со статическими свойствами примитивного типа может использоваться в момент генерации метаданных модуля; значения могут быть получены из различных источников, например: `process.env` или `consul-kv`.

> Пример: различные условия импорта в зависимости от переменных окружения, динамические маршруты для REST контроллеров.

**staticConfigurationModel**

Класс конфигурации со статическими свойствами примитивных и сложных типов, которые могут использоваться при генерации метаданных модуля (imports, controllers); значения для них должны быть переданы при подключении модуля к приложению.

**featureEnvironmentsModel**

Переменные окружения - "feature" модулей с примитивными типами, значения которых могут быть получены из различных источников, таких как: `process.env` или `consul-kv`.

> Пример: имя переменной окружения для подключения к базе данных feature модуля отличается от имени переменной окружения корневого подключения.

**featureConfigurationModel**

Класс для "feature" модулей, переменные примитивных и сложных типов, которые могут быть добавлены в текущий модуль из других модулей.

> Пример: транспорт для отправки сообщения может быть определен как функциональность продукта "feature", но основная реализация обхода получателей и отправки будет "core" или "integration" модулем.

### Создание главного динамического модуля и передача асинхронной конфигурации

Когда конфигурация модуля неизвестна заранее, мы можем передать ее с помощью асинхронной фабрики; если для ее работы нужны другие модули, мы можем передать их через опцию `imports`, как в обычном NestJS.

Помимо асинхронной фабрики, вы также можете использовать класс и передать по значению, как в обычном NestJS.

У NestJS-mod есть еще один способ передачи конфигурации - это передача потока Observable со значениями этой конфигурации. Этот метод нужен, когда значения могут меняться со временем.

> Пример: core модуль для динамического изменения адреса и учетных данных прокси-сервера, когда текущий заблокирован, feature модуля может не вызывать дополнительный метод для получения текущего адреса и учетных данных, он просто использует экземпляр конфигурации, который был подключен через конструктор, как будто это статическая конфигурация.

### Работа с опциями, которые были переданы из других модулей (configuration feature)

Поскольку во время инициализации модулей NestJS порядок загрузки (разрешения) может отличаться, точно на момент старта мы можем получить все "configuration features" только в хуке NestJS `onApplicationBootstrap`.

Для его получения нужно использовать декоратор `InjectFeatures`.
Когда приложение запущено (runtime), больше нет проблем с доступом ко всем конфигурациям.

### Декораторы для работы с сущностями модуля

Поскольку использование декораторов - это статический код и не может быть изменено в реальном времени, декораторы для каждого модуля должны быть созданы вручную с использованием функции `getNestModuleDecorators`

### Типы декораторов:

**InjectService**

Для подключения провайдера с использованием инжектированного токена или класса.

> Пример: если в приложении есть несколько экземпляров одного и того же модуля, но с разными именами контекста, то имя этого контекста можно передать в декоратор.

**InjectFeatures**

Для подключения массива со всеми конфигурациями, полученными от различных модулей.

> Пример: Есть модуль доступности веб-сайта "systems" и есть configuration feature, через который "core" модуль для работы с базой данных может уведомлять о функциональности базы данных. На основе этого списка "systems" модуль решает, можно ли пускать людей в бэкенд.

**InjectAllFeatures**

Если в приложении есть несколько экземпляров модуля с разными контекстами, то для получения всех "feature configurations" нужно использовать этот декоратор.

**InjectFeatureEnvironments**

Помимо конфигураций, вы также можете получить все переменные окружения, которые использовали feature модули.

> Пример: некое консольное приложение, которое при запуске создаст все необходимые базы данных на сервере базы данных, мы получаем строку подключения к базе данных с корневыми правами из "systems" модуля, а строка подключения к базе данных самих feature модулей передается из самих feature модулей и при этом все имена ключей разные и должны быть валидированы при запуске приложения.

**InjectAllFeatureEnvironments**

То же самое, что и `InjectFeatureEnvironments`, только собирает информацию по всем экземплярам модуля.

**InjectModuleSettings**

Иногда нужно получить все метаданные классов конфигурации и классов для переменных окружения модуля, это декоратор для этого.

> Пример: приложение собирает все конфигурационные значения переменных окружения с именами ключей и генерирует отчет.

**InjectAllModuleSettings**

Независимый от контекста доступ ко всем метаданным конфигурации модуля.
