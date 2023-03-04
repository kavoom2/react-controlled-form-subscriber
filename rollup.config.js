import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const pkg = JSON.parse(readFileSync("package.json", { encoding: "utf8" }));
const extensions = ["js", "jsx", "ts", "tsx", "mjs"];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: [/node_modules/],
    input: "./src/index.ts",
    output: [
      {
        dir: "./dist",
        format: "cjs",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      {
        file: pkg.module,
        format: "es",
      },
      {
        name: pkg.name,
        file: pkg.browser,
        format: "umd",
      },
    ],
    plugins: [
      nodeResolve({ extensions }),
      commonjs({ include: "node_modules/**" }),
      peerDepsExternal(),
      typescript({ tsconfig: "./tsconfig.json" }),
      babel({
        babelHelpers: 'bundled',
        exclude: "node_modules/**",
        extensions,
        include: ["src/**/*"],
      }),
    ],
  },
];

export default config;
