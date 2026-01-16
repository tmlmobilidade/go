'use client';

/* * */

import { IsoWeekday, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';
import { Button } from '../../buttons';

/* * */

export interface WeekdaySelectorProps {
	/** Optional additional class name */
	className?: string
	/** Callback when selection changes */
	onChange?: (selectedDays: IsoWeekday[]) => void
	/** Currently selected weekdays */
	value?: IsoWeekday[]
}

/**
 * WeekdaySelector component to display and select weekdays.
 */
export default function WeekdaySelector({
	className,
	onChange,
	value = [],
}: WeekdaySelectorProps) {
	//

	const handleToggle = (day: IsoWeekday) => {
		const newValue = value.includes(day)
			? value.filter(d => d !== day)
			: [...value, day];
		onChange?.(newValue);
	};

	return (
		<div className={cn(styles.container, className)}>
			{WEEKDAY_OPTIONS.map((option) => {
				const isSelected = value.includes(option.value);
				return (
					<Button
						key={option.value}
						label={option.label}
						onClick={() => handleToggle(option.value)}
						variant={isSelected ? 'primary' : 'muted'}
					/>
				);
			})}
		</div>
	);

	//
}
