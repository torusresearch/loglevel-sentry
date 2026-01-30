import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/node.test.ts"],
    reporters: "verbose",
    coverage: {
      reporter: ["text"],
      provider: "istanbul",
      include: ["src/**/*.ts"],
    },
  },
});
