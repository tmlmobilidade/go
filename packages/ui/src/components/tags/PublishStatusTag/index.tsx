'use client';

/* * */

import { type PublishStatus, PublishStatusSchema } from '@tmlmobilidade/types';
import { useState } from 'react';

import { Select } from '../../inputs/Select';
import { Tag } from '../Tag';

/* * */

interface PublishStatusTagProps {
	onChange?: (value: PublishStatus) => void
	onClick?: () => void
	value: PublishStatus
}

/* * */

export function PublishStatusTag({ onChange, onClick, value }: PublishStatusTagProps) {
	//

	//
	// A. Setup variables

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const publishStatusOptions = PublishStatusSchema.options.map(value => ({
		label: value === 'archived' ? 'Arquivado' : value === 'draft' ? 'Rascunho' : value === 'published' ? 'Publicado' : 'UNKNOWN',
		value: value,
	}));

	//
	// C. Handle actions

	const handleClick = () => {
		// If onClick prop exists, call it and return
		if (onClick) return onClick();
		// Otherwise, set isEditing to true
		if (onChange) setIsEditing(true);
	};

	//
	// D. Render components

	if (!value) return;

	if (!isEditing) {
		return (
			<>
				{value === 'draft' && <Tag label="Rascunho" onClick={(onClick || onChange) ? handleClick : undefined} variant="muted" />}
				{value === 'archived' && <Tag label="Arquivado" onClick={(onClick || onChange) ? handleClick : undefined} variant="primary" />}
				{value === 'published' && <Tag label="Publicado" onClick={(onClick || onChange) ? handleClick : undefined} variant="primary" filled />}
			</>
		);
	}

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

	//
}
