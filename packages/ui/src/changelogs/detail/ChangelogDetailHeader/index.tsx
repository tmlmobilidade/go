'use client';

import { useTranslation } from 'react-i18next';

import { CloseButton } from '../../../buttons/CloseButton';
import { ListHeader } from '../../../layout/list-header/ListHeader';

/* * */

interface ChangelogDetailHeaderProps {
	onBack: () => void
	onClose: () => void
}

/* * */

export function ChangelogDetailHeader({ onBack, onClose }: ChangelogDetailHeaderProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<CloseButton ariaLabel={t('shared:components.changelog.close')} onClick={onClose} type="close" />}
			count={null}
			leading={<span data-back><CloseButton ariaLabel={t('shared:components.changelog.back')} onClick={onBack} type="back" /></span>}
			title={t('shared:components.changelog.title')}
		/>
	);
}
