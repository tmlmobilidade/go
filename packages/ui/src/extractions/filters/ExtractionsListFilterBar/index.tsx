/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { ExtractionsListFilterProcessingStatus } from '../ExtractionsListFilterProcessingStatus';
import { ExtractionsListFilterVersion } from '../ExtractionsListFilterVersion';

/* * */

export function ExtractionsListFilterBar() {
	return (
		<FiltersBar>
			<ExtractionsListFilterProcessingStatus />
			<ExtractionsListFilterVersion />
		</FiltersBar>
	);
}
