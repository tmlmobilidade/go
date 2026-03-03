/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';

/* * */

const GTFS_LIST_ROUTE = `${PAGE_ROUTES.alerts.BASE}/gtfs`;

/* * */

interface GtfsEntity {
	[key: string]: unknown
	alert?: {
		active_period?: Array<{
			end?: number
			start?: number
		}>
		cause?: string
		description_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		effect?: string
		header_text?: {
			translation?: Array<{
				language?: string
				text?: string
			}>
		}
		informed_entity?: Array<{
			route_id?: string
			stop_id?: string
			trip?: {
				route_id?: string
			}
		}>
	}
	id?: number | string
}

interface GtfsFeed {
	entity?: GtfsEntity[]
	header?: Record<string, unknown>
}

interface GtfsApiResponse {
	data?: GtfsFeed | null
}

interface FetchGtfsFeedResult {
	feed: GtfsFeed | null
	status: number
}

/* * */

function getAlertEntity(feed: GtfsFeed | null | undefined, alertId: string) {
	if (!feed?.entity) return undefined;
	const normalizedAlertId = alertId.trim();
	return feed.entity.find(entity => String(entity.id ?? '').trim() === normalizedAlertId);
}

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

function normalizeUpperText(value?: string) {
	if (!value) return null;
	return value.replaceAll('_', ' ');
}

function getEntityRoutes(entity: GtfsEntity | undefined) {
	if (!entity?.alert?.informed_entity?.length) return [];
	const routes = entity.alert.informed_entity
		.map(item => item.route_id ?? item.trip?.route_id)
		.filter(Boolean) as string[];
	return Array.from(new Set(routes));
}

async function fetchGtfsFeed(): Promise<FetchGtfsFeedResult> {
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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { feed: gtfsFeed, status: gtfsFeedStatus } = await fetchGtfsFeed();

	if (!gtfsFeed) {
		return (
			<main className="mx-auto w-full max-w-4xl p-6">
				<h1 className="text-xl font-semibold">GTFS do alerta</h1>
				<p className="mt-2 text-sm">Não foi possível carregar o feed GTFS (HTTP {gtfsFeedStatus}).</p>
				<a className="mt-4 inline-block underline" href={GTFS_LIST_ROUTE}>
					Voltar para lista de alertas
				</a>
				<a className="mt-4 inline-block underline" href={API_ROUTES.alerts.GTFS_CARRIS_METROPOLITANA} rel="noreferrer" target="_blank">
					Abrir feed GTFS completo
				</a>
			</main>
		);
	}

	const alertEntity = getAlertEntity(gtfsFeed, id);

	if (!alertEntity) {
		return (
			<main className="mx-auto w-full max-w-4xl p-6">
				<h1 className="text-xl font-semibold">GTFS do alerta</h1>
				<p className="mt-2 text-sm">Alerta {id} não encontrado no feed GTFS atual. Geralmente isso acontece quando o alerta ainda não está publicado, ainda não iniciou publicação, ou já terminou.</p>
				<a className="mt-4 inline-block underline" href={GTFS_LIST_ROUTE}>
					Voltar para lista de alertas
				</a>
				<a className="mt-4 inline-block underline" href={API_ROUTES.alerts.GTFS_CARRIS_METROPOLITANA} rel="noreferrer" target="_blank">
					Abrir feed GTFS completo
				</a>
			</main>
		);
	}

	const alertTitle = getTranslationText(alertEntity.alert?.header_text?.translation) ?? `Alerta ${id}`;
	const alertDescription = getTranslationText(alertEntity.alert?.description_text?.translation);
	const alertCause = normalizeUpperText(alertEntity.alert?.cause);
	const alertEffect = normalizeUpperText(alertEntity.alert?.effect);
	const alertStartDate = formatUnixDate(alertEntity.alert?.active_period?.[0]?.start);
	const alertEndDate = formatUnixDate(alertEntity.alert?.active_period?.[0]?.end);
	const alertRoutes = getEntityRoutes(alertEntity);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<header className="space-y-3">
				<a className="inline-block underline" href={GTFS_LIST_ROUTE}>
					Ir para lista de alertas
				</a>
				<p className="text-xs font-semibold uppercase tracking-wide">Alerta Público</p>
				<h1 className="text-2xl font-semibold">{alertTitle}</h1>
				<p className="text-sm">ID: {id}</p>
			</header>

			<section className="rounded border p-4">
				<div className="grid gap-2 text-sm">
					{alertCause && <p><strong>Causa:</strong> {alertCause}</p>}
					{alertEffect && <p><strong>Efeito:</strong> {alertEffect}</p>}
				</div>

				<div className="mt-4 space-y-2 text-sm">
					{alertStartDate && <p><strong>Início:</strong> {alertStartDate}</p>}
					{alertEndDate && <p><strong>Fim:</strong> {alertEndDate}</p>}
					{!!alertRoutes.length && <p><strong>Linhas:</strong> {alertRoutes.join(', ')}</p>}
				</div>

				{alertDescription && <p className="mt-4 whitespace-pre-line text-sm">{alertDescription}</p>}
			</section>
		</main>
	);
}
