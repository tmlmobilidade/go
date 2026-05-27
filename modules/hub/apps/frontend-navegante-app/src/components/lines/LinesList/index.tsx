'use client';

import { useLinesContext } from '@/contexts/Lines.context';

import styles from './styles.module.css';

/* * */

export function LinesList() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{linesContext.data.lines.map((line, index) => (
				<div key={index} className={styles.item}>
					{line.short_name} - {line.long_name}
				</div>
			))}
		</div>
	);
}
