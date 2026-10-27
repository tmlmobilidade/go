'use client';

import { ActionIcon } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { openChangelogListModal } from '../../../changelog/list/ChangelogList.modal';
import { useChangelogListData } from '../../../changelog/list/use-changelog-list-data';
import { Tooltip } from '../../common/Tooltip';

/* * */

export function SidebarNews() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const hasUnseenReleases = useChangelogListData().unreadCount > 0;
	const label = t(hasUnseenReleases
		? 'shared:components.sidebar.SidebarNews.unread_tooltip'
		: 'shared:components.sidebar.SidebarNews.tooltip');

	//
	// B. Render components

	return (
		<Tooltip label={label} withArrow>
			<ActionIcon aria-label={label} className={styles.button} color="var(--color-system-text-200)" onClick={() => openChangelogListModal(t('shared:components.changelog.title'))} variant="subtle">
				<IconSparkles size={24} />
				{hasUnseenReleases && <span aria-hidden="true" className={styles.unread} />}
			</ActionIcon>
		</Tooltip>
	);
}
