'use client';

/* * */

import { IconMoon, IconPlus, IconSun, IconSunset, IconX } from '@tabler/icons-react';
import { Button, Section, TextInput } from '@tmlmobilidade/ui';
import { JSX, KeyboardEvent, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface ScheduleGridInputProps {
	error?: string
	onChange: (times: string[]) => void
	value: string[]
}

/* * */

export function RuleCreateSchedule({ error, onChange, value = [] }: ScheduleGridInputProps) {
	const [inputValue, setInputValue] = useState('');
	const [inputError, setInputError] = useState('');

	// Helper: Sort times chronologically
	const sortTimes = (times: string[]) => {
		return [...times].sort((a, b) => {
			const [h1, m1] = a.split(':').map(Number);
			const [h2, m2] = b.split(':').map(Number);
			return (h1 * 60 + m1) - (h2 * 60 + m2);
		});
	};

	// Helper: Validate and Format Input
	const handleAdd = () => {
		setInputError('');

		// 1. Clean input
		let time = inputValue.trim();

		// UX: Allow typing "0800" and convert to "08:00"
		if (/^\d{4}$/.test(time)) {
			time = `${time.slice(0, 2)}:${time.slice(2)}`;
		}

		// 2. Validate Format (HH:mm)
		if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
			setInputError('Formato inválido (HH:mm)');
			return;
		}

		// 3. Format strictly to HH:mm (e.g., 8:30 -> 08:30)
		const [h, m] = time.split(':');
		const formattedTime = `${h.padStart(2, '0')}:${m}`;

		// 4. Duplicate Check
		if (value.includes(formattedTime)) {
			setInputError('Este horário já existe');
			// Optional: You could scroll to the existing chip here
			return;
		}

		// 5. Add and Sort
		const newTimes = sortTimes([...value, formattedTime]);
		onChange(newTimes);
		setInputValue(''); // Clear input for next entry
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAdd();
		}
	};

	const handleRemove = (timeToRemove: string) => {
		const newTimes = value.filter(t => t !== timeToRemove);
		onChange(newTimes);
	};

	// Helper: Group times by the business periods
	// PPM — [06:00, 10:00[
	// CD  — [10:00, 16:00[
	// PPT — [16:00, 20:00[
	// N   — [20:00, 24:00[
	// M   — [00:00, 06:00[
	type PeriodKey = 'cd' | 'm' | 'n' | 'ppm' | 'ppt';
	const getPeriod = (time: string): PeriodKey => {
		const hour = parseInt(time.split(':')[0], 10);
		if (hour >= 6 && hour < 10) return 'ppm';
		if (hour >= 10 && hour < 16) return 'cd';
		if (hour >= 16 && hour < 20) return 'ppt';
		if (hour >= 20) return 'n';
		return 'm';
	};

	const periods: { icon: JSX.Element, key: PeriodKey, title: string }[] = [
		{ icon: <IconSun size={14} />, key: 'ppm', title: 'PPM — Período de ponta da manhã (06:00 - 09:59)' },
		{ icon: <IconSun size={14} style={{ opacity: 0.7 }} />, key: 'cd', title: 'CD — Corpo do Dia (10:00 - 15:59)' },
		{ icon: <IconSunset size={14} style={{ opacity: 0.7 }} />, key: 'ppt', title: 'PPT — Período de ponta da tarde (16:00 - 19:59)' },
		{ icon: <IconMoon size={14} />, key: 'n', title: 'N — Noite (20:00 - 23:59)' },
		{ icon: <IconMoon size={14} style={{ opacity: 0.7 }} />, key: 'm', title: 'M — Madrugada (00:00 - 05:59)' },
	];

	const groupedTimes = periods.reduce<Record<PeriodKey, string[]>>((acc, p) => {
		acc[p.key] = value.filter(t => getPeriod(t) === p.key);
		return acc;
	}, { cd: [], m: [], n: [], ppm: [], ppt: [] });

	return (
		<Section gap="sm">
			{/* Input Area */}
			<Section flexDirection="row" gap="sm" padding="none">
				<TextInput
					error={inputError || error}
					onKeyDown={handleKeyDown}
					placeholder="Ex: 08:30 ou 0830 + Enter"
					rightSectionWidth={80}
					style={{ flex: 1 }}
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.currentTarget.value);
						setInputError('');
					}}
				/>
				<Button
					disabled={!inputValue}
					label="Adicionar"
					leftSection={<IconPlus size={16} />}
					onClick={handleAdd}
				/>
			</Section>

			{/* Periods Layout */}
			{value.length > 0 && (
				<Section gap="md" padding="none">
					{periods.map(period => (
						<div key={period.key} className={styles.periodColumn}>
							<div className={styles.periodTitle}>
								{period.icon} {period.title}
							</div>
							<div className={styles.timeList}>
								{groupedTimes[period.key].length === 0 && <span className={styles.emptyState}>Sem horários</span>}
								{groupedTimes[period.key].map(time => (
									<TimeChip key={time} onRemove={() => handleRemove(time)} time={time} />
								))}
							</div>
						</div>
					))}
				</Section>
			)}
		</Section>
	);
}

// Small sub-component for the visual chip
function TimeChip({ onRemove, time }: { onRemove: () => void, time: string }) {
	return (
		<div className={styles.timeChip}>
			{time}
			<div
				aria-label={`Remover ${time}`}
				className={styles.deleteBtn}
				onClick={onRemove}
				role="button"
			>
				<IconX size={12} />
			</div>
		</div>
	);
}
