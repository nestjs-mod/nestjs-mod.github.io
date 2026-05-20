const fg = require("fast-glob");
const normalizePath_ = require("normalize-path");

import { promises as fsPromises, rmdir, rmdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { join } from "path";
import * as writeFileAtomic from "write-file-atomic";



function escapeStringRegexp(string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a string");
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

export async function replaceInFiler(
  filePaths: string[],
  {
    find,
    replacement,
    ignoreCase,
  }: {
    find: (string | RegExp)[];
    replacement: string[];
    ignoreCase?: boolean;
  }
) {
  filePaths = [filePaths].flat();

  if (filePaths.length === 0) {
    return;
  }

  if (find?.length === 0) {
    throw new Error("Expected at least one `find` pattern");
  }

  if (replacement === undefined) {
    throw new Error("The `replacement` option is required");
  }

  // Replace the replacement string with the string unescaped (only one backslash) if it's escaped
  replacement = replacement.map((r) =>
    r.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
  );

  filePaths = await fg.glob(filePaths);

  find = find?.map((element) => {
    const iFlag = ignoreCase ? "i" : "";

    if (typeof element === "string") {
      return new RegExp(escapeStringRegexp(element), `g${iFlag}`);
    }

    return new RegExp(
      element.source,
      `${element.flags.replace("i", "")}${iFlag}`
    );
  });

  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const string = await fsPromises.readFile(filePath, "utf8");
        const lines = string.split("\n");
        let firstLine = lines[0].split("# ")[1] || lines[0].split("## ")[1];
        if (firstLine[firstLine.length - 1] === ".") {
          firstLine = firstLine.slice(0, -1);
        }

        let newString = string;
        for (let index = 0; index < find.length; index++) {
          const pattern = find[index];
          newString = newString.replace(pattern, replacement[index]);
        }

        const firstLineDate = firstLine.split("]")[0].split("[")[1];
        const firstLineText = firstLine.split("]").splice(1).join("]").trim();

        // Determine language based on path
        const isEnglish = filePath.includes("/en-posts/");
        const dateLabel = isEnglish ? "Publication date" : "Дата публикации";

        // Create slug from the title
        const slugifiedTitle = firstLineText
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\p{L}\p{N}-]/gu, "")
          .toLowerCase();

        // Escape double quotes in title for YAML compatibility
        const escapedTitle = firstLineText.replace(/"/g, '\\"');

        // Add Docusaurus frontmatter with metadata
        const frontmatter = [
          '---',
          `title: "${escapedTitle}"`,
          `slug: "/${firstLineDate}-${slugifiedTitle}"`,
          `sidebar_label: "${escapedTitle}"`,
          '---',
          '',
        ].join('\n');

        await writeFileAtomic(
          join(filePath, "..", "..", `${firstLineDate}.md`),
          [
            frontmatter,
            `# ${firstLineText}`,
            '',
            `> **${dateLabel}:** ${firstLineDate}`,
            '',
            ...newString
              .split("\n")
              .filter((s, i, a) =>
                (i === a.length - 1 && !s) || s.includes("Предыдущая статья:")
                  ? false
                  : true
              )
              .slice(1),
            ` #${firstLineDate}`,
          ].join("\n")
        );
        rmSync(dirname(filePath), { recursive: true, force: true });
      } catch (err) {
        console.error(err, err.stack);
      }
    })
  );
}

async function main() {
  // Fix all MDX compilation issues in fullstack posts
  const allMdFiles = await fg.glob([
    join(__dirname, "../docs/en-posts/fullstack/**/*.md"),
    join(__dirname, "../docs/ru-posts/fullstack/**/*.md"),
  ]);

  console.log(`Found ${allMdFiles.length} markdown files to process...`);

  await Promise.all(
    allMdFiles.map(async (filePath) => {
      try {
        let content = await readFile(filePath, "utf8");
        let originalContent = content;

        // Fix {% spoiler ... %} patterns
        content = content.replace(/\{%\s*spoiler\s+([^%]*)%\}/gi, '<spoiler title="$1">');

        // Fix {% endspoiler %} patterns
        content = content.replace(/\{%\s*endspoiler\s*%\}/gi, "</spoiler>");

        // Fix any other {% ... %} patterns that might cause issues
        content = content.replace(/\{%\s*(\w+)\s*([^%]*)%\}/g, (match, keyword, attrs) => {
          // Convert to MDX comment to avoid parsing errors
          return `{/* ${match} */}`;
        });

        // Extract the date from the file path (e.g., "2024-08-08" from "/2024-08-08/ru.md")
        const pathParts = filePath.split("/");
        const dateDir = pathParts[pathParts.length - 2]; // Second to last part is the date directory
        const fileName = pathParts[pathParts.length - 1]; // Last part is the filename (ru.md or en.md)

        // Determine language based on path
        const isEnglish = filePath.includes("/en-posts/");
        const dateLabel = isEnglish ? "Publication date" : "Дата публикации";

        // Extract title from the first line of the file
        // Expected format: "## [2024-08-08] Создание пустого проекта с помощью NestJS-mod."
        const firstLineMatch = content.match(/^##\s+\[([^\]]+)\]\s+(.+)$/m);
        let newFileName = dateDir;
        let title = "";

        if (firstLineMatch) {
          const dateFromTitle = firstLineMatch[1]; // e.g., "2024-08-08"
          title = firstLineMatch[2]; // e.g., "Создание пустого проекта с помощью NestJS-mod."

          // Remove trailing period if exists
          if (title.endsWith(".")) {
            title = title.slice(0, -1);
          }

          // Use title as the filename (slugify it)
          // Keep Cyrillic characters, replace spaces with hyphens, remove special characters
          const slugifiedTitle = (title || dateFromTitle)
            .trim()
            .replace(/\s+/g, "-")
            .replace(new RegExp("[^\\p{L}\\p{N}-]", "gu"), "") // Keep letters, numbers, and hyphens
            .toLowerCase();

          // Combine date and title for the filename
          newFileName = `${dateFromTitle}-${slugifiedTitle}`;

          // Remove the first line with the old title format
          content = content.replace(/^##\s+\[[^\]]+\]\s+.+$/m, "").trimStart();

          // Escape double quotes in title for YAML compatibility
          const escapedTitle = title.replace(/"/g, '\\"');

          // Add Docusaurus frontmatter with metadata
          const frontmatter = [
            '---',
            `title: "${escapedTitle}"`,
            `slug: "/${dateFromTitle}-${slugifiedTitle}"`,
            `sidebar_label: "${escapedTitle}"`,
            '---',
            '',
          ].join('\n');

          // Add H1 heading with the title after frontmatter
          // Add date note at the beginning
          const dateNote = `> **${dateLabel}:** ${dateFromTitle}\n`;
          content = `${frontmatter}# ${title}\n\n${dateNote}\n${content}`;
        }

        // Determine the new file path (one level up, with .md extension)
        const dirPath = dirname(filePath);
        const parentDir = dirname(dirPath);
        const newFilePath = join(parentDir, `${newFileName}.md`);

        // Write the processed content to the new location
        await writeFileAtomic(newFilePath, content);
        console.log(`✓ Processed: ${filePath} -> ${newFilePath}`);

        // Remove the old directory
        rmSync(dirPath, { recursive: true, force: true });
        console.log(`  Deleted old directory: ${dirPath}`);

      } catch (err) {
        console.error(`✗ Error processing ${filePath}:`, err);
      }
    })
  );

  console.log("MDX fixes complete!");
  await writeFileAtomic(
    join(__dirname, "..", "docs/ru-posts/fullstack/_category_.json"),
    `{
  "label": "Fullstack",
  "position": 1,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "description": "Шаблон для создания fullstack-приложения на NestJS и Angular."
  }
}`
  );
  await writeFileAtomic(
    join(__dirname, "..", "docs/en-posts/fullstack/_category_.json"),
    `{
  "label": "Fullstack",
  "position": 1,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "description": "Boilerplate for creating a fullstack application on NestJS and Angular."
  }
}`
  );

  // replace bad symbol used in md grid
  const content = (
    await readFile(
      join(
        __dirname,
        "..",
        "docs/packages/infrastructure/docker-compose/README.md"
      )
    )
  ).toString();
  await writeFileAtomic(
    join(
      __dirname,
      "..",
      "docs/packages/infrastructure/docker-compose/README.md"
    ),
    content
      .split("${MAILDEV_WEB_PORT}${MAILDEV_BASE_PATHNAME}")
      .join("1080")
      .split(" || exit 1")
      .join("")
  );
}

main();
