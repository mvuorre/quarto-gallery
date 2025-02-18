# Quarto image gallery

## Install

1. Add extension
```bash
quarto use template mvuorre/quarto-gallery
```
2. include `pre-render: generate-gallery.ts` in [`_quarto.yml`](_quarto.yml)
3. Create your gallery at `galleries/<name>/` with `index.qmd` and `images/<images.ext>`
    - See `galleries/my-gallery/` for an example
4. Edit `galleries/_metadata.yml` and `galleries.qmd` to your liking
5. `quarto render`
