'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, keepUrlParams, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SamsAnalysisHeader() {
	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.SAMS_LIST));
	};

	return (
		<Toolbar>
			<CloseButton onClick={handleGoBack} type="close" />
			<Tag label="Análise" variant="muted" />
		</Toolbar>
	);
}
