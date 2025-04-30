'use client';

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
		<div className={styles.container}>
			<SearchBar />
			<List />
			<Footer />
		</div>
	);
}
