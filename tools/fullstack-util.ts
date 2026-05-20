import fg from "fast-glob";
import normalizePath_ from "normalize-path";
import { fileURLToPath } from "url";
import { basename, dirname, join } from "path";

import { promises as fsPromises, rmdir, rmdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import writeFileAtomic from "write-file-atomic";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

        await writeFileAtomic(
          join(filePath, "..", "..", `${firstLineDate}.md`),
          [
            `# ${firstLineText}`,
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

        // Only write if content changed
        if (content !== originalContent) {
          await writeFileAtomic(filePath, content);
          console.log(`✓ Fixed: ${filePath}`);
        }
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
