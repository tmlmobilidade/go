'use client';

/* * */

import { IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX } from '@tabler/icons-react';
import { CrudComment } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createElement } from 'react';

import styles from '../styles.module.css';

/* * */

const Icons = {
	archive: {
		icon: IconCircleDashedMinus,
		label: 'A aceitação foi arquivada',
		style: { color: 'var(--color-status-warning-primary)' },
	},
	create: {
		icon: IconCircleDashedPlus,
		label: 'A aceitação foi criada por sistema',
		style: { color: 'var(--color-status-success-primary)' },
	},
	delete: {
		icon: IconCircleDashedX,
		label: 'A aceitação foi apagada',
		style: { color: 'var(--color-status-danger-primary)' },
	},
	restore: {
		icon: IconCircleDashedLetterR,
		label: 'A aceitação foi restaurada',
		style: { color: 'var(--color-status-success-primary)' },
	},
	update: {
		icon: IconCircleDashedLetterU,
		label: 'A aceitação foi atualizada',
		style: { color: 'var(--color-status-warning-primary)' },
	},
};

export function RidesDetailAcceptanceCommentItemCrud({ comment }: { comment: CrudComment }) {
	return (
		<>
			{createElement(Icons[comment.action].icon, { style: { backgroundColor: 'var(--color-system-background-100)', zIndex: 2, ...Icons[comment.action].style } })}
			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{Icons[comment.action].label}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</>
	);
}
