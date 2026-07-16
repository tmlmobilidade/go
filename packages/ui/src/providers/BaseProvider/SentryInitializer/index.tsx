'use client';

import { initSentry } from '@tmlmobilidade/logger-frontend';
import { useEffect } from 'react';

/* * */

interface SentryInitializerProps {
	app: string
	module: string
}

/* * */

export function SentryInitializer({ app, module }: SentryInitializerProps) {
	//

	//
	// A. Initialize Sentry

	useEffect(() => {
		initSentry({ app, module });
	}, [app, module]);

	//
	// B. Render component

	return null;

	//
}
