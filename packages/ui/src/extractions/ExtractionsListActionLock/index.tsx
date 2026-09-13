'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, LockButton, useHandleAction } from '@tmlmobilidade/ui';

/* * */

interface ExtractionsListActionLockProps {
	extractionItem: Extraction
}

/* * */

/* * */

export function ExtractionsListActionLock({ extractionItem }: ExtractionsListActionLockProps) {
	//

	//
	// A. Handle actions

	const { action: handleLock } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[]>({ url: API_ROUTES.core.PLATFORM_EXTRACTIONS }),
		onSuccess: () => {},
	});

	//
	// B. Render components

	return (
		<LockButton isLocked={extractionItem?.is_locked} onClick={handleLock} />
	);
}
