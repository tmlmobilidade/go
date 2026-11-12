'use client';

/* * */

import { StopsTableTableColumnDistance } from '@/components/patterns/shape/table/StopsTableColumnDistance';
import { PathTableColumnStop } from '@/components/patterns/shape/table/StopsTableColumnStop';
import { StopsTableTableColumnZones } from '@/components/patterns/table/StopsTableColumnZones';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { Checkbox, CheckboxProps, StandardFormController, Text, Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from '../styles.module.css';

import { usePatternDetailContext } from '../../../detail/PatternDetail.context';

/* * */

function CheckboxColumn({ tooltip, ...checkboxProps }: CheckboxProps & { tooltip: string }) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={`${styles.column} ${styles.hcenter}`}>
			<Tooltip label={tooltip}>
				<Checkbox size="sm" {...checkboxProps} disabled={!patternDetailContext.capabilities.editEnabled} />
			</Tooltip>
		</div>
	);
}

/* * */

export function StopsTableRow({ pathItem, rowIndex }: { pathItem: PatternsDetailPathItem, rowIndex: number }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={`${styles.row} ${styles.bodyRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Text>{rowIndex + 1}</Text>
			</div>

			<PathTableColumnStop pathItem={pathItem} />

			<StandardFormController
				control={patternDetailContext.form.control}
				name={`path.${rowIndex}.timepoint`}
				render={({ field }) => (
					<CheckboxColumn
						checked={field.value ?? false}
						onChange={event => field.onChange(event.currentTarget.checked)}
						tooltip={t(field.value ? 'patterns:shape.StopsTableRow.timepoint_yes' : 'patterns:shape.StopsTableRow.timepoint_no')}
					/>
				)}
			/>
			<StandardFormController
				control={patternDetailContext.form.control}
				name={`path.${rowIndex}.allow_pickup`}
				render={({ field }) => (
					<CheckboxColumn
						checked={field.value ?? false}
						onChange={event => field.onChange(event.currentTarget.checked)}
						tooltip={t(field.value ? 'patterns:shape.StopsTableRow.pickup_yes' : 'patterns:shape.StopsTableRow.pickup_no')}
					/>
				)}
			/>
			<StandardFormController
				control={patternDetailContext.form.control}
				name={`path.${rowIndex}.allow_drop_off`}
				render={({ field }) => (
					<CheckboxColumn
						checked={field.value ?? false}
						onChange={event => field.onChange(event.currentTarget.checked)}
						tooltip={t(field.value ? 'patterns:shape.StopsTableRow.drop_off_yes' : 'patterns:shape.StopsTableRow.drop_off_no')}
					/>
				)}
			/>

			<StopsTableTableColumnDistance rowIndex={rowIndex} />

			<StopsTableTableColumnZones rowIndex={rowIndex} />
		</div>
	);
}
