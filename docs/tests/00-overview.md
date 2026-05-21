---
id: tests-overview
title: "Tests: Overview"
sidebar_label: "00 Overview"
description: "Overview of nestjs-mod test documentation: categories, focus areas, and navigation across test scenarios."
---

# Tests: Overview

## Overview

This section contains generated documentation for test scenarios in `nestjs-mod`.
Each page links to the original test source, highlights setup code, and captures what behavior is validated.

## Structure

- `common/config-model` - config model transformation and validation
- `common/env-model` - environment model parsing and validation
- `common/nest-application` - bootstrap/lifecycle behavior
- `common/nest-module` - module composition and DI contracts
- `common/project-utils` - project utility and infrastructure helpers
- `apps/example-basic` - baseline app behavior scenarios
- `apps/example-fastify` - Fastify adapter scenarios
- `apps/example-tcp-microservice` - TCP microservice interaction scenarios
- `integrations/*` - integration-level test scenarios

## How To Use

1. Open a category in the sidebar.
2. Pick a scenario page.
3. Use the GitHub link to jump to the exact test location.
4. Compare setup and assertions with your implementation.

## Notes

- Titles and labels are normalized for readability.
- IDs are unique to avoid Docusaurus conflicts.
- Technical intermediate paths like `src/app` were flattened in docs navigation.
