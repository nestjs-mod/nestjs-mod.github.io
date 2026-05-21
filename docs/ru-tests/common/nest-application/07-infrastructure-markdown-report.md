---
id: ru-tests-common-nest-application-07-infrastructure-markdown-report-8251c11f43
title: "NestModule: Тест Отчета Об Инфраструктуре NestJS App"
sidebar_label: "07 Тест Отчета Об Инфраструктуре NestJS App"
description: "Контекст тестового раздела: Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию."
---

# NestModule: Тест Отчета Об Инфраструктуре NestJS App

## Обзор

Тесты проверяют модульную архитектуру nestjs-mod: сборку модулей через createNestModule, DI-связи и feature-конфигурацию.

## Что мы тестируем

- **Режим инфраструктуры**: Убеждаемся, что приложение может работать в режиме генерации документации инфраструктуры
- **Генерация отчета**: Проверяем, что полный отчет в формате markdown генерируется со всеми деталями модулей
- **Документация конфигурации**: Тестируем, что все статические конфигурации и окружения документированы
- **Метаданные модулей**: Подтверждаем, что описания модулей, общие провайдеры и настройки включены
- **Форматирование таблиц**: Проверяем правильную генерацию таблиц markdown для опций конфигурации

## Ссылка на GitHub

- **Файл**: [utils.spec.ts](https://github.com/nestjs-mod/nestjs-mod/blob/master/libs/common/src/lib/nest-application/utils.spec.ts#L437-L572)
- **Строки**: 437-572

## Подготовительный код

Этот тест настраивает инфраструктурные модули для генерации отчета:

```typescript
import { Injectable } from '@nestjs/common';
import { InfrastructureMarkdownReportGenerator, 
         InfrastructureMarkdownReportStorage,
         InfrastructureMarkdownReportStorageService } from '../modules/infrastructure/infrastructure-markdown-report/infrastructure-markdown-report';
import { DefaultNestApplicationInitializer } from '../modules/system/default-nest-application/default-nest-application-initializer';
import { DefaultNestApplicationListener } from '../modules/system/default-nest-application/default-nest-application-listener';
import { createNestModule } from '../nest-module/utils';
import { bootstrapNestApplication } from './utils';

@Injectable()
class AppReportService {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService) {}

  getReport() {
    return this.infrastructureMarkdownReportStorage.report;
  }
}

const { App1Module } = createNestModule({
  moduleName: 'App1Module',
  imports: [InfrastructureMarkdownReportStorage.forFeature()],
  providers: [AppReportService],
});
```

## Код теста

```typescript
it('should return markdown of infrastructure', async () => {
  process.env['NESTJS_MODE'] = 'infrastructure';
  
  const app = await bootstrapNestApplication({
    project: { name: 'TestApp', description: 'Test application' },
    modules: {
      infrastructure: [
        InfrastructureMarkdownReportStorage.forRoot(),
        InfrastructureMarkdownReportGenerator.forRoot(),
      ],
      system: [
        DefaultNestApplicationInitializer.forRoot(),
        DefaultNestApplicationListener.forRoot({
          staticEnvironments: { port: 3012 },
        }),
      ],
      feature: [App1Module.forRoot()],
    },
  });

  const appReportService = app.get(AppReportService);
  expect(appReportService.getReport().split('  ').join('').split('\n').join('')).toEqual(
    `# TestApp

Test application

## System modules
...

### DefaultNestApplicationInitializer
...

#### Static configuration
| Key| Description | Constraints | Default | Value |
...

## Integration modules
...

### DefaultNestApplicationListener
...

#### Static environments
| Key| Description | Sources | Constraints | Default | Value |
...
| port |The port...|obj['port'], process.env['TEST_APP_PORT']|optional|3000|3012|
...

## Infrastructure modules
...
`.split('  ').join('').split('\n').join('')
  );

  await app.close();
  process.env['NESTJS_MODE'] = undefined;
});
```

## Что делает этот тест

1. **Устанавливает режим инфраструктуры** через `process.env['NESTJS_MODE'] = 'infrastructure'`
2. **Настраивает инфраструктурные модули** для хранения и генерации отчета
3. **Настраивает системные модули** с пользовательской конфигурацией порта (3012)
4. **Загружает приложение** в режиме инфраструктуры
5. **Получает сгенерированный отчет** из InfrastructureMarkdownReportStorageService
6. **Нормализует пробелы** и сравнивает с ожидаемой структурой markdown
7. **Проверяет, что отчет содержит**:
   - Имя и описание проекта
   - Системные модули с их статическими конфигурациями
   - Интеграционные модули с окружениями и конфигурациями
   - Инфраструктурные модули с общими провайдерами
   - Детальные таблицы, показывающие ключи, описания, источники, ограничения, значения по умолчанию и фактические значения
8. **Очищает** закрывая приложение и сбрасывая режим

## Ключевые моменты

- Этот тест фиксирует контракт поведения конкретного блока nestjs-mod в условиях данного сценария.
- Проверки в тесте защищают интеграционные границы и предотвращают регрессии при изменении внутренней реализации.