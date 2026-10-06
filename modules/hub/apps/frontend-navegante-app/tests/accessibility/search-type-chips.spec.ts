import { expect, test } from '@playwright/test';

/* * */

test.use({ viewport: { height: 844, width: 390 } });

test('search chips filter matching entity types and can be cleared', async ({ page }) => {
	const response = (data: unknown) => ({ data, error: null, timestamp: Date.now() });
	const lines = Array.from({ length: 12 }, (_, index) => ({
		_id: `line-${index}`,
		agency_id: 'IA9T6',
		color: '#f5c900',
		long_name: `Linha Oriente ${index}`,
		short_name: String(index + 1),
		text_color: '#000000',
	}));
	const stops = Array.from({ length: 12 }, (_, index) => ({
		_id: `stop-${index}`,
		agency_ids: index === 0 ? ['LA77N', 'BNA17', 'LTP61'] : [],
		municipality_name: 'Lisboa',
		name: `Paragem Oriente ${index}`,
		short_name: 'Oriente',
	}));
	const alerts = Array.from({ length: 12 }, (_, index) => ({
		_id: `alert-${index}`,
		agency_id: 'IA9T6',
		description: 'Aviso na zona',
		reference_type: 'agency',
		references: [],
		title: `Alerta Oriente ${index}`,
	}));
	const places = Array.from({ length: 10 }, (_, index) => ({ lat: 38.767, lon: -9.099, name: `Local Oriente ${index}`, type: 'PLACE' }));
	await page.route('**/v1/**', async (route) => {
		const url = route.request().url();
		const data = url.includes('/network/lines')
			? lines
			: url.includes('/network/stops')
				? stops
				: url.endsWith('/v1/alerts')
					? alerts
					: url.includes('/motis/geocode')
						? places.slice(0, Number(new URL(url).searchParams.get('numResults')))
						: [];
		await route.fulfill({ json: response(data) });
	});
	await page.goto('/hub/navegante-app');
	await page.getByRole('button', { exact: true, name: 'Pesquisar' }).click();
	const search = page.getByRole('dialog', { name: 'Pesquisa' });
	const filters = search.getByRole('group', { name: 'Filtrar resultados por tipo' });
	await expect(filters).toHaveCount(0);
	await search.getByRole('textbox').fill('Oriente');
	await expect(search.getByRole('region', { name: 'Locais' })).toBeVisible();
	await expect(filters.getByRole('button')).toHaveText(['Paragens', 'Locais', 'Linhas', 'Alertas']);
	await expect(search.getByRole('region').locator('h2')).toHaveText(['Paragens', 'Locais', 'Linhas', 'Alertas']);
	for (const [category, showMoreLabel] of [['Paragens', 'Ver mais paragens'], ['Locais', 'Ver mais locais'], ['Linhas', 'Ver mais linhas'], ['Alertas', 'Ver mais alertas']]) {
		const group = search.getByRole('region', { name: category });
		await expect(group.locator('li')).toHaveCount(5);
		await expect(group.getByRole('button', { name: showMoreLabel })).toBeVisible();
	}
	await page.screenshot({ path: '/private/tmp/navegante-search-type-chips.png' });
	await filters.getByRole('button', { name: 'Paragens' }).click();
	await expect(filters.getByRole('button', { name: 'Paragens' })).toHaveAttribute('aria-pressed', 'true');
	await expect(search.getByRole('region')).toHaveCount(1);
	const stopGroup = search.getByRole('region', { name: 'Paragens' });
	await expect(stopGroup.locator('li')).toHaveCount(5);
	const firstStop = stopGroup.locator('li').first();
	await expect(firstStop.getByRole('img')).toHaveCount(2);
	await expect(firstStop.getByRole('img', { name: 'Carris Metropolitana' })).toBeVisible();
	await expect(firstStop.getByRole('img', { name: 'Transtejo Soflusa' })).toBeVisible();
	await stopGroup.getByRole('button', { name: 'Ver mais paragens' }).click();
	await expect(stopGroup.locator('li')).toHaveCount(12);
	await expect(stopGroup.getByRole('button', { name: 'Ver mais paragens' })).toHaveCount(0);
	await filters.getByRole('button', { name: 'Linhas' }).click();
	const lineGroup = search.getByRole('region', { name: 'Linhas' });
	await expect(lineGroup.locator('li')).toHaveCount(5);
	await lineGroup.getByRole('button', { name: 'Ver mais linhas' }).click();
	await expect(lineGroup.locator('li')).toHaveCount(12);
	await expect(search.getByRole('region')).toHaveCount(1);
	await filters.getByRole('button', { name: 'Alertas' }).click();
	const alertGroup = search.getByRole('region', { name: 'Alertas' });
	await expect(alertGroup.locator('li')).toHaveCount(5);
	await alertGroup.getByRole('button', { name: 'Ver mais alertas' }).click();
	await expect(alertGroup.locator('li')).toHaveCount(12);
	await expect(alertGroup.getByRole('img', { name: 'Carris' })).toHaveCount(12);
	await filters.getByRole('button', { name: 'Locais' }).click();
	const placeGroup = search.getByRole('region', { name: 'Locais' });
	await expect(placeGroup.locator('li')).toHaveCount(5);
	await placeGroup.getByRole('button', { name: 'Ver mais locais' }).click();
	await expect(placeGroup.locator('li')).toHaveCount(10);
	await filters.getByRole('button', { name: 'Locais' }).click();
	await expect(search.getByRole('region')).toHaveCount(4);
	await filters.getByRole('button', { name: 'Alertas' }).click();
	await search.getByRole('button', { name: 'Limpar pesquisa' }).click();
	await expect(search.getByRole('textbox')).toHaveValue('');
	await expect(filters).toHaveCount(0);
	await expect(search.getByRole('region', { name: 'Carris' })).toBeVisible();
	await search.getByRole('textbox').fill('Paragem Oriente 0');
	await expect(search.getByRole('region', { name: 'Paragens' }).locator('li')).toHaveCount(1);
	await expect(search.getByRole('region', { name: 'Paragens' }).getByRole('button', { name: 'Ver mais paragens' })).toHaveCount(0);
	await search.getByRole('textbox').fill('Oriente');
	await expect(search.getByRole('region')).toHaveCount(4);
	await search.getByRole('button', { name: /Alerta Oriente 0/ }).click();
	const alertDetail = page.getByRole('dialog', { name: 'Alerta Oriente 0' });
	await expect(alertDetail.getByRole('img', { name: 'Carris' })).toBeVisible();
});
