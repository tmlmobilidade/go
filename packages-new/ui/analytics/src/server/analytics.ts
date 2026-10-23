/* * */

/** Serves the public analytics configuration from the running application's environment. */
export function getAnalyticsConfiguration() {
	const apiKey = process.env.AMPLITUDE_API_KEY ?? process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
	const experimentDeploymentKey = process.env.AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY ?? process.env.NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY;
	const serverZone = process.env.AMPLITUDE_SERVER_ZONE ?? process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE;

	return Response.json({
		apiKey,
		experimentDeploymentKey,
		options: {
			serverZone: serverZone === 'US' ? 'US' : 'EU',
		},
	}, { headers: { 'Cache-Control': 'no-store' } });
}
