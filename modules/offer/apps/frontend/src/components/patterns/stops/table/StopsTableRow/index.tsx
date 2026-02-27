'use client';

/* * */

import { StopsTableTableColumnDistance } from '@/components/patterns/stops/table/StopsTableColumnDistance';
import { PathTableColumnStop } from '@/components/patterns/stops/table/StopsTableColumnStop';
import { Path } from '@tmlmobilidade/types';
import { Checkbox, CheckboxProps, Text, Tooltip } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

import { usePatternDetailContext } from '../../../detail/PatternDetail.context';
import { StopsTableTableColumnZones } from '../StopsTableColumnZones';

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
				<Checkbox size="sm" {...checkboxProps} disabled={patternDetailContext.flags.isReadOnly} />
			</Tooltip>
		</div>
	);
}

/* * */

export function StopsTableRow({ pathItem, rowIndex }: { pathItem: Path, rowIndex: number }) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<div className={`${styles.row} ${styles.bodyRow}`}>
			<div className={`${styles.column} ${styles.hcenter}`}>
				<Text>{rowIndex + 1}</Text>
			</div>

			<PathTableColumnStop pathItem={pathItem} />

			<CheckboxColumn
				key={patternDetailContext.data.form.key(`path.${rowIndex}.timepoint`)}
				tooltip={`O horário de passagem ${patternDetailContext.data.form.values.path?.[rowIndex]?.timepoint ? '' : 'não'} é exato nesta paragem`}
				{...patternDetailContext.data.form.getInputProps(`path.${rowIndex}.timepoint`, { type: 'checkbox' })}
			/>
			<CheckboxColumn
				key={patternDetailContext.data.form.key(`path.${rowIndex}.allow_pickup`)}
				tooltip={`${patternDetailContext.data.form.values.path?.[rowIndex]?.allow_pickup ? 'É' : 'Não é'} permitida a entrada de passageiros nesta paragem`}
				{...patternDetailContext.data.form.getInputProps(`path.${rowIndex}.allow_pickup`, { type: 'checkbox' })}
			/>

			<CheckboxColumn
				key={patternDetailContext.data.form.key(`path.${rowIndex}.allow_drop_off`)}
				tooltip={`${patternDetailContext.data.form.values.path?.[rowIndex]?.allow_drop_off ? 'É' : 'Não é'} permitida a saída de passageiros nesta paragem`}
				{...patternDetailContext.data.form.getInputProps(`path.${rowIndex}.allow_drop_off`, { type: 'checkbox' })}
			/>

			<StopsTableTableColumnDistance pathItem={pathItem} rowIndex={rowIndex} />

			<StopsTableTableColumnZones pathItem={pathItem} rowIndex={rowIndex} />
		</div>
	);
}
