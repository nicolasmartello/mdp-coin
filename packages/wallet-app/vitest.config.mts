import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["test/shims.ts", "test/setup.ts"],
    testTimeout: 15_000,
    // Uniswap SDKs (pulled in by @scaffold-ui/hooks) ship ESM with extensionless imports;
    // let Vite resolve that chain instead of Node
    server: { deps: { inline: [/@uniswap\//, /@scaffold-ui\//] } },
    coverage: {
      provider: "v8",
      include: ["components/ui/**", "components/wallet/**", "hooks/mdp/**", "utils/ui/**", "utils/mdp/**"],
      exclude: ["**/*.test.*"],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
