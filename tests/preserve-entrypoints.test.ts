import fs from "fs-extra";
import path from "path";
import { run } from "../src/index";

const root = path.join(__dirname, "tmp-preserve-entrypoints");

afterEach(() => fs.removeSync(root));

it("keeps a public feature file at its route-imported path", async () => {
  const feature = path.join(root, "src", "features", "data-onboarding");
  const route = path.join(root, "src", "app", "onboarding", "page.tsx");
  const routeSource =
    'import { snapshot } from "@/features/data-onboarding/snapshot";\nexport default snapshot;\n';
  fs.outputFileSync(
    path.join(feature, "index.tsx"),
    'import { snapshot } from "./snapshot";\nexport default snapshot;\n'
  );
  fs.outputFileSync(
    path.join(feature, "snapshot.tsx"),
    'import { request } from "./request";\nimport styles from "./onboarding.module.css";\nexport const snapshot = [request, styles];\n'
  );
  fs.outputFileSync(
    path.join(feature, "request.ts"),
    'export const request = "ready";\n'
  );
  fs.outputFileSync(
    path.join(feature, "onboarding.module.css"),
    ".snapshot { color: red; }\n"
  );
  fs.outputFileSync(route, routeSource);

  await run(["--write", "--keep", path.join(feature, "snapshot.tsx"), feature]);

  expect(fs.readFileSync(route, "utf8")).toBe(routeSource);
  expect(fs.existsSync(path.join(feature, "snapshot.tsx"))).toBe(true);
  expect(fs.readFileSync(path.join(feature, "index.tsx"), "utf8")).toContain(
    'from "./snapshot"'
  );
  expect(fs.readFileSync(path.join(feature, "snapshot.tsx"), "utf8")).toContain(
    'from "./index/snapshot/request"'
  );
  expect(fs.readFileSync(path.join(feature, "snapshot.tsx"), "utf8")).toContain(
    'from "./index/snapshot/onboarding.module.css"'
  );
});

it("preserves App and Pages Router paths during a broad Next.js rewrite", async () => {
  const project = path.join(root, "next-project");
  const appPage = path.join(project, "src/app/(console)/items/[id]/page.js");
  const appRoute = path.join(project, "src/app/api/items/route.ts");
  const pagesRoute = path.join(project, "src/pages/products/[sku].tsx");
  const feature = path.join(project, "src/features/report");
  const featureEntry = path.join(feature, "index.js");
  fs.outputJsonSync(path.join(project, "package.json"), {
    dependencies: { next: "15.0.0" },
  });
  fs.outputFileSync(appPage, 'module.exports = require("./view");\n');
  fs.outputFileSync(
    path.join(path.dirname(appPage), "view.js"),
    'module.exports = "item";\n'
  );
  fs.outputFileSync(appRoute, 'export const GET = () => "ok";\n');
  fs.outputFileSync(pagesRoute, 'export default () => "product";\n');
  fs.outputFileSync(featureEntry, 'module.exports = require("./value");\n');
  fs.outputFileSync(path.join(feature, "value.js"), "module.exports = 1;\n");

  await run([
    "--next-routes",
    "--write",
    "--keep",
    featureEntry,
    path.join(project, "src"),
  ]);

  expect(jest.requireActual(appPage)).toBe("item");
  expect(fs.existsSync(appRoute)).toBe(true);
  expect(fs.existsSync(pagesRoute)).toBe(true);
  expect(jest.requireActual(featureEntry)).toBe(1);
  expect(fs.existsSync(path.join(feature, "value.js"))).toBe(false);
});

it("keeps project-root routes without an explicit keep pattern", async () => {
  const project = path.join(root, "root-routes");
  const appPage = path.join(project, "app/dashboard/page.js");
  const pagesRoute = path.join(project, "pages/profile.js");
  const feature = path.join(project, "features/profile");
  fs.outputJsonSync(path.join(project, "package.json"), {
    dependencies: { next: "15.0.0" },
  });
  fs.outputFileSync(appPage, 'module.exports = require("./view");\n');
  fs.outputFileSync(
    path.join(path.dirname(appPage), "view.js"),
    'module.exports = "dashboard";\n'
  );
  fs.outputFileSync(pagesRoute, 'module.exports = "profile";\n');
  fs.outputFileSync(
    path.join(feature, "index.js"),
    'module.exports = require("./value");\n'
  );
  fs.outputFileSync(path.join(feature, "value.js"), "module.exports = 1;\n");

  await run(["--next-routes", "--write", project]);

  expect(jest.requireActual(appPage)).toBe("dashboard");
  expect(jest.requireActual(pagesRoute)).toBe("profile");
  expect(fs.existsSync(path.join(feature, "value.js"))).toBe(false);
});
