'use client';

import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { Pane } from '@tmlmobilidade/ui';

import { Footer } from './Footer';
import { SearchBar } from './SearchBar';
import { StopsList } from './StopsList';

/* * */

export function List() {
	//

	//
	// A. Render components
	const { data, flags } = useStopsContext();
	const { queryString, setQueryString } = useSearchbarContext();

	return (
		<div style={{ height: '90vh' }}>
			<Pane header={[
				<SearchBar data={data} setQueryString={setQueryString} />,
			]}
			>
				<StopsList data={data} flags={flags} queryString={queryString} />
				<Footer />
			</Pane>
		</div>
	);
}
