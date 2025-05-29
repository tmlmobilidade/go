'use client';

import { Left } from './Left';
import { Right } from './Right';
import styles from './styles.module.css';

/* * */

export function GenericHeader() {
	//

	//
	// A. Setup variables

	// const [toggleValue, setToggleValue] = useToggle(['Mapa', 'Satélite'] as const);

	//
	// B. Render components

	return (
		<div className={styles.header}>
			<Left />
			<Right />
			{/* <Right setToggleValue={setToggleValue} toggleValue={toggleValue} /> */}
		</div>
	);
}
