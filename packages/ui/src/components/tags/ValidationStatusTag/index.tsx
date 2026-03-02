'use client';

/* * */

import { type ProcessingStatus, ProcessingStatusSchema } from '@tmlmobilidade/types';
import { useState } from 'react';

import { Select } from '../../inputs/Select';
import { Tag } from '../Tag';

/* * */

interface ProcessingStatusTagProps {
	disabled?: boolean
	onChange?: (value: ProcessingStatus) => void
	onClick?: () => void
	value: ProcessingStatus
}

/* * */

export function ProcessingStatusTag({ disabled, onChange, onClick, value }: ProcessingStatusTagProps) {
	//

	//
	// A. Setup variables

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const processingStatusOptions = ProcessingStatusSchema.options.map(value => ({
		label: value === 'waiting' ? 'Em Espera' : value === 'processing' ? 'Em Análise' : value === 'complete' ? 'Válido' : value === 'error' ? 'Inválido' : value === 'skipped' ? 'Omitido' : 'Desconhecido',
		value: value as ProcessingStatus,
	}));

	//
	// C. Handle actions

	const handleClick = () => {
		// If disabled, do nothing
		if (disabled) return;
		// If onClick prop exists, call it and return
		if (onClick) return onClick();
		// Otherwise, set isEditing to true
		if (onChange) setIsEditing(true);
	};

	//
	// D. Render components

	if (!value) return;

	if (isEditing && !disabled && onChange) {
		return (
			<Select
				clearable={false}
				data={processingStatusOptions}
				onChange={onChange}
				onDropdownClose={() => setIsEditing(false)}
				value={value}
				autoFocus
			/>
		);
	}

	return (
		<>
			{value === 'waiting' && <Tag label="Em Espera" onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="secondary" />}
			{value === 'processing' && <Tag label="Em Análise" onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="primary" filled />}
			{value === 'complete' && <Tag label="Válido" onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="success" filled />}
			{value === 'error' && <Tag label="Inválido" onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="danger" filled />}
			{value === 'skipped' && <Tag label="Omitido" onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="muted" />}
		</>
	);

	//
}
