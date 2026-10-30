'use client';

import { IconChecks } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../buttons/Button';
import { CloseButton } from '../../../buttons/CloseButton';
import { ListHeader } from '../../../layout/list-header/ListHeader';

/* * */

interface ChangelogListHeaderProps {
	count: number
	isLoading: boolean
	isMarkingRead: boolean
	onClose: () => void
	onMarkAllRead: () => void
}

/* * */

export function ChangelogListHeader({ count, isLoading, isMarkingRead, onClose, onMarkAllRead }: ChangelogListHeaderProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={count}
			countTooltip={t('shared:components.changelog.unread_count')}
			title={t('shared:components.changelog.title')}
			actions={(
				<>
					<Button disabled={isLoading || count === 0} icon={<IconChecks size={18} aria-hidden />} label={t('shared:components.changelog.mark_all_read')} loading={isMarkingRead} onClick={onMarkAllRead} size="xs" variant="transparent" />
					<CloseButton ariaLabel={t('shared:components.changelog.close')} onClick={onClose} type="close" />
				</>
			)}
		/>
	);
}
