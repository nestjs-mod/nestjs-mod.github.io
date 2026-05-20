const fg = require("fast-glob");
const { promises: fsPromises } = require("node:fs");
const { dirname, join } = require("path");
const writeFileAtomic = require("write-file-atomic");

/**
 * Adds Docusaurus frontmatter metadata to existing MD files
 * Extracts title from the first H1 heading and adds YAML frontmatter
 */
async function addDocusaurusFrontmatter() {
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
        const content = await fsPromises.readFile(filePath, "utf8");

        // Skip if file already has frontmatter
        if (content.startsWith("---")) {
          console.log(`⊘ Skipped (already has frontmatter): ${filePath}`);
          skippedCount++;
          return;
        }

        // Extract title from the first H1 heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (!titleMatch) {
          console.log(`⊘ Skipped (no H1 heading found): ${filePath}`);
          skippedCount++;
          return;
        }

        let title = titleMatch[1].trim();

        // Remove trailing period if exists
        if (title.endsWith(".")) {
          title = title.slice(0, -1);
        }

        // Extract date from filename (e.g., "2024-08-08" from "2024-08-08-some-title.md")
        const fileName = filePath.split("/").pop() || "";
        const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
        const dateFromFilename = dateMatch ? dateMatch[1] : "";

        // Determine language based on path
        const isEnglish = filePath.includes("/en-posts/");
        const dateLabel = isEnglish ? "Publication date" : "Дата публикации";

        // Create slug from the title
        const slugifiedTitle = title
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\p{L}\p{N}-]/gu, "")
          .toLowerCase();

        const slug = dateFromFilename
          ? `/${dateFromFilename}-${slugifiedTitle}`
          : `/${slugifiedTitle}`;

        // Create Docusaurus frontmatter
        // Escape double quotes in title for YAML compatibility
        const escapedTitle = title.replace(/"/g, '\\"');
        const frontmatter = [
          "---",
          `title: \"${escapedTitle}\"`,
          `slug: \"${slug}\"`,
          `sidebar_label: \"${escapedTitle}\"`,
          "---",
          "",
        ].join("\n");

        // Remove the old H1 heading and add frontmatter
        const newContent = content.replace(/^#\s+.+$/m, "").trimStart();
        
        // Add date note at the beginning
        const dateNote = dateFromFilename ? `> **${dateLabel}:** ${dateFromFilename}\n` : '';
        const finalContent = `${frontmatter}# ${title}\n\n${dateNote}\n${newContent}`;

        // Write the file with frontmatter
        await writeFileAtomic(filePath, finalContent);
        console.log(`✓ Added frontmatter: ${filePath}`);
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

addDocusaurusFrontmatter();
