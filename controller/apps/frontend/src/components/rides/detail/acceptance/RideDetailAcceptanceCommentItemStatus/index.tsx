'use client';

/* * */

import { AcceptanceStatusProps } from '@/components/common/AcceptanceStatusTag';
import { FieldChangedComment, RideAcceptance } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';
import { cloneElement } from 'react';

import styles from './styles.module.css';

/* * */

export function RidesDetailAcceptanceChangelogAcceptanceStatusChanged({ comment }: { comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> }) {
	//
	// A. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			{cloneElement(AcceptanceStatusProps[comment.curr_value].icon, { style: { backgroundColor: 'var(--color-system-background-100)', zIndex: 2 } })}
			<div className={styles.label}>{comment.curr_value ? 'A aceitação foi bloqueada por ${by}' : 'A aceitação foi desbloqueada por ${by}'}</div>
		</Section>
	);
}
