'use client';

/* * */

import { useToggle } from '@mantine/hooks';

/* * */

import Left from './Left';
import Right from './Right';
import styles from './styles.module.css';

/* * */

export default function GenericHeader() {
	//

	//
	// A. Setup variables

	const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);
	console.log('Specific');

	//
	// B. Render components

	return (
		<div className={styles.header}>
			<Left />
			<Right setToggleValue={setToggleValue} toggleValue={toggleValue} />
		</div>
	);
}
