'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, LockButton, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

/* * */

interface ExtractionsListActionLockProps {
	extractionItem: Extraction
}

/* * */

/* * */

export function ExtractionsListActionLock({ extractionItem }: ExtractionsListActionLockProps) {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

	//
	// B. Handle actions

	const { action: handleLock } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[]>({ url: API_ROUTES.core.EXTRACTIONS_LOCK(extractionItem._id) }),
		onSuccess: response => mutate(response),
	});

	//
	// C. Render components

	return (
		<LockButton isLocked={extractionItem?.is_locked} onClick={handleLock} />
	);
}
