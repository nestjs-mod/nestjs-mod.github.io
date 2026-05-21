import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "NestJS-mod",
  tagline:
    "A collection of utilities for unifying NestJS applications and modules.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://nestjs-mod.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "nestjs-mod", // Usually your GitHub org/user name.
  projectName: "nestjs-mod", // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
        htmlLang: "en-US",
      },
      ru: {
        label: "Русский",
        direction: "ltr",
        htmlLang: "ru-RU",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/nestjs-mod/nestjs-mod.com/blob/master/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/fon-nest.png",
    sidebar: {},
    navbar: {
      title: "NestJS-mod",
      logo: {
        alt: "NestJS-mod",
        src: "img/logo.svg",
      },
      items: [
        // English locale items
        {
          type: "docSidebar",
          sidebarId: "packagesSidebar",
          position: "left",
          label: "Packages",
          className: "navbar-item-en",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "guidesSidebar",
          position: "left",
          label: "Docs",
          className: "navbar-item-en",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "enPostsSidebar",
          position: "left",
          label: "Posts",
          className: "navbar-item-en",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "testsSidebar",
          position: "left",
          label: "Tests",
          className: "navbar-item-en",
          collapsed: false,
          docsPluginId: "default",
        },
        // Russian locale items
        {
          type: "docSidebar",
          sidebarId: "packagesSidebar",
          position: "left",
          label: "Пакеты",
          className: "navbar-item-ru",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "ruGuidesSidebar",
          position: "left",
          label: "Документация",
          className: "navbar-item-ru",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "ruPostsSidebar",
          position: "left",
          label: "Посты",
          className: "navbar-item-ru",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "docSidebar",
          sidebarId: "ruTestsSidebar",
          position: "left",
          label: "Тесты",
          className: "navbar-item-ru",
          collapsed: false,
          docsPluginId: "default",
        },
        {
          type: "localeDropdown",
          position: "right",
          dropdownItemsBefore: [],
          dropdownItemsAfter: [],
        },
        {
          href: "https://github.com/nestjs-mod",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs/guides/introduction",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/drpg5rTmgG",
            },
            {
              label: "Telegram",
              href: "https://t.me/nestjs_mod",
            },
          ],
        },
        {
          title: "Links",
          items: [
            {
              label: "Posts on Dev.to",
              href: "https://dev.to/t/nestjsmod",
            },
            {
              label: "Posts on Habr.com",
              href: "https://habr.com/ru/search/?q=[nestjsmod]",
            },
            {
              label: "GitHub",
              href: "https://github.com/nestjs-mod",
            },
            {
              label: "NPM",
              href: "https://www.npmjs.com/org/nestjs-mod",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NestJS-mod`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        language: ["en", "ru"],
      },
    ],
  ],

  plugins: [
    [
      "docusaurus-plugin-yandex-metrica",
      {
        counterID: "98948842",
        webvisor: true,
        trackHash: true,
      },
    ],
  ],
};

export default config;
