'use client';

import { type ProcessingStatus, ProcessingStatusValues } from '@tmlmobilidade/go-types-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '../../inputs/Select';
import { Tag } from '../../tags/Tag';

/* * */

interface ProcessingStatusDisplayProps {
	disabled?: boolean
	onChange?: (value: ProcessingStatus) => void
	onClick?: () => void
	tooltip?: string
	value?: null | ProcessingStatus
}

/* * */

export function ProcessingStatusDisplay({ disabled, onChange, onClick, tooltip, value }: ProcessingStatusDisplayProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const processingStatusOptions = ProcessingStatusValues.map(value => ({
		label: t(`shared:status.processing_status.${value}`),
		value: value,
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
			{value === 'complete' && <Tag label={t('shared:status.processing_status.complete')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} tooltip={tooltip} variant="success" />}
			{value === 'error' && <Tag label={t('shared:status.processing_status.error')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} tooltip={tooltip} variant="danger" />}
			{value === 'processing' && <Tag label={t('shared:status.processing_status.processing')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} tooltip={tooltip} variant="primary" filled />}
			{value === 'skipped' && <Tag label={t('shared:status.processing_status.skipped')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} tooltip={tooltip} variant="muted" />}
			{value === 'waiting' && <Tag label={t('shared:status.processing_status.waiting')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} tooltip={tooltip} variant="primary" />}
		</>
	);

	//
}
