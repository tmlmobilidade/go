'use client';

import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { DeleteButton } from '@tmlmobilidade/ui';

/* * */

interface ExtractionsListActionDeleteProps {
	extractionItem: Extraction
}

/* * */

export function ExtractionsListActionDelete({ extractionItem }: ExtractionsListActionDeleteProps) {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<DeleteButton isDisabled={extractionItem?.is_locked ?? true} onDelete={() => {}} />
	);
}
