const fg = require("fast-glob");
const { promises: fsPromises } = require("node:fs");
const { dirname, join } = require("path");
const writeFileAtomic = require("write-file-atomic");

/**
 * Adds date note to existing MD files that already have frontmatter
 */
async function addDateNote() {
  const allMdFiles = await fg.glob([
    join(__dirname, "../docs/en-posts/fullstack/**/*.md"),
    join(__dirname, "../docs/ru-posts/fullstack/**/*.md"),
  ]);

  console.log(`Found ${allMdFiles.length} markdown files to process...`);

  let processedCount = 0;
  let skippedCount = 0;

  await Promise.all(
    allMdFiles.map(async (filePath) => {
      try {
        let content = await fsPromises.readFile(filePath, "utf8");

        // Skip if file doesn't have frontmatter
        if (!content.startsWith("---")) {
          console.log(`⊘ Skipped (no frontmatter): ${filePath}`);
          skippedCount++;
          return;
        }

        // Extract the frontmatter block
        const frontmatterEndIndex = content.indexOf("---", 3);
        if (frontmatterEndIndex === -1) {
          console.log(`⊘ Skipped (invalid frontmatter): ${filePath}`);
          skippedCount++;
          return;
        }

        const frontmatter = content.substring(0, frontmatterEndIndex + 3);
        const restOfContent = content.substring(frontmatterEndIndex + 3);

        // Check if date note already exists
        if (restOfContent.includes("**Дата публикации:**")) {
          console.log(`⊘ Skipped (already has date note): ${filePath}`);
          skippedCount++;
          return;
        }

        // Extract date from filename (e.g., "2024-08-08" from "2024-08-08-some-title.md")
        const fileName = filePath.split("/").pop() || "";
        const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
        const dateFromFilename = dateMatch ? dateMatch[1] : "";

        if (!dateFromFilename) {
          console.log(`⊘ Skipped (no date in filename): ${filePath}`);
          skippedCount++;
          return;
        }

        // Determine language based on path
        const isEnglish = filePath.includes("/en-posts/");
        const dateLabel = isEnglish ? "Publication date" : "Дата публикации";

        // Extract title from the first H1 heading
        const titleMatch = restOfContent.match(/^#\s+(.+)$/m);
        if (!titleMatch) {
          console.log(`⊘ Skipped (no H1 heading found): ${filePath}`);
          skippedCount++;
          return;
        }

        // Find the position after the H1 heading
        const titleEndIndex = restOfContent.indexOf("\n", restOfContent.indexOf(titleMatch[0]));
        const afterTitle = restOfContent.substring(titleEndIndex + 1).trimStart();

        // Add date note
        const dateNote = `> **${dateLabel}:** ${dateFromFilename}\n`;
        const newContent = `${frontmatter}${restOfContent.substring(0, titleEndIndex + 1)}\n${dateNote}\n${afterTitle}`;

        // Write the file with date note
        await writeFileAtomic(filePath, newContent);
        console.log(`✓ Added date note: ${filePath}`);
        processedCount++;
      } catch (err) {
        console.error(`✗ Error processing ${filePath}:`, err);
      }
    })
  );

  console.log(`\n✅ Complete!`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
}

addDateNote();
