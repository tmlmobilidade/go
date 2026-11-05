'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { NumberInput, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

/* * */

export function StopsTableTableColumnDistance({ rowIndex }: { rowIndex: number }) {
	//

	//
	// A. Transform data

	const { t } = useTranslation();
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
						aria-label={t('patterns:shape.StopsTableTableColumnDistance.segment_sequence', { sequence: rowIndex + 1 })}
						disabled={!patternDetailContext.capabilities.editEnabled || rowIndex === 0}
						error={fieldState.error?.message}
						min={0}
						placeholder={t('patterns:shape.StopsTableTableColumnDistance.distance_meters')}
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
