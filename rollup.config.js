import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import path from "path";
import bundleSize from "rollup-plugin-bundle-size";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

/**
 * @see https://rollupjs.org/introduction/#quick-start - Quick start의 rollup-starter-lib 참조
 * @see https://javascript.plainenglish.io/tutorial-create-your-own-component-library-with-react-and-rollup-b8978d885297
 * @see https://dev.to/nasheomirro/comment/239nj Handling major issues
 */
const packageJSON = JSON.parse(
  readFileSync("package.json", { encoding: "utf8" })
);

const root = process.platform === "win32" ? path.resolve("/") : "/";
const external = (id) => !id.startsWith(".") && !id.startsWith(root);

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: "./src/index.ts",
    external,
    output: [
      {
        file: `dist/index.cjs.js`,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: `dist/index.js`,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: ["@babel/preset-react"],
      }),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
      }),
      terser(),
      ...(process.env.bundleAnalyzer === "TRUE" ? [bundleSize()] : []),
    ],
  },
  /**
   * @see https://stackoverflow.com/a/75021330/14980971 dts plugin issue
   */
  {
    input: "./dist/types/index.d.ts",
    external,
    output: [{ file: `dist/index.d.ts`, format: "esm" }],
    plugins: [dts.default()],
  },
];

export default config;
