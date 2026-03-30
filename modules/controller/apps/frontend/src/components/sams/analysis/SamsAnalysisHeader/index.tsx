'use client';

import { useSamsListContext } from '@/contexts/SamsList.context';
import { Label, SearchInput, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function SamsAnalysisHeader() {
	//
	// A. Render components

	return (
		<Toolbar>
			<Tag label="Análise" variant="muted" />
		</Toolbar>
	);
}
