/* * */

import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { ColorSwatch, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface YearPeriodsListCellNameProps {
	color: YearPeriod['color']
	value: YearPeriod['name']
}

/* * */

export function YearPeriodsListCellName({ color, value }: YearPeriodsListCellNameProps) {
	return (
		<div className={styles.container}>
			<ColorSwatch color={color || '#3b82f6'} size={14} />
			<Text>{value}</Text>
		</div>
	);
}
