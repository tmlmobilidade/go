'use client';

import { getSafeRedirectToUrl } from '@/utils/get-safe-redirect-to-url';
import { LoadingOverlay } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

export function AuthenticatedRedirect() {
	//

	//
	// A. Setup variables

	useEffect(() => {
		const redirectToValue = new URL(window.location.href).searchParams.get('redirect');
		const safeRedirectToUrl = getSafeRedirectToUrl(redirectToValue);
		window.location.replace(safeRedirectToUrl);
	}, []);

	//
	// B. Render components

	return <LoadingOverlay size="lg" fullscreen />;
}
