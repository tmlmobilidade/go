/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsTableHeader } from '@/components/patterns/stops/table/StopsTableHeader';
import { StopsTableRow } from '@/components/patterns/stops/table/StopsTableRow';

import styles from '../styles.module.css';

/* * */

export function StopsTable() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<div className={styles.tableScroll}>
				<StopsTableHeader />
				<div className={styles.body}>
					{patternDetailContext.data.pattern.path.map((pathItem, index) => (
						<StopsTableRow key={index} pathItem={pathItem} rowIndex={index} />
					))}
				</div>
			</div>
		</div>
	);

	//
}
