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
