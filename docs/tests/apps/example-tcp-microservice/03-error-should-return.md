---
id: tests-apps-example-tcp-microservice-src-app-03-error-should-return-c390a1537a
title: "TCP microservice: Returns remote call error"
sidebar_label: "03 Returns remote call error"
description: "Test section context: These tests validate nestjs-mod TCP microservice logic: client/server interaction, message-handler contract, and remote response/error handling."
---

# TCP microservice: Returns remote call error

## Overview

These tests validate nestjs-mod TCP microservice logic: client/server interaction, message-handler contract, and remote response/error handling.

## What We Do And Verify

- We reproduce the target scenario and validate outcomes with assertions.
- We confirm the behavior contract for the tested `nestjs-mod` component.
- We preserve this contract to prevent regressions during future changes.

- We explicitly verify inter-service interaction between client and server microservices (request/response over the TCP transport contract).
- We verify remote-call behavior when no matching message handler exists in the remote service, including correct client-side error handling.
- We explicitly validate the error contract: not only failure itself, but also error shape/content expected by module consumers.
- We confirm correct lifecycle behavior in test environment: initialization, dependency readiness, and graceful shutdown of app/modules.
## GitHub Reference

- **File**: [math-two-envs.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-tcp-microservice/src/app/math-two-envs.controller.spec.ts#L118)
- **Line**: 118

## Setup Code

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
```

## Test Code

```typescript
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

```
