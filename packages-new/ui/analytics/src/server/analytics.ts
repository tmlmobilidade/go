/* * */

/** Serves the public analytics configuration from the running application's environment. */
export function getAnalyticsConfiguration() {
	const apiKey = process.env.GO_AMPLITUDE_API_KEY ?? process.env.AMPLITUDE_API_KEY ?? process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
	const serverZone = process.env.AMPLITUDE_SERVER_ZONE ?? process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE;

	return Response.json({
		apiKey,
		options: {
			serverZone: serverZone === 'US' ? 'US' : 'EU',
		},
	}, { headers: { 'Cache-Control': 'no-store' } });
}
