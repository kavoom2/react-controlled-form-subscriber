import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import bundleSize from "rollup-plugin-bundle-size";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const enableBundleAnalyzer = process.env.bundleAnalyzer === "TRUE";

/**
 * @see https://rollupjs.org/introduction/#quick-start - Quick start의 rollup-starter-lib 참조
 * @see https://javascript.plainenglish.io/tutorial-create-your-own-component-library-with-react-and-rollup-b8978d885297
 * @see https://dev.to/nasheomirro/comment/239nj Handling major issues
 */
const packageJSON = JSON.parse(
  readFileSync("package.json", { encoding: "utf8" })
);

/**
 * @type {import('rollup').RollupOptions['plugins']}
 */
const plugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json", sourceMap: true }),
  terser(),
];

if (enableBundleAnalyzer) plugins.push(bundleSize());

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: "src/index.ts",
    external: [/node_modules/],
    output: [
      {
        file: packageJSON.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJSON.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins,
  },
  /**
   * @see https://stackoverflow.com/a/75021330/14980971 dts plugin issue
   */
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts.default()],
  },
];

export default config;
