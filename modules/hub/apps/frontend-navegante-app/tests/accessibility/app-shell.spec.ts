import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/* * */

const APP_SHELL_KNOWN_VIOLATIONS = new Map([
	['color-contrast', 'VISUAL-02'],
	['region', 'STRUCTURE-01'],
]);

const SEARCH_SHEET_KNOWN_VIOLATIONS = new Map([
	['color-contrast', 'VISUAL-02'],
]);

/* * */

test('app shell exposes its language and no untracked axe violations', async ({ page }) => {
	await page.goto('/hub/navegante-app');
	await expect(page.locator('html')).toHaveAttribute('lang', 'pt');

	const scan = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
		.analyze();

	expectNoUnexpectedViolations(scan.violations, APP_SHELL_KNOWN_VIOLATIONS);
});

test('modal search sheet manages focus and hides the app from assistive technology', async ({ page }) => {
	await page.goto('/hub/navegante-app');
	const searchTrigger = page.getByRole('button', { name: 'Pesquisar' });
	await searchTrigger.click();

	const dialog = page.getByRole('dialog', { name: 'Pesquisa' });
	const searchInput = page.getByPlaceholder('Pesquisar linhas, paragens, alertas e locais');
	await expect(dialog).toBeVisible();
	await expect(searchInput).toBeVisible();
	await expect(searchInput).toBeFocused();
	await expect(page.locator('[data-overlay-container]')).toHaveAttribute('aria-hidden', 'true');

	await page.keyboard.press('Shift+Tab');
	const closeButton = dialog.getByRole('button', { name: 'Fechar' });
	await expect(closeButton).toBeFocused();

	const scan = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
		.analyze();

	expectNoUnexpectedViolations(scan.violations, SEARCH_SHEET_KNOWN_VIOLATIONS);

	await closeButton.click();
	await expect(dialog).toBeHidden();
	await expect(searchTrigger).toBeFocused();
	await expect(page.locator('[data-overlay-container]')).not.toHaveAttribute('aria-hidden');

	await searchTrigger.click();
	await expect(searchInput).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(searchTrigger).toBeFocused();
});

/* * */

function expectNoUnexpectedViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'], knownViolations: Map<string, string>) {
	const unexpectedViolations = violations.filter(violation => !knownViolations.has(violation.id));
	const resolvedBaselineEntries = [...knownViolations.entries()]
		.filter(([violationId]) => !violations.some(violation => violation.id === violationId));

	expect(unexpectedViolations, formatViolations(unexpectedViolations)).toEqual([]);
	expect(resolvedBaselineEntries, 'Remove resolved Axe baseline entries.').toEqual([]);
}

/* * */

function formatViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
	return violations
		.map(violation => `${violation.id}: ${violation.help}\n${violation.nodes.map(node => `  ${node.target.join(' ')}`).join('\n')}`)
		.join('\n\n');
}
