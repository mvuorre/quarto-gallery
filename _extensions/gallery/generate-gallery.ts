// _extensions/gallery/generate-gallery.ts
// ... (previous imports and functions remain the same) ...

async function generateGalleryContent(galleryDir: string) {
    try {
        const imagesDir = `${galleryDir}/images`;

        // Debug: Log the directory we're scanning
        console.log(`Scanning directory: ${imagesDir}`);

        const images: string[] = [];

        // Collect all images
        for await (const file of Deno.readDir(imagesDir)) {
            if (file.isFile && /\.(jpg|jpeg|png)$/i.test(file.name)) {
                images.push(file.name);
                // Debug: Log each image found
                console.log(`Found image: ${file.name}`);
            }
        }

        if (images.length > 0) {
            // Debug: Log the markdown we're about to generate
            const galleryContent = images.map(img => `![](images/${img})`).join('\n');
            console.log('Generated markdown:\n', galleryContent);

            const content = `---
---

::: {.gallery}
${galleryContent}
:::`;

            const qmdPath = `${galleryDir}/index.qmd`;
            await Deno.writeTextFile(qmdPath, content);
            console.log(`Written to ${qmdPath}`);
        }

    } catch (error) {
        console.error(`Error processing gallery ${galleryDir}:`, error);
    }
}
