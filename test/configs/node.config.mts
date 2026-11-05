import { defineConfig } from "vite-plus/test/config";

export default defineConfig({
  test: {
    include: ["test/node.test.ts"],
    environment: "node",
    reporters: "verbose",
    coverage: {
      reporter: ["text"],
      provider: "istanbul",
      include: ["src/**/*.ts"],
    },
  },
});
