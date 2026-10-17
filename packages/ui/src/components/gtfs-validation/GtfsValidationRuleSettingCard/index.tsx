'use client';

import { IconTrash } from '@tabler/icons-react';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { IconButton } from '../../../buttons/IconButton';
import { Label } from '../../display/Label';
import { type GtfsValidationRuleSettingCardProps } from '../types';

/* * */

export function GtfsValidationRuleSettingCard({ children, description, onRemove, removeLabel, title }: PropsWithChildren<GtfsValidationRuleSettingCardProps>) {
	//

	//
	// A. Render components

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<div className={styles.heading}>
					<Label size="sm" variant="default">{title}</Label>
					<Label size="sm" variant="muted">{description}</Label>
				</div>
				{onRemove && <IconButton icon={<IconTrash size={16} />} onClick={onRemove} tooltip={removeLabel} variant="subtle" />}
			</div>
			{children}
		</div>
	);
}
