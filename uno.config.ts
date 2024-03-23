import path from "path";
import { createUnoConfig } from "@game/unocss-config";

export default createUnoConfig({
  themePath: path.join(process.cwd(), "src/styles/theme.css"),
  additional: [],
});
