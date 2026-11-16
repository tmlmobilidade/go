'use client';

import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { Button, ColorSwatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function PeriodsCalendarLegend({ disabled = false, onSelect, periods, selectedPeriodId }: { disabled?: boolean, onSelect?: (id: string) => void, periods: YearPeriod[], selectedPeriodId?: string }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div aria-label={t('default:periods.calendar.legend')} className={styles.legend}>
			{periods.map(period => (
				<Button
					key={period._id}
					aria-pressed={period._id === selectedPeriodId}
					disabled={selectedPeriodId ? period._id !== selectedPeriodId : disabled}
					icon={<ColorSwatch color={period.color || '#3b82f6'} size={12} />}
					label={period.name}
					onClick={onSelect ? () => onSelect(period._id) : undefined}
					variant={period._id === selectedPeriodId ? 'primary' : 'secondary'}
				/>
			))}
		</div>
	);
}
