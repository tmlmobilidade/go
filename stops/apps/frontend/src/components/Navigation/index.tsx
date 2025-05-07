'use client';

import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
/* * */

import Footer from './Footer';
import List from './List';
import SearchBar from './SearchBar';
import styles from './styles.module.css';

/* * */

export default function Navigation() {
	//

	//
	// A. Render components

	return (
		<SearchbarContextProvider>
			<div className={styles.container}>
				<SearchBar />
				<List />
				<Footer />
			</div>
		</SearchbarContextProvider>
	);
}
