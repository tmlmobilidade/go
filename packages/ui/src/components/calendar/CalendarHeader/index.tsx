'use client';

import { IconCalendar, IconChevronLeft, IconChevronRight, IconLayoutGrid } from '@tabler/icons-react';
import { getNextMonth, getPreviousMonth } from '@tmlmobilidade/dates';
import React from 'react';

import styles from './styles.module.css';

import { IconButton } from '../../buttons';
import { Button } from '../../buttons/Button';
import { Divider } from '../../layout';

/* * */

export interface CalendarHeaderProps {
	month?: number
	monthName?: string
	onNavigate?: (year: number, month: number) => void
	onToday?: () => void
	onViewChange?: (view: 'month' | 'year') => void
	onYearNavigate?: (year: number) => void
	view?: 'month' | 'year'
	year: number
}

/* * */

export function CalendarHeader({ month, monthName, onNavigate, onToday, onViewChange, onYearNavigate, view = 'month', year }: CalendarHeaderProps) {
	//

	const handlePrevious = () => {
		if (view === 'month' && month && onNavigate) {
			const prev = getPreviousMonth(year, month);
			onNavigate(prev.year, prev.month);
		}
		else if (view === 'year' && onYearNavigate) {
			onYearNavigate(year - 1);
		}
	};

	const handleNext = () => {
		if (view === 'month' && month && onNavigate) {
			const next = getNextMonth(year, month);
			onNavigate(next.year, next.month);
		}
		else if (view === 'year' && onYearNavigate) {
			onYearNavigate(year + 1);
		}
	};

	const handleToday = () => {
		if (onToday) {
			onToday();
		}
	};

	const handleViewToggle = () => {
		if (onViewChange) {
			onViewChange(view === 'month' ? 'year' : 'month');
		}
	};

	return (
		<div className={styles.header}>
			<div className={styles.headerTitle}>
				{view === 'month' && monthName ? `${monthName} ${year}` : year}
			</div>
			<div className={styles.headerControls}>
				{onViewChange && (
					<Button
						icon={view === 'month' ? <IconLayoutGrid /> : <IconCalendar />}
						label={view === 'month' ? 'Ano' : 'Mês'}
						onClick={handleViewToggle}
						variant="secondary"
					/>
				)}

				<Divider orientation="vertical" />

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
