'use client';

/* * */

import Header from '../Header';
import Mapper from './Mapper';
import styles from './styles.module.css';

/* * */

interface MapContainerProps {
	generic: boolean
}

/* * */

export default function StopMap({ generic }: MapContainerProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{/* <Header generic={generic} /> */}
			<Mapper generic={generic} />
		</div>
	);
}
