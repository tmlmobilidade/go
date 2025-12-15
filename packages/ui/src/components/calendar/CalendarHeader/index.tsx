'use client';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { getNextMonth, getPreviousMonth } from '@tmlmobilidade/dates';
import React from 'react';

import styles from './styles.module.css';

import { IconButton } from '../../buttons';
import { Button } from '../../buttons/Button';

/* * */

export interface CalendarHeaderProps {
	month: number
	monthName: string
	onNavigate: (year: number, month: number) => void
	onToday?: () => void
	year: number
}

/* * */

export function CalendarHeader({ month, monthName, onNavigate, onToday, year }: CalendarHeaderProps) {
	//

	const handlePrevious = () => {
		const prev = getPreviousMonth(year, month);
		onNavigate(prev.year, prev.month);
	};

	const handleNext = () => {
		const next = getNextMonth(year, month);
		onNavigate(next.year, next.month);
	};

	const handleToday = () => {
		if (onToday) {
			onToday();
		}
	};

	return (
		<div className={styles.header}>
			<div className={styles.headerTitle}>
				{monthName} {year}
			</div>
			<div className={styles.headerControls}>
				<IconButton
					icon={<IconChevronLeft />}
					onClick={handlePrevious}
					variant="secondary"
				/>

				{onToday && (
					<Button
						label="Hoje"
						onClick={handleToday}
						variant="primary"
					/>
				)}

				<IconButton
					icon={<IconChevronRight />}
					onClick={handleNext}
					variant="secondary"
				/>
			</div>
		</div>
	);
}
