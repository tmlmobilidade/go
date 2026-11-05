'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, ReloadButton, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

/* * */

interface ExtractionsListActionReloadProps {
	extractionItem: Extraction
}

/* * */

export function ExtractionsListActionReload({ extractionItem }: ExtractionsListActionReloadProps) {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

	//
	// B. Handle actions

	const { action: handleReload, isLoading } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[]>({ method: 'PUT', url: API_ROUTES.core.EXTRACTIONS_RELOAD(extractionItem._id) }),
		onSuccess: response => mutate(response),
	});

	//
	// C. Render components

	return (
		<ReloadButton
			isDisabled={extractionItem?.is_locked ?? true}
			isLoading={isLoading}
			onReload={handleReload}
		/>
	);
}
