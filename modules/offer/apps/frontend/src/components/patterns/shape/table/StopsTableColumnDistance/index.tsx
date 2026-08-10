'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { Path } from '@tmlmobilidade/types';
import { NumberInput } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnDistance({ pathItem, rowIndex }: { pathItem: Path, rowIndex: number }) {
	//

	//
	// A. Transform data

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.column}>
			<NumberInput
				key={patternDetailContext.data.form.key(`path.${rowIndex}.distance_delta`)}
				aria-label={`Distância do segmento para a sequência ${rowIndex + 1}`}
				defaultValue={pathItem.distance_delta ?? 0}
				min={0}
				placeholder="Distância (metros)"
				step={1}
				suffix=" m"
				styles={{
					wrapper: { minWidth: 0, width: '100%' },
				}}
				{...patternDetailContext.data.form.getInputProps(`path.${rowIndex}.distance_delta`)}
				disabled={patternDetailContext.flags.isReadOnly || rowIndex === 0}
			/>
		</div>
	);

	//
}
