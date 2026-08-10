'use client';

import { useAnnotationsDetailContext } from '@/components/annotations/detail/AnnotationsDetail.context';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Button, MiniCalendar, Section, Text, TimeChip } from '@tmlmobilidade/ui';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function DatesSelector() {
	//

	//
	// A. Setup variables

	const annotationsDetailContext = useAnnotationsDetailContext();
	const isDisabled = annotationsDetailContext.flags.isReadOnly;
	const dates = useMemo(() => annotationsDetailContext.data.form.values.dates ?? [], [annotationsDetailContext.data.form.values.dates]);
	const [displayedMonth, setDisplayedMonth] = useState<Date>();

	//
	// B. Local mini-calendar state (controlled month)

	const selectedSet = useMemo(() => new Set(dates), [dates]);

	/** All operational dates in the currently displayed month */
	const displayedMonthDates = useMemo(() => {
		if (!displayedMonth) return [];
		const year = displayedMonth.getFullYear();
		const month = displayedMonth.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const result: OperationalDate[] = [];
		for (let d = 1; d <= daysInMonth; d++) {
			const mm = String(month + 1).padStart(2, '0');
			const dd = String(d).padStart(2, '0');
			result.push(`${year}${mm}${dd}` as OperationalDate);
		}
		return result;
	}, [displayedMonth]);

	const isAllDisplayedMonthSelected = useMemo(
		() => displayedMonthDates.length > 0 && displayedMonthDates.every(d => selectedSet.has(d)),
		[displayedMonthDates, selectedSet],
	);

	/** Dates grouped by "YYYY-MM" key, sorted chronologically */
	const groupedByMonth = useMemo(() => {
		const map = new Map<string, OperationalDate[]>();
		for (const d of [...dates].sort()) {
			const key = `${d.slice(0, 4)}-${d.slice(4, 6)}`;
			const existing = map.get(key);
			if (existing) existing.push(d);
			else map.set(key, [d]);
		}
		return map;
	}, [dates]);

	const initialMonth = useMemo(() => {
		// Prefer showing month of the most recently selected date; fallback to current month
		if (dates.length > 0) {
			const last = dates[dates.length - 1];
			// last is YYYYMMDD
			const yyyy = Number.parseInt(last.slice(0, 4), 10);
			const mm = Number.parseInt(last.slice(4, 6), 10);
			return new Date(yyyy, mm - 1, 1);
		}
		return new Date();
	}, [dates]);

	useEffect(() => {
		setDisplayedMonth(prev => prev ?? initialMonth);
	}, [initialMonth]);

	//
	// C. Handle actions

	const handleSelect = (date: Date) => {
		const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
		const isSelected = dates.includes(operationalDate);

		if (isSelected) {
			// Remove date from annotation
			annotationsDetailContext.data.form.setFieldValue(
				'dates',
				dates.filter(d => d !== operationalDate),
			);
		} else {
			// Add date to annotation
			annotationsDetailContext.data.form.setFieldValue(
				'dates',
				[...dates, operationalDate],
			);
		}
	};

	const handleRemove = (operationalDate: OperationalDate) => {
		annotationsDetailContext.data.form.setFieldValue(
			'dates',
			dates.filter(d => d !== operationalDate),
		);
	};

	const handleToggleDisplayedMonth = () => {
		if (isAllDisplayedMonthSelected) {
			annotationsDetailContext.data.form.setFieldValue(
				'dates',
				dates.filter(d => !displayedMonthDates.includes(d)),
			);
		} else {
			const newDates = [...new Set([...dates, ...displayedMonthDates])].sort() as OperationalDate[];
			annotationsDetailContext.data.form.setFieldValue('dates', newDates);
		}
	};

	//
	// D. Render components

	return (
		<Section gap="md" padding="none">
			<Text size="sm">Selecione as datas da ocorrência</Text>

			<Section flexDirection="row" gap="md" padding="none">
				<Section alignItems="center" gap="md" padding="none" width="fit-content">
					<MiniCalendar
						displayedMonth={displayedMonth}
						onDisplayedMonthChange={setDisplayedMonth}
						isDateSelected={(date) => {
							const operationalDate = dayjs(date).format('YYYYMMDD') as OperationalDate;
							return selectedSet.has(operationalDate);
						}}
						onDayClick={(date) => {
							if (isDisabled) return;
							handleSelect(date);
						}}
					/>
					{!isDisabled && (
						<Button className={styles.calendarMonthButton} label={isAllDisplayedMonthSelected ? 'Remover mês' : 'Selecionar mês'} onClick={handleToggleDisplayedMonth} size="xs" variant="transparent" />
					)}
				</Section>

				{dates.length > 0 && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mantine-spacing-md)', minWidth: 0 }}>
						{Array.from(groupedByMonth.entries()).map(([monthKey, monthDates]) => {
							const [yyyy, mm] = monthKey.split('-');
							const monthLabel = new Date(Number(yyyy), Number(mm) - 1, 1)
								.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

							const removeMonth = () => {
								annotationsDetailContext.data.form.setFieldValue(
									'dates',
									dates.filter(d => !monthDates.includes(d)),
								);
							};

							return (
								<Section key={monthKey} gap="xs" padding="none">
									<div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
										<Text fw={600} size="sm" style={{ textTransform: 'capitalize' }}>{monthLabel}</Text>
										{!isDisabled && (
											<button
												className={styles.monthSmallButton}
												onClick={removeMonth}
												type="button"
											>
												Remover mês
											</button>
										)}
									</div>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
										{monthDates.map((date) => {
											const jsDate = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)));
											const day = jsDate.getDate();
											const weekdayShort = jsDate.toLocaleDateString('pt-PT', { weekday: 'short' }).slice(0, 3);
											return (
												<TimeChip
													key={date}
													onRemove={!isDisabled ? () => handleRemove(date) : undefined}
													time={`${day} (${weekdayShort})`}
												/>
											);
										})}
									</div>
								</Section>
							);
						})}
					</div>
				)}

			</Section>
		</Section>

	);

	//
}
