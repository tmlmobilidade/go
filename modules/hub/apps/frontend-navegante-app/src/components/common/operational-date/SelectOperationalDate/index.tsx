'use client';

import { useOperationalDate } from '@/hooks/transit/useOperationalDate';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { DatePicker, Modal, SegmentedControl } from '@tmlmobilidade/ui';
import { type MouseEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SelectOperationalDate() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [modalIsOpen, setModalIsOpen] = useState(false);

	const { isTodaySelected, isTomorrowSelected, selectedOperationalDate, setOperationalDateFromFormat, setOperationalDateToToday, setOperationalDateToTomorrow } = useOperationalDate();

	//
	// B. Transform data

	const selectedOperationalDateDisplay = useMemo(() => {
		return Dates
			.fromOperationalDateInt(selectedOperationalDate, 'local')
			.set({ hour: 15 })
			.toFormat('d MMM yy');
	}, [selectedOperationalDate]);

	const selectedOperationalDatePicker = useMemo(() => {
		return Dates
			.fromOperationalDateInt(selectedOperationalDate, 'local')
			.set({ hour: 15 })
			.toFormat('yyyy-MM-dd');
	}, [selectedOperationalDate]);

	const customDateOptionLabel = isTodaySelected || isTomorrowSelected
		? t('default:lines.SelectOperationalDate.other_date')
		: selectedOperationalDateDisplay;

	const segmentedControlOptions = useMemo(() => [
		{ label: t('default:lines.SelectOperationalDate.today'), value: 'today' },
		{ label: t('default:lines.SelectOperationalDate.tomorrow'), value: 'tomorrow' },
		{ label: customDateOptionLabel, value: 'custom_date' },
	], [customDateOptionLabel, t]);

	const selectedSegmentedControlOption = useMemo(() => {
		if (isTodaySelected) return 'today';
		if (isTomorrowSelected) return 'tomorrow';
		if (!isTodaySelected && !isTomorrowSelected) return 'custom_date';
		return undefined;
	}, [isTodaySelected, isTomorrowSelected]);

	//
	// C. Handle actions

	const handleSegmentedControlClick = (event: MouseEvent<HTMLDivElement>) => {
		if (!(event.target instanceof Element)) return;

		const label = event.target.closest('label');
		const input = label?.htmlFor
			? document.getElementById(label.htmlFor)
			: event.target instanceof HTMLInputElement
				? event.target
				: event.target.parentElement?.querySelector('input');

		if (!(input instanceof HTMLInputElement) || input.value !== 'custom_date') return;

		setModalIsOpen(true);
	};

	const handleSegmentedControlChange = (value: string) => {
		if (value === 'today') setOperationalDateToToday();
		else if (value === 'tomorrow') setOperationalDateToTomorrow();
		else if (value === 'custom_date') setModalIsOpen(true);
	};

	const handleSelectOperationalDateFromModal = (value: string) => {
		setOperationalDateFromFormat(value, 'yyyy-MM-dd');
		setModalIsOpen(false);
	};

	//
	// D. Render components

	return (
		<>

			<Modal
				onClose={() => setModalIsOpen(false)}
				opened={modalIsOpen}
				padding={0}
				size="auto"
				withCloseButton={false}
			>
				<DatePicker
					onChange={handleSelectOperationalDateFromModal}
					size="lg"
					value={selectedOperationalDatePicker}
				/>
			</Modal>

			<SegmentedControl
				data={segmentedControlOptions}
				onChange={handleSegmentedControlChange}
				onClick={handleSegmentedControlClick}
				size="md"
				value={selectedSegmentedControlOption}
				fullWidth
			/>

		</>
	);
}
