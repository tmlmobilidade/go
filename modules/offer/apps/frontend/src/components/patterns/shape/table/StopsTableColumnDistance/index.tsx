'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { NumberInput, StandardFormController } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnDistance({ rowIndex }: { rowIndex: number }) {
	//

	//
	// A. Transform data

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={styles.column}>
			<StandardFormController
				control={patternDetailContext.form.control}
				name={`path.${rowIndex}.distance_delta`}
				render={({ field, fieldState }) => (
					<NumberInput
						{...field}
						aria-label={`Distância do segmento para a sequência ${rowIndex + 1}`}
						disabled={!patternDetailContext.capabilities.editEnabled || rowIndex === 0}
						error={fieldState.error?.message}
						min={0}
						placeholder="Distância (metros)"
						step={1}
						suffix=" m"
						value={field.value ?? 0}
					/>
				)}
			/>

		</div>
	);

	//
}
