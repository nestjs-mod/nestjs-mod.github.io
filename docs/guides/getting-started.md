---
sidebar_position: 2
---

# Getting Started

### Create new application

Commands for create empty NestJS-mod application

```bash
# Create empty nx project
npx --yes create-nx-workspace@20.3.0 --name=project-name --preset=apps --interactive=false --ci=skip

# Go to created project
cd project-name

# Install all need main dev-dependencies
npm install --save-dev @nestjs-mod/schematics@latest

# Create NestJS-mod application
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/app-name --name=app-name --projectNameAndRootFormat=as-provided --strict=true
```

Start created application

```bash
# Prepare all files
npm run manual:prepare

# Start application in dev mode
npm run serve:dev:app-name

# Build and start application in prod mode

## Build
npm run build:prod:app-name

## Start
npm run start:prod:app-name
```

### Create new library

Commands for create empty NestJS-mod library

```bash
# Create NestJS-mod library
./node_modules/.bin/nx g @nestjs-mod/schematics:library --name=feature-name --buildable --publishable --directory=libs/feature-name --simpleName=true --strict=true --linter=eslint --unitTestRunner=jest
```

Add created library to `apps/app-name/src/main.ts`

```ts

// Example without options
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot()],
  }
});

// Example with options
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      configuration: { optionsName: 'options name' },
    })],
  }
});


// By default, in the example, the application looks for env by the key `APP_NAME_ENV_NAME`, but you can override it, for example:
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      environments: { envName: 'env name' },
    })],
  }
});
```

### Create an infrastructure report

You can generate a report for all modules and their configurations.

```bash
# Build all applications and library
npm run build

# Generate markdown report
npm run docs:infrastructure
```

After which the file `INFRASTRUCTURE.MD` appear in the application folder `apps/app-name`.
