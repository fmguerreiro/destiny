import fs from "fs";
import path from "path";
import chalk from "chalk";
import glob from "glob";

import logger from "../shared/logger";
import printTree from "./generateTrees/printTree";
import { RootOption as Root } from "./shared/RootOption";
import { buildGraph } from "./generateTrees/buildGraph";
import { findEntryPoints } from "./generateTrees/findEntryPoints";
import { toFractalTree } from "./generateTrees/toFractalTree";
import { detectLonelyFiles } from "./shared/detect-lonely-files";
import { Config } from "../index";
import { isTestFile } from "./generateTrees/shared/isTestFile";

const getRootFolder = (parentDir: string) => parentDir.split(path.sep).pop();

export function generateTrees(
  restructureMap: { [key: string]: string[] },
  { avoidSingleFile, keep, nextRoutes }: Config
) {
  const packageRoots = new Map<string, string | null>();
  const isNextRouteFile = (filePath: string) => {
    let dir = path.dirname(path.resolve(filePath));
    const visited: string[] = [];
    while (!packageRoots.has(dir)) {
      visited.push(dir);
      if (fs.existsSync(path.join(dir, "package.json"))) {
        packageRoots.set(dir, dir);
        break;
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        packageRoots.set(dir, null);
        break;
      }
      dir = parent;
    }
    const projectRoot = packageRoots.get(dir);
    for (const ancestor of visited)
      packageRoots.set(ancestor, projectRoot ?? null);
    if (!projectRoot) return false;
    const parts = path.relative(projectRoot, filePath).split(path.sep);
    const routeFolder = parts[0] === "src" ? parts[1] : parts[0];
    return routeFolder === "app" || routeFolder === "pages";
  };
  const keptFiles = new Set(
    keep.flatMap(pattern =>
      glob.sync(pattern, { nodir: true }).map(file => path.resolve(file))
    )
  );
  return Object.entries(restructureMap).reduce<Root[]>(
    (rootOptions, [rootPath, filePaths]) => {
      if (filePaths.length <= 1) return rootOptions;

      logger.info(`Generating tree for: ${rootPath}`);

      const { graph, parentFolder } = buildGraph(filePaths);

      const entryPoints = findEntryPoints(graph);
      let tree = toFractalTree(graph, entryPoints);

      if (avoidSingleFile) {
        tree = detectLonelyFiles(tree);
      }

      for (const filePath of filePaths) {
        if (
          keptFiles.has(path.resolve(filePath)) ||
          (nextRoutes && isNextRouteFile(filePath))
        ) {
          const key = path.relative(parentFolder, filePath);
          if (key in tree) tree[key] = key;
        }
      }
      // entryPoints that don't import anything might be unused??
      // @todo let user ignore some of these
      const unusedFiles = entryPoints.filter(
        filePath =>
          !isTestFile(filePath) &&
          !filePath.endsWith(".snap") &&
          !filePath.endsWith(".d.ts") &&
          !graph[filePath].length
      );

      logger.log(chalk.bold.blue(getRootFolder(parentFolder)));
      printTree(Object.values(tree));
      if (unusedFiles.length > 0) {
        logger.warn(
          `Found ${unusedFiles.length} unused files:` +
            "\n" +
            unusedFiles.join("\n")
        );
      }

      rootOptions.push({
        parentFolder,
        tree,
      });

      return rootOptions;
    },
    []
  );
}
