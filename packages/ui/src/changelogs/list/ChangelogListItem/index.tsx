'use client';

import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { ChangelogItemCategoryValues, type ChangelogSummaryPlatformResponse } from '@tmlmobilidade/go-types-core';
import { useTranslation } from 'react-i18next';

import categoryStyles from '../../shared/changelog-categories.module.css';
import styles from './styles.module.css';

import { CHANGELOG_CATEGORY_ICONS } from '../../shared/changelog-categories';
import { ChangelogMeta } from '../../shared/ChangelogMeta';

/* * */

interface ChangelogListItemProps {
	onOpen: () => void
	release: ChangelogSummaryPlatformResponse
}

/* * */

export function ChangelogListItem({ onOpen, release }: ChangelogListItemProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<li className={styles.item} data-release-id={release._id}>
			<button className={styles.card} data-seen={release.is_seen} onClick={onOpen} type="button">
				<span className={styles.header}>
					<ChangelogMeta muted={release.is_seen} scope={release.scope} />
					{release.is_seen && (
						<span className={styles.state}>
							<IconCheck size={14} aria-hidden />
							{t('shared:components.changelog.read_release')}
						</span>
					)}
				</span>
				<span className={styles.title}>{release.title}</span>
				<span className={styles.summary}>{release.summary}</span>
				<span className={styles.footer}>
					<span className={styles.counts}>
						{ChangelogItemCategoryValues.filter(category => release.category_counts[category] > 0).map((category) => {
							const Icon = CHANGELOG_CATEGORY_ICONS[category];
							return (
								<span key={category} className={`${styles.count} ${categoryStyles.category}`} data-category={category}>
									<Icon size={16} aria-hidden />
									{t(`shared:components.changelog.category_counts.${category}`, '', { count: release.category_counts[category] })}
								</span>
							);
						})}
					</span>
					<span className={styles.action}>{t('shared:components.changelog.open_release')} <IconArrowRight size={16} aria-hidden /></span>
				</span>
			</button>
		</li>
	);
}
