'use client';

import { useSearchbarContext } from '@/contexts/Searchbar.context';
import { useStopsContext } from '@/contexts/Stops.context';

import { Footer } from './Footer';
import { List } from './List';
import { SearchBar } from './SearchBar';
import styles from './styles.module.css';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function Navigation() {
	//

	//
	// A. Render components
	const { data, flags } = useStopsContext();
	const { queryString, setQueryString } = useSearchbarContext();

	return (
		<Pane>
			<SearchBar data={data} setQueryString={setQueryString} />
			<List data={data} flags={flags} queryString={queryString} />
			<Footer />
		</Pane>
	);
}
