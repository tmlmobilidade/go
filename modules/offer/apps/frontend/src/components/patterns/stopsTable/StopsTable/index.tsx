/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsTableHeader } from '@/components/patterns/stopsTable/StopsTableHeader';
import { StopsTableRow } from '@/components/patterns/stopsTable/StopsTableRow';

import styles from '../styles.module.css';

/* * */

export function StopsTable() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	if (!patternDetailContext.data.pattern?.path?.length) {
		return (
			<div className={styles.container}>
				<div className={styles.emptyState}>Nenhuma paragem associada a este pattern.</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<StopsTableHeader />
			<div className={styles.body}>
				{patternDetailContext.data.pattern.path.map((pathItem, index) => (
					<StopsTableRow key={pathItem.stop_id} pathItem={pathItem} rowIndex={index} />
				))}
			</div>
		</div>
	);

	//
}
