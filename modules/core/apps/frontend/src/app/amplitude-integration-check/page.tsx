'use client';

import { useAnalyticsContext } from '@tmlmobilidade/ui';
import { useState } from 'react';

export default function AnalyticsIntegrationCheck() {
	const { actions, flags } = useAnalyticsContext();
	const [sent, setSent] = useState(false);

	return (
		<main>
			<h1>Amplitude integration check</h1>
			<p>Provider: {flags.ready ? 'ready' : 'waiting'}</p>
			<p>Event: {sent ? 'queued' : 'not sent'}</p>
			<p>Error: {flags.error?.message ?? 'none'}</p>
			<button
				disabled={!flags.ready || sent}
				onClick={() => {
					actions.track('GO UI Runtime Configuration Test', { integration_test: true, module: 'core' });
					setSent(true);
				}}
				type="button"
			>
				Send test event
			</button>
		</main>
	);
}
