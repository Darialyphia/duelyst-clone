import path from "path";
import { createUnoConfig } from "@game/unocss-config";
import fs from "fs";

export default createUnoConfig({
  cssTheme: fs.readFileSync(
    path.join(process.cwd(), "packages/client/src/styles/theme.css"),
    {
      encoding: "utf-8",
    }
  ),
  additional: [],
});
