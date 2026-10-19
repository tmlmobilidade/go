/* * */

/**
 * External Carris Metropolitana metrics endpoints consumed by the videowall screens.
 * These routes are not part of the GO platform, so they have no generated `API_ROUTES` key.
 */
export const VIDEOWALL_METRICS_ROUTES = Object.freeze({
	DELAYS: 'https://api.carrismetropolitana.pt/v2/metrics/videowall/delays',
	SLA: 'https://api.carrismetropolitana.pt/v2/metrics/videowall/sla',
	VALIDATIONS: 'https://api.carrismetropolitana.pt/v2/metrics/videowall/validations',
	VKM: 'https://api.carrismetropolitana.pt/v2/metrics/videowall/vkm',
});
