# Biodiversity Toolkit

Free tools for people who work with biodiversity data: some for working with the data that
biodiversity studies produce, some for learning the vocabulary those studies use, and some for
doing the research better. Each tool is a single HTML file that opens in a web browser. The
tools published so far run offline, with nothing to install and nothing uploaded: your data stay
on your computer.

**Website:** https://ali-rezaye.github.io/biodiversity-toolkit/

| Tool | What it does | Current version | Stable link |
|---|---|---|---|
| Checklist Comparer | Compares checklists of any group of organisms, using the ranks in the user's own columns. Jaccard, Sørensen and Simpson indices, incidence matrix, UPGMA tree, name check (flags look-alike spellings; does not validate names), species–area fit. | v1.16 | [tools/comparer.html](tools/comparer.html) |
| Phylogenetic Checklist Viewer | Arranges a *plant* checklist in phylogenetic order (APG V 2026, PPG I 2016, Yang et al. 2022, BPG 2024; 706 families). Shows present and absent families, each family's share of the checklist and of world diversity, and similarity between checklists. Recognises 706 current and 1,323 former family names of extant plants. | v49 | [tools/viewer.html](tools/viewer.html) |
| Checklist Cleaner | Applies one table of name corrections (synonyms, misspellings, deletions, or a new rank such as subfamily) to any number of checklists at once, merges the records of a synonym into its accepted name, reports every change and returns corrected copies. | v1.1 | [tools/cleaner.html](tools/cleaner.html) |

The stable links always open the newest version. Earlier versions stay in the `tools` folder,
so old links keep working.

**None of the tools validates species names.** Check names first with
[TNRS](https://tnrs.biendata.org/) (plants) or [ChecklistBank](https://www.checklistbank.org/).

## Authors

- Ali Rezaye, Somaliland Biodiversity Foundation. ORCID: https://orcid.org/0009-0003-3560-4672
- Mary E. Barkworth, Somaliland Biodiversity Foundation; Utah State University. ORCID: https://orcid.org/0000-0001-9785-1538

Developed with assistance from Claude (Anthropic).

## How to cite

Rezaye A, Barkworth ME (2026). *Checklist Comparer* (Version v1.16) [Computer software]. https://ali-rezaye.github.io/biodiversity-toolkit/

Rezaye A, Barkworth ME (2026). *Phylogenetic Checklist Viewer* (Version v49) [Computer software]. https://ali-rezaye.github.io/biodiversity-toolkit/

Rezaye A, Barkworth ME (2026). *Checklist Cleaner* (Version v1.1) [Computer software]. https://ali-rezaye.github.io/biodiversity-toolkit/

DOI: to be added on release via Zenodo.

A paper describing the tools is in preparation. The file [CITATION.cff](CITATION.cff) holds the
citation in a standard form; GitHub's "Cite this repository" button reads it.

## Licence

Copyright © 2026 Somaliland Biodiversity Foundation. The tools (software) are licensed under the
GNU General Public License v3.0 — see [LICENSE](LICENSE). The website text, images and
documentation, and content such as keys, are licensed under Creative Commons Attribution 4.0
International (CC BY 4.0) — see [LICENSE-CC-BY-4.0](LICENSE-CC-BY-4.0). The tools contain no
third-party code.

## What is in this repository

| Path | What it is |
|---|---|
| `index.html`, `viewer.html`, `comparer.html`, `cite.html`, `about.html`, `style.css` | The website (plain HTML and CSS, no build step) |
| `tools/` | The tools themselves, every version, plus the stable links `comparer.html`, `viewer.html` and `cleaner.html` |
| `scripts/update-site.mjs` | Helper that sets the GitHub username, version numbers, file sizes, dates, DOI and the counting and download-log addresses on the website |
| `CITATION.cff`, `LICENSE`, `LICENSE-CC-BY-4.0`, `README.md` | Citation, the two licences and this file |
| `.nojekyll` | Tells GitHub Pages to publish the files as they are |

## Adding a new version of a tool (for maintainers)

This section is for the people who maintain the site. Only people with write access to this repository can change its files. GitHub keeps every version of every file, so nothing is lost when a file is replaced.

1. Copy the new tool file into `tools/`. Keep the older files, so old links keep working.
2. In this folder, run one of these (Node.js needed):
   `node scripts/update-site.mjs comparer v1.17`
   `node scripts/update-site.mjs viewer v50`
   `node scripts/update-site.mjs cleaner v1.2`
3. Upload the files the script lists, then make a GitHub release with the tag the script prints.
