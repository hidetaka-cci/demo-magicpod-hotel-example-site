# hotel-example-site

[![Playwright Tests](https://github.com/takeyaqa/hotel-example-site/actions/workflows/playwright.yml/badge.svg)](https://github.com/takeyaqa/hotel-example-site/actions/workflows/playwright.yml)

---

## Domain Migration Notice

> [!IMPORTANT]
> This website has moved to a new domain, <https://hotel-example-site.takeyaqa.dev/>, as of December 1, 2024.
>
> **Redirects from hotel.testplanisphere.dev ended on December 31, 2025.**

---

## This site is a sandbox to practice test automation.

This site aims to learn browser automation with running automation scripts against this site as the system under test.

You can refer to this site from any places such as books and blogs under [MIT License](./LICENSE).

It is made for learning test automation, but you can also use it to learn test design and technique.

### Site Structure

This site provides mocked booking hotel feature. It has input forms to log in, sign up, and reserve a room. The layout is mobile friendly by responsive design.

#### Terms of Use

- We confirmed sample code worked with the latest Google Chrome in June 2020.
- This site is working on GitHub pages.
- About input data
  - The data is stored in the browser's Cookie, Session Storage and Local Storage.
  - The data is NOT stored in the server side such as database.
  - Due to the specification of HTML, the contents of the form are sent as the last part of the URL. Please note that it may be left in the GitHub server's logs and other records.
- Do NOT use this site for stress testing.
- We do not take any responsibilities by using this site.

### Infrastructure (AWS CDK)

This demo fork includes AWS CDK stacks for staging / production S3 static website hosting (no CloudFront). CircleCI OIDC and deploy IAM roles are managed at the AWS account level, not in this repo.

See [infra/README.md](./infra/README.md) for bootstrap steps (`cdk bootstrap`, `cdk deploy`) and bucket outputs for account IAM grants.

### Running Server

For development, you can serve this site locally using webpack.

#### Prerequisites

Make sure you have Node.js and pnpm installed, then install dependencies:

```bash
pnpm install
```

#### Build and Start Server

First, build the project:

```bash
pnpm run build
```

This will create a `dist` folder with the built assets.

Then start the webpack development server:

```bash
pnpm run start
```

After starting the server, open your browser and navigate to:

- `http://localhost:8080/en-US/` for the English version
- `http://localhost:8080/ja/` for the Japanese version

### Fast feedback (lint and unit tests)

This fork adds shift-left checks before deploy. CI runs unit tests with 100% coverage and property-based tests (~3–4 minutes). A parallel **Smarter Testing** job (`unit-test-smarter`) demonstrates faster runs via test sharding and Test Impact Analysis. UI E2E is handled by MagicPod after staging deploy (Playwright is for local use only).

| Command                      | Role                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| `pnpm run fmt:check`         | Prettier formatting                                                  |
| `pnpm run lint`              | Biome lint (formatter disabled; Prettier handles format)             |
| `pnpm run test:unit`         | Vitest: `src/**` at 100% coverage + fast-check PBT                 |
| `pnpm run test:unit:ci`      | Same as `test:unit` with `PBT_NUM_RUNS=1200000` (CircleCI `unit-tests`) |
| `pnpm run test:unit:fast`    | Same suite with `PBT_NUM_RUNS=100` for local feedback in seconds     |
| `pnpm run test:smarter:doctor` | Validate `.circleci/test-suites.yml` locally (requires CircleCI CLI) |
| `pnpm run build`             | webpack production build                                             |

**CircleCI jobs**

| Job | Role | Blocks `build`? |
| --- | ---- | --------------- |
| `unit-tests` | Full suite, 100% coverage gate, ~3–4 min | Yes |
| `unit-test-smarter` | Smarter Testing: 4-way split + TIA, ~1 min on `main` | No (comparison demo) |

Watch mode for unit tests: `pnpm run test:unit:watch`. Override PBT volume locally: `PBT_NUM_RUNS=5000 pnpm run test:unit`.

With [chunk](https://github.com/circleci/chunk) configured (`.chunk/config.json`), run the same checks via `chunk validate` on your machine. Remote sidecar validation is optional; use it only after a working snapshot is available.

### Running Playwright Tests

Playwright covers UI flows end-to-end locally. CI does not run Playwright; MagicPod exercises the deployed staging site instead. Unit tests above cover all `src/**` logic (billing, validation, page scripts) with example-based and property-based checks.

This project provides Playwright E2E tests as an example.

#### Prerequisites

Make sure you have Node.js and pnpm installed, then install dependencies and browser binaries:

```bash
pnpm install
pnpm exec playwright install --with-deps
```

By default, tests run against `http://localhost:8080` and the Playwright test runner will start the webpack dev server for you. If you want to run tests against the deployed site instead, set the environment variable and skip starting the local server:

```bash
USE_DEPLOYED_SITE=true pnpm run test
```

If you prefer to start the local server yourself (for example to keep it running between test invocations), start it in another terminal with `pnpm run start`, then run the Playwright tests; they will reuse the existing server.

#### Run Tests

Headless (default):

```bash
pnpm run test
```

Headed mode (visible browser):

```bash
pnpm run test:headed
```

Interactive test runner UI:

```bash
pnpm run test:ui
```

View the latest HTML report after a run:

```bash
pnpm run test:report
```

### Legacy (Archived)

The repositories below contain legacy example code that is no longer maintained and is provided for reference only.
They are archived, not actively supported, and may not work with current versions.

The only actively maintained test examples for this project are the Playwright tests included in this repository.

#### English Examples

- [Java, Selenium 4](https://github.com/takeyaqa/hotel-example-selenium4-java-en-us)
- [Java, Selenide](https://github.com/takeyaqa/hotel-example-selenide-en-us)
- [Ruby, Capybara](https://github.com/takeyaqa/hotel-example-capybara-en-us)
- [JavaScript, WebdriverIO](https://github.com/takeyaqa/hotel-example-webdriverio-en-us)
- [Java, Selenium 3](https://github.com/takeyaqa/hotel-example-selenium3-java-en-us)

#### Japanese Examples

- [Java, Selenium 4](https://github.com/takeyaqa/hotel-example-selenium4-java-ja)
- [Java, Selenide](https://github.com/takeyaqa/hotel-example-selenide-ja)
- [Ruby, Capybara](https://github.com/takeyaqa/hotel-example-capybara-ja)
- [JavaScript, WebdriverIO](https://github.com/takeyaqa/hotel-example-webdriverio-ja)
- [Java, Selenium 3](https://github.com/takeyaqa/hotel-example-selenium3-java-ja)

### Changelog

<https://github.com/takeyaqa/hotel-example-site/releases>
