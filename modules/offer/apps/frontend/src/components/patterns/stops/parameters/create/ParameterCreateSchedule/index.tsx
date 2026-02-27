'use client';

/* * */

import { IconPlus } from '@tabler/icons-react';
import { HHMM } from '@tmlmobilidade/types';
import { Button, DayPeriodsTimepoints, Section, TextInput } from '@tmlmobilidade/ui';
import { KeyboardEvent, useState } from 'react';

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
				<DayPeriodsTimepoints onRemove={handleRemove} timepoints={value as HHMM[]} variant="long" />
			)}
		</Section>
	);
}
