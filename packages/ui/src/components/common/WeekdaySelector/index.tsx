'use client';

import { type IsoWeekday } from '@tmlmobilidade/go-types-shared';
import { getWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useLocaleContext } from '../../../contexts/Locale.context';
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
	//
	// A. Setup variables

	const { data: { locale } } = useLocaleContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const options = getWeekdayOptions(locale).map(({ label, value }) => {
		const defaultLabel = value === 7
			? t('components:common.WeekdaySelector.sundayAndHolidays', '', { day: label })
			: label;
		const displayLabel = labels?.[value] ?? defaultLabel;

		return {
			ariaLabel: displayLabel,
			label: displayLabel,
			value,
		};
	});

	//
	// C. Render components

	return (
		<SegmentedMultiSelect<IsoWeekday>
			className={className}
			onChange={onChange}
			options={options}
			title={title}
			value={value}
			wrap={wrap}
		/>
	);
}
