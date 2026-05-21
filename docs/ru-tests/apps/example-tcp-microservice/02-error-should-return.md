---
id: ru-tests-apps-example-tcp-microservice-src-app-02-error-should-return-f3f07f3f8b
title: "TCP microservice: Возвращает ошибку удалённого вызова"
sidebar_label: "02 Возвращает ошибку удалённого вызова"
description: "Контекст тестового раздела: Тесты проверяют микросервисную логику nestjs-mod по TCP: взаимодействие client/server, контракт message handlers, обработку ответов и ошибок удалённых вызовов."
---

# TCP microservice: Возвращает ошибку удалённого вызова

## Обзор

Тесты проверяют микросервисную логику nestjs-mod по TCP: взаимодействие client/server, контракт message handlers, обработку ответов и ошибок удалённых вызовов.

## Что делаем и что проверяем

- Подтверждаем корректную инициализацию module metadata и lifecycle в рамках `nestjs-mod`.
- Проверяем связывание providers/controllers и работу dependency injection.
- Фиксируем ожидаемое поведение feature-конфигурации и интеграции модулей.

- Явно проверяем межсервисное взаимодействие клиентского и серверного микросервисов (request/response по транспортному контракту TCP).
- Проверяем поведение удалённого вызова при отсутствии подходящего message handler в удалённом сервисе и корректную обработку ошибки на клиенте.
- Отдельно проверяем контракт ошибок: не только факт падения, но и содержание/тип ошибки, важные для потребителей модуля.
- Подтверждаем корректный lifecycle в тестовом окружении: инициализация, готовность зависимостей и штатное завершение приложения/модулей.
## Ссылка на GitHub

- **Файл**: [math.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-tcp-microservice/src/app/math.controller.spec.ts#L89)
- **Строка**: 89

## Подготовительный код

```typescript
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { TcpNestMicroservice } from '@nestjs-mod/microservices';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestingModule } from '@nestjs/testing';
import { lastValueFrom } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { AppModule } from './app.module';
import { MathClientService } from './math-client.service';
import { MathController } from './math.controller';

describe('Math over TCP', () => {
  let server: TestingModule;
  let client: TestingModule;

  let mathController: MathController;

  beforeAll(async () => {
    server = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestMicroserviceServer',
        description: 'Test microservice server',
      },
      modules: {
        system: [
          TcpNestMicroservice.forRoot({ staticEnvironments: { port: 5000, host: 'localhost' } }),
          DefaultNestApplicationListener.forRoot(),
        ],
        feature: [AppModule.forRoot()],
      },
    });

    mathController = server.get<MathController>(MathController);

    // Wait for server to fully start
    await setTimeout(1000);

    client = await bootstrapNestApplication({
      // logger: new Logger('Client'),
      project: {
        name: 'TestMicroserviceClient',
        description: 'Test microservice client',
      },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot(),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [
          createNestModule({
            moduleName: 'MicroserviceClientModule',
            imports: [
              ClientsModule.register([
                { name: 'MATH_SERVICE', transport: Transport.TCP, options: { port: 5000, host: 'localhost' } },
              ]),
            ],
            providers: [MathClientService],
          }).MicroserviceClientModule.forRoot(),
        ],
      },
    });

    // Wait for client to connect
    await setTimeout(1000);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  describe('sum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      const result = await lastValueFrom(mathClientService.sum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6]);
      expect(mathController.sumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('getDate', () => {
```

## Код теста

```typescript
    it('error, should return "time.us.east"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      try {
        await lastValueFrom(mathClientService.getDate([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController.getDateResult).toEqual([]);
    });
  });

  describe('asyncSum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathClientService>(MathClientService);
      const result = await lastValueFrom(mathClientService.asyncSum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.asyncSumResult).toEqual([6]);
      expect(mathController.asyncSumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('observableSum', () => {
    it('should return "54"', async () => {
```
