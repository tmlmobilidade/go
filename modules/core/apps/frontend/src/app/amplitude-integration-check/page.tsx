'use client';

import { useAnalyticsContext } from '@tmlmobilidade/ui';
import { useState } from 'react';

export default function AnalyticsIntegrationCheck() {
	const { actions, flags } = useAnalyticsContext();
	const [eventStatus, setEventStatus] = useState<'accepted by Amplitude' | 'failed' | 'not sent' | 'sending'>('not sent');

	return (
		<main>
			<h1>Amplitude integration check</h1>
			<p>Provider: {flags.ready ? 'ready' : 'waiting'}</p>
			<p role="status">Event: {eventStatus}</p>
			<p>Error: {flags.error?.message ?? 'none'}</p>
			<button
				disabled={!flags.ready || eventStatus === 'sending' || eventStatus === 'accepted by Amplitude'}
				type="button"
				onClick={async () => {
					setEventStatus('sending');
					const accepted = await actions.track('GO UI Runtime Configuration Test', { integration_test: true, module: 'core' });
					setEventStatus(accepted ? 'accepted by Amplitude' : 'failed');
				}}
			>
				Send test event
			</button>
		</main>
	);
}
