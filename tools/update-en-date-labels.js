const fg = require("fast-glob");
const { promises: fsPromises } = require("node:fs");
const { dirname, join } = require("path");
const writeFileAtomic = require("write-file-atomic");

/**
 * Updates date label in English MD files from Russian to English
 */
async function updateEnglishDateLabels() {
  const allMdFiles = await fg.glob([
    join(__dirname, "../docs/en-posts/fullstack/**/*.md"),
  ]);

  console.log(`Found ${allMdFiles.length} English markdown files to process...`);

  let processedCount = 0;
  let skippedCount = 0;

  await Promise.all(
    allMdFiles.map(async (filePath) => {
      try {
        let content = await fsPromises.readFile(filePath, "utf8");

        // Check if file has the Russian date label
        if (!content.includes("**Дата публикации:**")) {
          console.log(`⊘ Skipped (no Russian date label): ${filePath}`);
          skippedCount++;
          return;
        }

        // Replace Russian label with English
        const newContent = content.replace(
          /\*\*Дата публикации:\*\*/g,
          '**Publication date:**'
        );

        // Write the updated file
        await writeFileAtomic(filePath, newContent);
        console.log(`✓ Updated to English: ${filePath}`);
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

updateEnglishDateLabels();
