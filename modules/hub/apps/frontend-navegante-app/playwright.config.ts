import { defineConfig, devices } from '@playwright/test';

/* * */

export default defineConfig({
	fullyParallel: false,
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	reporter: process.env.CI ? 'github' : 'list',
	testDir: './tests/accessibility',
	use: {
		baseURL: 'http://localhost:51101',
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'npm run dev',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		url: 'http://localhost:51101/hub/navegante-app',
	},
});
