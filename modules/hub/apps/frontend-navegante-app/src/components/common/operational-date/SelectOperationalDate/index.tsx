'use client';

/* * */

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { SegmentedControl } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function SelectOperationalDate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const operationalDate = useOperationalDate();

	const [selectedSegmentedControlOption, setSelectedSegmentedControlOption] = useState<string | undefined>();

	const segementedControlOptions = [
		{
			label: t('default:lines.SelectOperationalDate.today'),
			value: 'today',
		},
		{
			label: t('default:lines.SelectOperationalDate.tomorrow'),
			value: 'tomorrow',
		},
		{
			label: (
				<DatePickerInput
					data-selected={!operationalDate.isTodaySelected && !operationalDate.isTomorrowSelected}
					dropdownType="modal"
					leftSection={<IconCalendarEvent className={styles.datePickerIcon} size={22} stroke={1.75} />}
					leftSectionWidth={38}
					onChange={operationalDate.setOperationalDateFromFormat}
					size="xl"
					value={operationalDate.selectedOperationalDateAsJsDate}
					valueFormat="DD MMM YYYY"
					variant="unstyled"
					classNames={{
						input: styles.datePickerInput,
						root: styles.datePickerRoot,
						section: styles.datePickerSection,
						wrapper: styles.datePickerWrapper,
					}}
				/>
			),
			value: 'custom_date',
		},
	];

	//
	// B. Transform data

	useEffect(() => {
		if (operationalDate.isTodaySelected) {
			setSelectedSegmentedControlOption('today');
		} else if (operationalDate.isTomorrowSelected) {
			setSelectedSegmentedControlOption('tomorrow');
		} else if (!operationalDate.isTodaySelected && !operationalDate.isTomorrowSelected) {
			setSelectedSegmentedControlOption('custom_date');
		}
	}, [operationalDate.isTodaySelected, operationalDate.isTomorrowSelected]);

	//
	// C. Handle actions

	const handleSegmentedControlChange = (value: string) => {
		if (value === 'today') {
			operationalDate.setOperationalDateToToday();
		} else if (value === 'tomorrow') {
			operationalDate.setOperationalDateToTomorrow();
		}
	};

	//
	// D. Render components

	return (
		<SegmentedControl
			data={segementedControlOptions}
			onChange={handleSegmentedControlChange}
			size="xl"
			value={selectedSegmentedControlOption}
			w="100%"
			classNames={{
				control: styles.segmentedControlDateInputOverrideControl,
				label: styles.segmentedControlDateInputOverrideLabel,
				root: styles.segmentedControlRoot,
			}}
			fullWidth
		/>
	);

	//
}
