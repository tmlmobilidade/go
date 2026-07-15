'use client';

import { initSentry } from '@tmlmobilidade/logger-frontend';
import { useEffect } from 'react';

/* * */

interface SentryInitializerProps {
	module: string
}

/* * */

export function SentryInitializer({ module }: SentryInitializerProps) {
	//

	//
	// A. Initialize Sentry

	useEffect(() => {
		initSentry(module);
	}, [module]);

	//
	// B. Render component

	return null;

	//
}
