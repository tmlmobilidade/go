'use client';

import { IconPlus } from '@tabler/icons-react';
import { HHMM, HHMMSchema, normalizeOperationalHhmmInput, timeToMinutes } from '@tmlmobilidade/types';
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

	// Helper: Validate and Format Input
	const handleAdd = () => {
		setInputError('');

		// 1. Normalize raw user input into strict HH:MM
		const normalizedTime = normalizeOperationalHhmmInput(inputValue);

		if (!normalizedTime) {
			setInputError('Formato inválido');
			return;
		}

		// 2. Validate with Zod and reuse its message
		const result = HHMMSchema.safeParse(normalizedTime);

		if (!result.success) {
			setInputError(result.error.issues[0]?.message ?? 'Formato inválido');
			return;
		}

		const parsedTime = result.data;

		// 3. Duplicate check
		if (value.includes(parsedTime)) {
			setInputError('Este horário já existe');
			return;
		}

		// 4. Add and sort using operational time logic
		const newTimes = [...value, parsedTime].sort((a, b) => timeToMinutes(a as HHMM) - timeToMinutes(b as HHMM));

		onChange(newTimes);
		setInputValue('');
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
