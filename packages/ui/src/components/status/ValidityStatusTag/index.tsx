'use client';

import { type ValidityStatus, ValidityStatusSchema } from '@tmlmobilidade/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '../../inputs/Select';
import { Tag } from '../Tag';

/* * */

interface ValidityStatusTagProps {
	disabled?: boolean
	onChange?: (value: ValidityStatus) => void
	onClick?: () => void
	showUnknown?: boolean
	value: ValidityStatus
}

/* * */

export function ValidityStatusTag({ disabled, onChange, onClick, showUnknown = false, value }: ValidityStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const validityStatusOptions = ValidityStatusSchema.options.map(value => ({
		label: t(`shared:status.validity_status.${value}`),
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

	if (!showUnknown && value === 'unknown') return;

	if (isEditing && !disabled && onChange) {
		return (
			<Select
				clearable={false}
				data={validityStatusOptions}
				onChange={onChange}
				onDropdownClose={() => setIsEditing(false)}
				value={value}
				autoFocus
			/>
		);
	}

	return (
		<>
			{value === 'valid' && <Tag label={t('shared:status.validity_status.valid')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="success" filled />}
			{value === 'invalid' && <Tag label={t('shared:status.validity_status.invalid')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="danger" filled />}
			{value === 'unknown' && <Tag label={t('shared:status.validity_status.unknown')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="muted" />}
		</>
	);

	//
}
