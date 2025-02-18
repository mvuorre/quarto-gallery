// _extensions/gallery/generate-gallery.ts

interface GalleryImage {
    filename: string;
    title: string;
}

// Directories to ignore when scanning for galleries
const IGNORED_DIRS = new Set(["docs", "tests", "_metadata", "_site", "_extensions"]);

// Find all directories that contain an 'images' subdirectory
async function findGalleryDirectories(basePath: string): Promise<string[]> {
    const dirs: string[] = [];

    try {
        for await (const entry of Deno.readDir(basePath)) {
            if (entry.isDirectory && !IGNORED_DIRS.has(entry.name)) {
                const dirPath = `${basePath}/${entry.name}`;
                try {
                    await Deno.stat(`${dirPath}/images`);
                    dirs.push(dirPath);
                } catch {
                    dirs.push(...await findGalleryDirectories(dirPath));
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${basePath}:`, error);
    }

    return dirs;
}

// Get all images from a directory
async function getImagesFromDirectory(dirPath: string): Promise<GalleryImage[]> {
    const images: GalleryImage[] = [];

    try {
        for await (const file of Deno.readDir(dirPath)) {
            if (file.isFile && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
                const title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
                images.push({ filename: file.name, title });
            }
        }
    } catch (error) {
        console.error(`Error reading images from ${dirPath}:`, error);
    }

    return images;
}

// Generate markdown for a gallery
function generateGalleryMarkdown(images: GalleryImage[]): string {
    const imageMarkdown = images
        .map(img => `![](images/${img.filename}){.lightbox group="gallery" fig-alt="${img.title}"}`)
        .join('\n\n');

    return `::: {layout-ncol=3}
${imageMarkdown}
:::`;
}

// Process a single gallery directory
async function processGallery(galleryDir: string): Promise<void> {
    try {
        const imagesDir = `${galleryDir}/images`;
        const images = await getImagesFromDirectory(imagesDir);

        if (images.length === 0) {
            console.log(`No images found in ${galleryDir}`);
            return;
        }

        const qmdPath = `${galleryDir}/index.qmd`;
        let frontmatter = "";

        // Preserve existing frontmatter if it exists
        try {
            const existingContent = await Deno.readTextFile(qmdPath);
            const match = existingContent.match(/^---\n([\s\S]*?)\n---/);
            if (match) frontmatter = match[0] + '\n\n';
        } catch {
            // File doesn't exist yet, which is fine
        }

        const content = frontmatter + generateGalleryMarkdown(images);
        await Deno.writeTextFile(qmdPath, content);
        console.log(`Generated gallery page for ${galleryDir}`);

    } catch (error) {
        console.error(`Error processing gallery ${galleryDir}:`, error);
    }
}

// Main function to process all galleries
async function main() {
    try {
        const galleries = await findGalleryDirectories("galleries");
        await Promise.all(galleries.map(processGallery));
        console.log(`Processed ${galleries.length} galleries`);
    } catch (error) {
        console.error('Error generating galleries:', error);
        Deno.exit(1);
    }
}

// Only run during full project render
if (Deno.env.get("QUARTO_PROJECT_RENDER_ALL")) {
    main();
}
