'use client';

import { IconPlus } from '@tabler/icons-react';
import { HHMM, HHMMSchema, normalizeOperationalHhmmInput, timeToMinutes } from '@tmlmobilidade/go-types-offer';
import { Button, DayPeriodsTimepoints, Section, TextInput } from '@tmlmobilidade/ui';
import { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ScheduleGridInputProps {
	error?: string
	onChange: (times: string[]) => void
	value: string[]
}

/* * */

export function RuleCreateSchedule({ error, onChange, value = [] }: ScheduleGridInputProps) {
	const { t } = useTranslation();

	const [inputValue, setInputValue] = useState('');
	const [inputError, setInputError] = useState('');

	// Helper: Validate and Format Input
	const handleAdd = () => {
		setInputError('');

		// 1. Normalize raw user input into strict HH:MM
		const normalizedTime = normalizeOperationalHhmmInput(inputValue);

		if (!normalizedTime) {
			setInputError(t('default:scheduling.copy.invalidFormat'));
			return;
		}

		// 2. Validate with Zod and reuse its message
		const result = HHMMSchema.safeParse(normalizedTime);

		if (!result.success) {
			setInputError(t('default:scheduling.copy.invalidFormat'));
			return;
		}

		const parsedTime = result.data;

		// 3. Duplicate check
		if (value.includes(parsedTime)) {
			setInputError(t('default:scheduling.copy.existingTimepoint'));
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
					className={styles.input}
					error={inputError || error}
					onKeyDown={handleKeyDown}
					placeholder={t('patterns:shape.RuleCreateSchedule.timepoint_example')}
					rightSectionWidth={80}
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.currentTarget.value);
						setInputError('');
					}}
				/>
				<Button
					disabled={!inputValue}
					label={t('default:scheduling.copy.add')}
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
