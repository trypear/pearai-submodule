const esbuild = require("esbuild");
const path = require("path");

const flags = process.argv.slice(2);

const esbuildConfig = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  external: ["vscode", "esbuild", "./xhr-sync-worker.js"],
  format: "cjs",
  platform: "node",
  sourcemap: flags.includes("--sourcemap"),
  loader: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ".node": "file",
  },

  // To allow import.meta.path for transformers.js
  // https://github.com/evanw/esbuild/issues/1492#issuecomment-893144483
  inject: ["./scripts/importMetaUrl.js"],
  define: { "import.meta.url": "importMetaUrl" },
  supported: { "dynamic-import": false },

  // Add a custom resolver for config.ts
  plugins: [
    {
      name: "resolve-config",
      setup(build) {
        build.onResolve({ filter: /config\.ts$/ }, (args) => {
          const configPath = path.resolve(
            process.env.USERPROFILE,
            ".pearai",
            "config.ts",
          );

          if (fs.existsSync(configPath)) {
            return { path: configPath };
          } else {
            console.error(`Config file not found at: ${configPath}`);

            return {
              errors: [{ text: `Config file not found at: ${configPath}` }],
            };
          }
        });
      },
    },
  ],
};

(async () => {
  try {
    if (flags.includes("--watch")) {
      const ctx = await esbuild.context(esbuildConfig);
      await ctx.watch();
    } else {
      const result = await esbuild.build(esbuildConfig);
      console.log("Build completed successfully", result);
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
})();
