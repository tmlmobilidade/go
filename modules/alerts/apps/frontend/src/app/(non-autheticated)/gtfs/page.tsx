/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';

/* * */

const GTFS_BASE_ROUTE = `${PAGE_ROUTES.alerts.BASE}/gtfs`;

/* * */

interface GtfsEntity {
	alert?: {
		active_period?: Array<{
			end?: number
			start?: number
		}>
		description_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		header_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
	}
	id?: number | string
}

interface GtfsFeed {
	entity?: GtfsEntity[]
}

interface GtfsApiResponse {
	data?: GtfsFeed | null
}

/* * */

function getTranslationText(translations: Array<{ language?: string, text?: string }> | undefined) {
	if (!translations?.length) return null;
	const portuguese = translations.find(item => item.language === 'pt' && item.text);
	if (portuguese?.text) return portuguese.text;
	return translations.find(item => item.text)?.text ?? null;
}

function formatUnixDate(unixValue?: number) {
	if (!unixValue) return null;
	const date = new Date(unixValue * 1_000);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat('pt-PT', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
}

async function fetchGtfsFeed() {
	const response = await fetch(API_ROUTES.alerts.GTFS_CARRIS_METROPOLITANA, {
		next: { revalidate: 30 },
	});

	if (!response.ok) {
		return {
			feed: null,
			status: response.status,
		};
	}

	const payload = await response.json() as GtfsApiResponse;

	return {
		feed: payload.data ?? null,
		status: response.status,
	};
}

/* * */

export default async function Page() {
	const { feed: gtfsFeed, status: gtfsFeedStatus } = await fetchGtfsFeed();

	if (!gtfsFeed) {
		return (
			<main className="mx-auto w-full max-w-4xl p-6">
				<h1 className="text-2xl font-semibold">Alertas Públicos</h1>
				<p className="mt-2 text-sm">Não foi possível carregar o feed GTFS (HTTP {gtfsFeedStatus}).</p>
			</main>
		);
	}

	const entities = gtfsFeed.entity ?? [];

	return (
		<main className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold">Alertas Públicos</h1>
				<p className="text-sm">{entities.length} alerta(s) disponível(is).</p>
			</header>

			{!entities.length && <p className="text-sm">Não existem alertas disponíveis neste momento.</p>}

			<ul className="space-y-3">
				{entities.map((entity) => {
					const entityId = String(entity.id ?? '').trim();
					if (!entityId) return null;

					const title = getTranslationText(entity.alert?.header_text?.translation) ?? `Alerta ${entityId}`;
					const description = getTranslationText(entity.alert?.description_text?.translation);
					const startDate = formatUnixDate(entity.alert?.active_period?.[0]?.start);

					return (
						<li key={entityId} className="rounded border p-4">
							<a className="space-y-2 underline" href={`${GTFS_BASE_ROUTE}/${entityId}`}>
								<p className="text-lg font-semibold">{title}</p>
								<p className="text-xs">ID: {entityId}</p>
								{startDate && <p className="text-sm"><strong>Início:</strong> {startDate}</p>}
								{description && <p className="line-clamp-2 text-sm">{description}</p>}
							</a>
						</li>
					);
				})}
			</ul>
		</main>
	);
}
