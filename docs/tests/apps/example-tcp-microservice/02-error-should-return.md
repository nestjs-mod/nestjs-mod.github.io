---
id: tests-apps-example-tcp-microservice-src-app-02-error-should-return-4d67f119fd
title: "TCP microservice: Returns remote call error"
sidebar_label: "02 Returns remote call error"
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

- **File**: [math.controller.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/main/apps/example-tcp-microservice/src/app/math.controller.spec.ts#L89)
- **Line**: 89

## Setup Code

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

## Test Code

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
