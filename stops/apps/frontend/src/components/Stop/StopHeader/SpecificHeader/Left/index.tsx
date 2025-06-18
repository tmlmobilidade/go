'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';

import styles from './styles.module.css';

/* * */

// interface LeftProps {
// 	// long_name?: string
// 	data: {
// 		form: {
// 			getValues: () => { name?: string }
// 		}
// 	}
// 	isManual: boolean
// }

/* * */

export function Left() {
	//

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.section}>
			<h3>{stopsDetailContext.data.form.getValues().name || <i>Paragem sem Título</i>}</h3>
		</div>
	);
}
