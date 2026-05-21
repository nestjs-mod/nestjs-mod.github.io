---
id: ru-tests-apps-example-tcp-microservice-src-app-04-error-should-return-54189c9b8b
title: "TCP microservice: Возвращает ошибку удалённого вызова"
sidebar_label: "04 Возвращает ошибку удалённого вызова"
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

- **Файл**: [math-two-envs.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-tcp-microservice/src/app/math-two-envs.controller.spec.ts#L130)
- **Строка**: 130

## Подготовительный код

```typescript
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  bootstrapNestApplication,
  createNestModule,
} from '@nestjs-mod/common';
import { TcpNestMicroservice, TcpNestMicroserviceClientModule } from '@nestjs-mod/microservices';
import { TestingModule } from '@nestjs/testing';
import { lastValueFrom } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { AppModule } from './app.module';
import { MathTwoClientService } from './math-two-client.service';
import { MathController } from './math.controller';

describe('Math over TCP with two servers and use envs', () => {
  let server1: TestingModule;
  let server2: TestingModule;
  let client: TestingModule;

  let mathController1: MathController;
  let mathController2: MathController;

  beforeAll(async () => {
    // ms 1
    process.env.TEST_TWO_ENVS_MICROSERVICE_SERVER_TCP_PORT = '5020';
    server1 = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestTwoEnvsMicroserviceServer',
        description: 'Test microservice server',
      },
      modules: {
        system: [TcpNestMicroservice.forRoot(), DefaultNestApplicationListener.forRoot()],
        feature: [AppModule.forRoot()],
      },
    });

    mathController1 = server1.get<MathController>(MathController);

    // ms 2
    process.env.TEST_TWO_ENVS_MICROSERVICE_SERVER_2_TCP_PORT = '5022';
    server2 = await bootstrapNestApplication({
      // logger: new Logger('Server'),
      project: {
        name: 'TestTwoEnvsMicroserviceServer2',
        description: 'Test microservice server 2',
      },
      modules: {
        system: [TcpNestMicroservice.forRoot(), DefaultNestApplicationListener.forRoot()],
        feature: [AppModule.forRoot()],
      },
    });

    mathController2 = server2.get<MathController>(MathController);

    process.env.TEST_TWO_ENVS_MICROSERVICE_CLIENT_PORT = '3020';
    client = await bootstrapNestApplication({
      // logger: new Logger('Client'),
      project: {
        name: 'TestTwoEnvsMicroserviceClient',
        description: 'Test microservice client',
      },
      modules: {
        system: [
          DefaultNestApplicationInitializer.forRoot({}),
          DefaultNestApplicationListener.forRoot({ staticConfiguration: { mode: 'init' } }),
        ],
        feature: [
          createNestModule({
            moduleName: 'MicroserviceClientModule',
            imports: [
              TcpNestMicroserviceClientModule.forRoot({
                contextName: 'ms1',
                staticConfiguration: { microserviceProjectName: 'TestTwoEnvsMicroserviceServer' },
              }),
              TcpNestMicroserviceClientModule.forRoot({
                contextName: 'ms2',
                staticConfiguration: {
                  microserviceProjectName: 'TestTwoEnvsMicroserviceServer2',
                },
              }),
            ],
            providers: [MathTwoClientService],
          }).MicroserviceClientModule.forRoot(),
        ],
      },
    });
  });

  afterAll(async () => {
    await client.close();
    await server1.close();
    await server2.close();
  });

  describe('sum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.sum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6]);
      expect(mathController1.sumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.sumResult).toEqual([]);
    });
    it('should return "6" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.sum2([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.sumResult).toEqual([6, 6]);
      expect(mathController1.sumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.sumResult).toEqual([[1, 2, 3]]);
    });
  });

  describe('getDate', () => {
    it('error, should return "time.us.east"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      try {
        await lastValueFrom(mathClientService.getDate([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController1.getDateResult).toEqual([]);
      expect(mathController2.getDateResult).toEqual([]);
    });
```

## Код теста

```typescript
    it('error, should return "time.us.east" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      try {
        await lastValueFrom(mathClientService.getDate2([1, 2, 3]));
      } catch (error) {
        expect(error).toEqual('There is no matching message handler defined in the remote service.');
      }

      expect(mathClientService.getDateResult).toEqual([]);
      expect(mathController1.getDateResult).toEqual([]);
      expect(mathController2.getDateResult).toEqual([]);
    });
  });

  describe('asyncSum', () => {
    it('should return "6"', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
      const result = await lastValueFrom(mathClientService.asyncSum([1, 2, 3]));
      expect(result).toEqual(6);

      expect(mathClientService.asyncSumResult).toEqual([6]);
      expect(mathController1.asyncSumResult).toEqual([[1, 2, 3]]);
      expect(mathController2.asyncSumResult).toEqual([]);
    });
    it('should return "6" on server 2', async () => {
      const mathClientService = client.get<MathTwoClientService>(MathTwoClientService);
```
