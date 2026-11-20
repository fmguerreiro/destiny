# Destiny

<img align="center" alt="example transformation" src="https://raw.githubusercontent.com/benawad/destiny/master/assets/example.png" />

<h2 align="center">Prettier for File Structures</h2>

<p align="center">
  <a href="https://www.npmjs.com/package/destiny">
    <img alt="npm version" src="https://badge.fury.io/js/destiny.svg">
  </a>

  <a href="https://github.com/benawad/destiny/issues">
    <img alt="contributions welcome" src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat">
  </a>

  <a href="https://github.com/benawad/destiny/actions?query=workflow%3Aci">
    <img alt="ci workflow" src="https://github.com/benawad/destiny/workflows/ci/badge.svg">
  </a>

  <a href="https://gitter.im/destiny-dev/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img alt="Join the chat at https://gitter.im/destiny-dev/community" src="https://badges.gitter.im/destiny-dev/community.svg">
  </a>

  <a href="https://github.com/benawad/destiny">
    <img alt="file structure: destiny" src="https://img.shields.io/badge/file%20structure-destiny-7a49ff?style=flat">
  </a>
</p>

---

Motivation: https://www.youtube.com/watch?v=rGYbrIf-y58

## What does this do?

1. Scans a folder for all the files in it
2. Creates a directed graph based on how the JavaScript/TypeScript files import each other
   ![example directed graph](https://raw.githubusercontent.com/benawad/destiny/master/assets/graph.png)
3. Creates a fractal representation of the graph (following similar rules outlined here: https://hackernoon.com/fractal-a-react-app-structure-for-infinite-scale-4dab943092af)
4. Moves existing files into the fractal structure
5. Fixes imports
6. Removes all empty folders
7. Prints files that are "unused" (not imported by anyone and doesn't import anything)

The end result is a "prettified" file structure.

## Disclaimer

- This is a work in progress and 100% has bugs of some kind in it
- BEFORE running this tool on your codebase, make sure you have committed to git or made a backup (I don't expect the tool to destroy your work (although it's possible), but just in case you don't like the results)
- Snapshot tests don't format correctly
- Only works on JavaScript/TypeScript codebases (although this concept could probably be extended to any language)

## How to run it

```
$ destiny --help
destiny - Prettier for file structures.

USAGE

  destiny [option...] [path]

  The path argument can consist of either a file path or a glob.

OPTIONS

  -V, --version              Output version number
  -h, --help                 Output usage information
  -w, --write                Restructure and edit folders and files
  --keep <file or glob>      Keep matching included files at their original paths (repeatable)
  --next-routes              Keep Next.js app and pages files at their original paths
  -S, --avoid-single-file    Flag to indicate if single files in folders should be avoided
  --debug [?output file]     Print debugging info
```

Dry run which will output what the resulting file structure will look like:

```
npx destiny "src/**/*.*"
```

This will actually move files around and fix imports:

```
npx destiny -w "src/**/*.*"
```

To preview a Next.js project while keeping its filesystem routes:

```
destiny --next-routes "src/**/*.*"
```

After reviewing the proposal, write only a selected feature:

```
destiny --next-routes -w --keep "src/features/data-onboarding/snapshot.tsx" "src/features/data-onboarding/**/*.*"
```

`--next-routes` pins all included files under project-root `app/`, `pages/`, `src/app/`, and `src/pages/`, including colocated components and metadata. The nearest `package.json` determines the project root. It does not pin files outside those directories. Destiny cannot resolve TypeScript path aliases such as `@/` or rewrite imports outside the selected paths. Before writing, review the proposal and keep every selected file imported through an alias or from outside the selection at its existing path.

`--keep` also works in `destiny` configuration as an array of paths or globs. Files outside the selected paths are not moved or rewritten; select a narrow scope or keep their public imports in place.

## Documentation

You can find the [full documentation at this url](https://github.com/benawad/destiny/wiki).

## This tool might be useless

It might be better to just name your folders.

## Why did you name it destiny?

![The name could be "Destiny" maybe. Like the file was meant to be there.](https://raw.githubusercontent.com/benawad/destiny/master/assets/name.png)

## Contributing

Pull requests are welcome :)

## Badge

[![file structure: destiny](https://img.shields.io/badge/file%20structure-destiny-7a49ff?style=flat)](https://github.com/benawad/destiny)

```
[![file structure: destiny](https://img.shields.io/badge/file%20structure-destiny-7a49ff?style=flat)](https://github.com/benawad/destiny)
```
