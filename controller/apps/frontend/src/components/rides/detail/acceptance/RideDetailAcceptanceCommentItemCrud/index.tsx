'use client';

/* * */

import { RideDetailAcceptanceCommentItemWrapper } from '@/components/rides/detail/acceptance/RideDetailAcceptanceCommentItemWrapper';
import { IconCircleDashedLetterR, IconCircleDashedLetterU, IconCircleDashedMinus, IconCircleDashedPlus, IconCircleDashedX, IconProps } from '@tabler/icons-react';
import { CrudComment } from '@tmlmobilidade/types';
import { Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { createElement } from 'react';

import styles from '../styles.module.css';

/* * */

const Icons: Record<CrudComment['action'], { color: string, icon: React.ComponentType<IconProps>, label: string }> = {
	archive: {
		color: 'var(--color-status-warning-primary)',
		icon: IconCircleDashedMinus,
		label: 'A aceitação foi arquivada',
	},
	create: {
		color: 'var(--color-status-success-primary)',
		icon: IconCircleDashedPlus,
		label: 'A aceitação foi criada por sistema',
	},
	delete: {
		color: 'var(--color-status-danger-primary)',
		icon: IconCircleDashedX,
		label: 'A aceitação foi apagada',
	},
	restore: {
		color: 'var(--color-status-success-primary)',
		icon: IconCircleDashedLetterR,
		label: 'A aceitação foi restaurada',
	},
	update: {
		color: 'var(--color-status-warning-primary)',
		icon: IconCircleDashedLetterU,
		label: 'A aceitação foi atualizada',
	},
};

export function RidesDetailAcceptanceCommentItemCrud({ comment }: { comment: CrudComment }) {
	return (
		<RideDetailAcceptanceCommentItemWrapper icon={createElement(Icons[comment.action].icon, { color: Icons[comment.action].color })}>
			<Section flexDirection="column" gap="xs" padding="none">
				<div className={styles.label}>{Icons[comment.action].label}</div>
				<Label size="sm">{comment.created_by} a {Dates.fromUnixTimestamp(comment.created_at).toLocaleString(Dates.FORMATS.DATETIME_SHORT, 'pt-PT')}</Label>
			</Section>
		</RideDetailAcceptanceCommentItemWrapper>
	);
}
