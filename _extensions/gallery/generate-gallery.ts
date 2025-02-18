// _extensions/gallery/generate-gallery.ts

const multiImport = async (...sources: string[]) => {
    for (const source of sources) {
        try {
            return await import(source);
        } catch (e) { }
    }
}

const { parse, stringify } = await multiImport(
    "stdlib/yaml",
    "https://deno.land/std/yaml/mod.ts"
);

// Simple EXIF parser for datetime
async function getImageMetadata(filepath: string): Promise<string> {
    try {
        const file = await Deno.open(filepath);
        const buffer = new Uint8Array(50000); // Read first 50KB which should contain EXIF
        await file.read(buffer);
        file.close();

        // Look for EXIF datetime
        const data = new TextDecoder().decode(buffer);
        const dateMatch = data.match(/\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);

        if (dateMatch) {
            // Convert EXIF datetime format to more readable format
            const [date, time] = dateMatch[0].split(' ');
            const [year, month, day] = date.split(':');
            return `${year}-${month}-${day} ${time}`;
        }

        // Fallback to file creation time
        const fileInfo = await Deno.stat(filepath);
        return new Date(fileInfo.birthtime ?? fileInfo.mtime ?? Date.now())
            .toLocaleString();
    } catch (error) {
        console.error(`Error reading metadata for ${filepath}:`, error);
        return "";
    }
}

async function generateGalleryContent(galleryDir: string) {
    try {
        const images: Array<{ file: string; metadata: string }> = [];

        // Collect all images and their metadata
        for await (const file of Deno.readDir(galleryDir)) {
            if (file.isFile && /\.(jpg|jpeg|png)$/i.test(file.name)) {
                const metadata = await getImageMetadata(`${galleryDir}/${file.name}`);
                images.push({
                    file: file.name,
                    metadata
                });
            }
        }

        if (images.length > 0) {
            const qmdPath = `${galleryDir}/index.qmd`;
            let existingMetadata = {};

            // Try to read existing file and preserve metadata
            try {
                const existing = await Deno.readTextFile(qmdPath);
                const yamlMatch = existing.match(/^---\n([\s\S]*?)\n---/);
                if (yamlMatch) {
                    existingMetadata = parse(yamlMatch[1]);
                }
            } catch (_) {
                // File doesn't exist, use default metadata
            }

            // Ensure we have the gallery format but preserve other metadata
            const metadata = {
                ...existingMetadata,
                format: {
                    ...existingMetadata.format,
                    html: {
                        ...existingMetadata.format?.html,
                        template: "gallery-html"
                    }
                }
            };

            // Generate content with preserved metadata and image timestamps
            const content = `---
${stringify(metadata)}---

::: {.gallery}
${images.map(img => `![${img.metadata}](${img.file})`).join('\n')}
:::`;

            await Deno.writeTextFile(qmdPath, content);
            console.log(`Updated gallery content for ${galleryDir}`);
        }

    } catch (error) {
        console.error(`Error processing gallery ${galleryDir}:`, error);
    }
}

async function main() {
    try {
        const baseDir = "galleries";

        // Process each gallery directory
        for await (const entry of Deno.readDir(baseDir)) {
            if (entry.isDirectory && entry.name !== "_site") {
                await generateGalleryContent(`${baseDir}/${entry.name}`);
            }
        }
    } catch (error) {
        console.error('Error generating galleries:', error);
        Deno.exit(1);
    }
}

// Only run full generation when rendering all files
if (Deno.env.get("QUARTO_PROJECT_RENDER_ALL")) {
    main();
}
