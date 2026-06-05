'use client';

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { Modal, SegmentedControl } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { Dates } from '@tmlmobilidade/dates';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SelectOperationalDate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isTodaySelected, isTomorrowSelected, selectedOperationalDate, selectedOperationalDateAsJsDate, setOperationalDateFromFormat, setOperationalDateToToday, setOperationalDateToTomorrow } = useOperationalDate();

	const [opened, setOpened] = useState(false);

	//
	// B. Transform data

	const selectedOperationalDateFormatted = useMemo(() => {
		if (!selectedOperationalDate) return '';
		return Dates
			.fromOperationalDate(selectedOperationalDate, 'Europe/Lisbon')
			.set({ hour: 15 })
			.toFormat('d MMM yy');
	}, [selectedOperationalDate]);

	const segementedControlOptions = useMemo(() => [
		{ label: t('default:lines.SelectOperationalDate.today'), value: 'today' },
		{ label: t('default:lines.SelectOperationalDate.tomorrow'), value: 'tomorrow' },
		{ label: <span onClick={() => setOpened(true)}>{selectedOperationalDateFormatted}</span>, value: 'custom_date' },
	], [selectedOperationalDateFormatted, t]);

	const selectedSegmentedControlOption = useMemo(() => {
		if (isTodaySelected) return 'today';
		if (isTomorrowSelected) return 'tomorrow';
		if (!isTodaySelected && !isTomorrowSelected) return 'custom_date';
		return undefined;
	}, [isTodaySelected, isTomorrowSelected]);

	//
	// C. Handle actions

	const handleSegmentedControlChange = (value: string) => {
		if (value === 'today') setOperationalDateToToday();
		else if (value === 'tomorrow') setOperationalDateToTomorrow();
		else if (value === 'custom_date') setOpened(true);
	};

	const handleSelectOperationalDateFromModal = (value: string) => {
		setOperationalDateFromFormat(value, 'yyyy-MM-dd');
		setOpened(false);
	};

	//
	// D. Render components

	return (
		<>

			<Modal
				onClose={() => setOpened(false)}
				opened={opened}
				padding={0}
				size="auto"
				withCloseButton={false}
			>
				<DatePicker
					onChange={handleSelectOperationalDateFromModal}
					size="lg"
					value={selectedOperationalDateAsJsDate}
				/>
			</Modal>

			<SegmentedControl
				data={segementedControlOptions}
				onChange={handleSegmentedControlChange}
				size="md"
				value={selectedSegmentedControlOption}
				w="100%"
			/>

		</>
	);
}
