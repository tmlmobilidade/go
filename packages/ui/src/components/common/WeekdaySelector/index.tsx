'use client';

import { IsoWeekday, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';
import React from 'react';

import { SegmentedMultiSelect } from '../SegmentedMultiSelect';

/* * */

export interface WeekdaySelectorProps {
	className?: string
	onChange?: (selectedDays: IsoWeekday[]) => void
	title?: string
	value?: IsoWeekday[]
}

/* * */

export default function WeekdaySelector({
	className,
	onChange,
	title,
	value = [],
}: WeekdaySelectorProps) {
	return (
		<SegmentedMultiSelect<IsoWeekday>
			className={className}
			onChange={onChange}
			title={title}
			value={value}
			options={WEEKDAY_OPTIONS.map(o => ({
				ariaLabel: o.label,
				label: o.label,
				value: o.value,
			}))}
		/>
	);
}
