'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { DeleteButton, fetchApiData, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

/* * */

interface ExtractionsListActionDeleteProps {
	extractionItem: Extraction
}

/* * */

export function ExtractionsListActionDelete({ extractionItem }: ExtractionsListActionDeleteProps) {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

	//
	// B. Handle actions

	const { action: handleDelete } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[]>({ method: 'DELETE', url: API_ROUTES.core.EXTRACTIONS_DELETE(extractionItem._id) }),
		onSuccess: response => mutate(response),
	});

	//
	// C. Render components

	return (
		<DeleteButton isDisabled={extractionItem?.is_locked ?? true} onDelete={handleDelete} />
	);
}
