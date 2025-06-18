'use client';

import { Pane } from '@tmlmobilidade/ui';

import { Footer } from './Footer';
import { SearchBar } from './SearchBar';
import { StopsList } from './StopsList';

/* * */

export function List() {
	//

	//
	// A. Render components
	return (
		<div style={{ height: '90vh' }}>
			<Pane header={[
				<SearchBar />,
			]}
			>
				<StopsList />
				<Footer />
			</Pane>
		</div>
	);
}
