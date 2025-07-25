'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { StopListFilterBar } from './StopListFilters/StoplistFilterBar';
import { StopListHeader } from './StopListHeader';
import { StopsList } from './StopsList';

/* * */

export function List() {
	return (
		<Pane header={[
			<StopListHeader />,
			<StopListFilterBar />,
		]}
		>
			<StopsList />
		</Pane>
	);
}
