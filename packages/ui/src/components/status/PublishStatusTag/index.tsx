'use client';

import { type PublishStatus, PublishStatusSchema } from '@tmlmobilidade/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '../../inputs/Select';
import { Tag } from '../Tag';

/* * */

interface PublishStatusTagProps {
	disabled?: boolean
	onChange?: (value: PublishStatus) => void
	onClick?: () => void
	value: PublishStatus
}

/* * */

export function PublishStatusTag({ disabled, onChange, onClick, value }: PublishStatusTagProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const publishStatusOptions = PublishStatusSchema.options.map(value => ({
		label: t(`shared:status.publish_status.${value}`),
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
				data={publishStatusOptions}
				onChange={onChange}
				onDropdownClose={() => setIsEditing(false)}
				value={value}
				autoFocus
			/>
		);
	}

	return (
		<>
			{value === 'draft' && <Tag label={t('shared:status.publish_status.draft')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="muted" />}
			{value === 'archived' && <Tag label={t('shared:status.publish_status.archived')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="primary" />}
			{value === 'published' && <Tag label={t('shared:status.publish_status.published')} onClick={(onClick || onChange) && !disabled ? handleClick : undefined} variant="primary" filled />}
		</>
	);

	//
}
