import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('empty search shows recents and matching lines can be expanded with the keyboard', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	const lines = Array.from({ length: 6 }, (_, index) => ({
		_id: `line-${index}`,
		agency_id: 'LA77N',
		color: '#e0001a',
		long_name: `Linha Metropolitana ${index + 1}`,
		short_name: String(index + 1),
		text_color: '#ffffff',
	}));
	await page.route('**/v1/**', async route => await route.fulfill({ json: response(route.request().url().includes('/network/lines') ? lines : []) }));
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	const search = page.getByRole('dialog', { name: 'Pesquisa' });
	await expect(search.getByRole('region', { name: 'Pesquisas recentes' })).toContainText('Ainda não há pesquisas recentes.');
	await expect(search.getByRole('region', { exact: true, name: 'Linhas' })).toHaveCount(0);
	await search.getByRole('textbox').fill('Metropolitana');
	const matches = search.getByRole('region', { exact: true, name: 'Linhas' });
	await expect(matches.locator('li')).toHaveCount(5);
	const more = matches.getByRole('button', { name: 'Ver mais linhas' });
	await more.focus();
	await page.keyboard.press('Enter');
	await expect(matches.locator('li')).toHaveCount(6);
	await expect(more).toHaveCount(0);
	await expect(matches.locator('li').nth(5).getByRole('button')).toBeFocused();
	await search.getByRole('button', { name: 'Limpar pesquisa' }).click();
	await expect(search.getByRole('region', { name: 'Pesquisas recentes' })).toBeVisible();
	await expect(matches).toHaveCount(0);
});
