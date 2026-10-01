'use client';

import { type LifecycleStatus, LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '../../inputs/Select';
import { Tag } from '../../tags/Tag';

/* * */

interface LifecycleStatusDisplayProps {
	disabled?: boolean
	onChange?: (value: LifecycleStatus) => void
	onClick?: () => void
	tooltip?: string
	value?: LifecycleStatus | null
}

/* * */

export function LifecycleStatusDisplay({ disabled, onChange, onClick, tooltip, value }: LifecycleStatusDisplayProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const lifecycleStatusOptions = LifecycleStatusValues.map(value => ({
		label: t(`shared:status.lifecycle_status.${value}`),
		value: value,
	}));

	//
	// C. Handle actions

	const handleClick = () => {
		if (disabled) return;
		if (onClick) return onClick();
		if (onChange) setIsEditing(true);
	};

	//
	// D. Render components

	if (!value) return;

	if (isEditing && !disabled && onChange) {
		return (
			<Select
				autoFocus
				clearable={false}
				data={lifecycleStatusOptions}
				onChange={onChange}
				onDropdownClose={() => setIsEditing(false)}
				value={value}
			/>
		);
	}

	const canClick = (onClick || onChange) && !disabled ? handleClick : undefined;

	return (
		<>
			{value === 'draft' && <Tag label={t('shared:status.lifecycle_status.draft')} onClick={canClick} tooltip={tooltip} variant="muted" />}
			{value === 'active' && <Tag filled label={t('shared:status.lifecycle_status.active')} onClick={canClick} tooltip={tooltip} variant="success" />}
			{value === 'inactive' && <Tag label={t('shared:status.lifecycle_status.inactive')} onClick={canClick} tooltip={tooltip} variant="muted" />}
			{value === 'provisional' && <Tag label={t('shared:status.lifecycle_status.provisional')} onClick={canClick} tooltip={tooltip} variant="primary" />}
			{value === 'seasonal' && <Tag label={t('shared:status.lifecycle_status.seasonal')} onClick={canClick} tooltip={tooltip} variant="secondary" />}
			{value === 'voided' && <Tag label={t('shared:status.lifecycle_status.voided')} onClick={canClick} tooltip={tooltip} variant="danger" />}
		</>
	);

	//
}
