import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import * as path from "path";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

//Below is supposed to help with image importing
resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  }
};