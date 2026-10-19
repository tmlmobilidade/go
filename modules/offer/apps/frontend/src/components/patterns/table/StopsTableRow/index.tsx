'use client';

import { PathTableColumnStop } from '@/components/patterns/table/StopsTableColumnStop';
import { StopsTableTableColumnZones } from '@/components/patterns/table/StopsTableColumnZones';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { Text } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function StopsTableRow({ pathItem, rowIndex }: { pathItem: PatternsDetailPathItem, rowIndex: number }) {
	//

	//
	// A. Render components

	return (
		<div className={`${styles.row} ${styles.bodyRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Text>{rowIndex + 1}</Text>
			</div>

			<PathTableColumnStop pathItem={pathItem} />

			<StopsTableTableColumnZones pathItem={pathItem} rowIndex={rowIndex} />
		</div>
	);
}
