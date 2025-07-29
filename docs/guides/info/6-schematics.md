---
sidebar_position: 6
---

# Schematics

The target application type for using NestJS-mod is the monorepository at https://nx.dev.

Since the NestJS-mod template is slightly different from nx, there are additional rules for checking code quality and more strict typescript config rules, for a faster start to developing applications on this architecture, sets of schematics were developed https://www.npmjs.com/package/@nestjs-mod/schematics for code generation.

## Schematic for creating a basic application

### Commands for creating an empty NestJS-mod application

```bash
# Create an empty nx project
npx --yes create-nx-workspace@17.2.8 --name=project-name --preset=empty --interactive=false --nx-cloud=false

# Go to the created folder
cd project-name

# Install schematic for generating NestJS-mod application
npm install --save-dev @nestjs-mod/schematics@latest

# Create a NestJS-mod application
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/app-name --name=app-name --projectNameAndRootFormat=as-provided --strict=true
```

> Example of the generated application: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/apps/app-name

### Run the created application in development mode

```bash
# Prepare all files
npm run manual:prepare

# Launch applications in watch mode
npm run serve:dev:app-name
```

### Building and running the application in production mode

```bash
## Collect applications
npm run build:prod:app-name

## Launch the assembled application
npm run start:prod:app-name
```

### Integrated:

- Pino - logger for streaming logs, website: https://github.com/pinojs/pino.
- Terminus - to obtain the status of the application, website: https://docs.nestjs.com/recipes/terminus.
- InfrastructureMarkdownReportGenerator - infrastructure documentation generator ([example](https://github.com/nestjs-mod/nestjs-mod-example/blob/master/apps/app-name/INFRASTRUCTURE.MD)).
- PM2 - script generator for launching the application, website: https://pm2.keymetrics.io/

## Schematic for creating a typical NestJS-mod library

### Command to create an empty library

```bash
# Creating NestJS-mod library
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=feature-name --buildable --publishable --directory=libs/feature-name --simpleName=true --strict=true --linter=eslint --unitTestRunner=jest
```

> Example of the generated library: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/libs/feature-name

### Integrated:

- Commands for creating releases for Github - action: https://github.com/TheUnderScorer/nx-semantic-release.
- Empty configuration and environment variable classes - example: https://github.com/nestjs-mod/nestjs-mod-example/tree/master/libs/feature-name/src/lib.
