'use client';

import { IconPlus } from '@tabler/icons-react';
import { HHMM, HHMMSchema, normalizeOperationalHhmmInput, timeToMinutes } from '@tmlmobilidade/types';
import { Button, DayPeriodsTimepoints, Section, TextInput } from '@tmlmobilidade/ui';
import { DragEvent, KeyboardEvent, useState } from 'react';

/* * */

interface ScheduleGridInputProps {
	error?: string
	onChange: (times: string[]) => void
	value: string[]
}

/* * */

const splitTimepointInput = (input: string) => {
	return input
		.split(/[\s,;]+/)
		.map(token => token.trim())
		.filter(Boolean);
};

/* * */

export function RuleCreateSchedule({ error, onChange, value = [] }: ScheduleGridInputProps) {
	const [inputValue, setInputValue] = useState('');
	const [inputError, setInputError] = useState('');

	// Helper: Validate and Format Input
	const handleAdd = () => {
		setInputError('');

		// 1. Split raw user input into one or more timepoint tokens
		const inputTokens = splitTimepointInput(inputValue);

		if (!inputTokens.length) {
			setInputError('Formato inválido');
			return;
		}

		// 2. Normalize and validate each token with Zod
		const parsedTimes: HHMM[] = [];
		const invalidTokens: string[] = [];

		for (const inputToken of inputTokens) {
			const normalizedTime = normalizeOperationalHhmmInput(inputToken);

			if (!normalizedTime) {
				invalidTokens.push(inputToken);
				continue;
			}

			const result = HHMMSchema.safeParse(normalizedTime);

			if (!result.success) {
				invalidTokens.push(inputToken);
				continue;
			}

			parsedTimes.push(result.data);
		}

		if (invalidTokens.length) {
			setInputError(`Formato inválido: ${invalidTokens.join(', ')}`);
			return;
		}

		// 3. Duplicate check
		const uniqueNewTimes = parsedTimes.filter((parsedTime, index) => {
			return !value.includes(parsedTime) && parsedTimes.indexOf(parsedTime) === index;
		});

		if (!uniqueNewTimes.length) {
			setInputError(parsedTimes.length === 1 ? 'Este horário já existe' : 'Estes horários já existem');
			return;
		}

		// 4. Add and sort using operational time logic
		const newTimes = [...value, ...uniqueNewTimes].sort((a, b) => timeToMinutes(a as HHMM) - timeToMinutes(b as HHMM));

		onChange(newTimes);
		setInputValue('');
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAdd();
		}
	};

	const handleDrop = (e: DragEvent<HTMLInputElement>) => {
		const droppedText = e.dataTransfer.getData('text/plain');

		if (!droppedText) return;

		e.preventDefault();
		setInputValue((currentValue) => {
			return [currentValue, droppedText].filter(Boolean).join(' ');
		});
		setInputError('');
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
					onDrop={handleDrop}
					onKeyDown={handleKeyDown}
					placeholder="Ex: 08:30 ou 0830 ou 830 + Enter"
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
