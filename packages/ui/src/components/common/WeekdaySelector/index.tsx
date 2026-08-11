'use client';

import { IsoWeekday, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';
import React from 'react';

import { SegmentedMultiSelect } from '../SegmentedMultiSelect';

/* * */

export interface WeekdaySelectorProps {
	className?: string
	labels?: Partial<Record<IsoWeekday, string>>
	onChange?: (selectedDays: IsoWeekday[]) => void
	title?: string
	value?: IsoWeekday[]
	wrap?: boolean
}

/* * */

export default function WeekdaySelector({
	className,
	labels,
	onChange,
	title,
	value = [],
	wrap = false,
}: WeekdaySelectorProps) {
	return (
		<SegmentedMultiSelect<IsoWeekday>
			className={className}
			onChange={onChange}
			title={title}
			value={value}
			wrap={wrap}
			options={WEEKDAY_OPTIONS.map(o => ({
				ariaLabel: o.label,
				label: labels?.[o.value] ?? o.label,
				value: o.value,
			}))}
		/>
	);
}
