'use client';

/* * */

import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { SegmentedControl } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function SelectOperationalDate() {
	//

	//
	// A. Setup variables

	const t = useTranslations('common.SelectOperationalDate');
	const operationalDateContext = useOperationalDateContext();

	const [selectedSegmentedControlOption, setSelectedSegmentedControlOption] = useState<string | undefined>();

	const segementedControlOptions = [
		{
			label: t('today'),
			value: 'today',
		},
		{
			label: t('tomorrow'),
			value: 'tomorrow',
		},
		{
			label: (
				<DatePickerInput
					classNames={{ input: styles.datePickerInput, section: styles.datePickerSection, wrapper: styles.datePickerWrapper }}
					data-selected={!operationalDateContext.flags.is_today_selected && !operationalDateContext.flags.is_tomorrow_selected}
					dropdownType="modal"
					leftSection={<IconCalendarEvent />}
					onChange={operationalDateContext.actions.updateSelectedDateFromFormat}
					size="lg"
					value={operationalDateContext.data.selected_date?.js_date}
					valueFormat="DD MMM YYYY"
					variant="unstyled"
				/>
			),
			value: 'custom_date',
		},
	];

	//
	// B. Transform data

	useEffect(() => {
		if (operationalDateContext.flags.is_today_selected) {
			setSelectedSegmentedControlOption('today');
		}
		else if (operationalDateContext.flags.is_tomorrow_selected) {
			setSelectedSegmentedControlOption('tomorrow');
		}
		else if (!operationalDateContext.flags.is_today_selected && !operationalDateContext.flags.is_tomorrow_selected) {
			setSelectedSegmentedControlOption('custom_date');
		}
	}, [operationalDateContext.flags.is_today_selected, operationalDateContext.flags.is_tomorrow_selected]);

	//
	// C. Handle actions

	const handleSegmentedControlChange = (value: string) => {
		if (value === 'today') {
			operationalDateContext.actions.updateSelectedDateToToday();
		}
		else if (value === 'tomorrow') {
			operationalDateContext.actions.updateSelectedDateToTomorrow();
		}
	};

	//
	// D. Render components

	return (
		<SegmentedControl
			data={segementedControlOptions}
			onChange={handleSegmentedControlChange}
			value={selectedSegmentedControlOption}
			w="100%"
			classNames={{
				control: styles.segmentedControlDateInputOverrideControl,
				label: styles.segmentedControlDateInputOverrideLabel,
			}}
		/>
	);

	//
}
