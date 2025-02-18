all: docs

docs: index.qmd galleries.qmd
	quarto render

# Test use of template
tests:
	make clean
	cd tests; quarto use template ../.

clean:
	rm -rf docs/
	find tests/ -mindepth 1 -maxdepth 1 ! -name "_quarto.yml" -exec rm -rf {} \;

.PHONY: all clean tests
