import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    expect: {
      requireAssertions: true
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'client',
          include: ['src/**/*.svelte.{test,spec}.js', 'src/**/*.browser.{test,spec}.js'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }]
          }
        }
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.js'],
          exclude: ['src/**/*.svelte.{test,spec}.js', 'src/**/*.browser.{test,spec}.js']
        }
      }
    ]
  }
});
