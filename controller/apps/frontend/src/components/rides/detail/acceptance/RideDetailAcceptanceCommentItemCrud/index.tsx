'use client';

/* * */

import { IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX } from '@tabler/icons-react';
import { CrudComment } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';
import { createElement } from 'react';

import styles from '../styles.module.css';

/* * */

const Icons = {
	archive: {
		icon: IconCircleDashedMinus,
		label: 'A aceitação foi arquivada por ${by}',
		style: { color: 'var(--color-status-warning-primary)' },
	},
	create: {
		icon: IconCircleDashedPlus,
		label: 'A aceitação foi criada por sistema',
		style: { color: 'var(--color-status-success-primary)' },
	},
	delete: {
		icon: IconCircleDashedX,
		label: 'A aceitação foi apagada por ${by}',
		style: { color: 'var(--color-status-danger-primary)' },
	},
	restore: {
		icon: IconCircleDashedLetterR,
		label: 'A aceitação foi restaurada por ${by}',
		style: { color: 'var(--color-status-success-primary)' },
	},
	update: {
		icon: IconCircleDashedLetterU,
		label: 'A aceitação foi atualizada por ${by}',
		style: { color: 'var(--color-status-warning-primary)' },
	},
};

export function RidesDetailAcceptanceCommentItemCrud({ comment }: { comment: CrudComment }) {
	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			{createElement(Icons[comment.action].icon, { style: { backgroundColor: 'var(--color-system-background-100)', zIndex: 2, ...Icons[comment.action].style } })}
			<div className={styles.label}>{Icons[comment.action].label.replace('${by}', comment.updated_by)}</div>
		</Section>
	);
}
