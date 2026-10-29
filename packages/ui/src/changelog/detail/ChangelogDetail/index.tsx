'use client';

import { ChangelogItemCategoryValues, type ChangelogReader } from '@tmlmobilidade/go-types-core';
import { useTranslation } from 'react-i18next';

import categoryStyles from '../../shared/changelog-categories.module.css';
import styles from './styles.module.css';

import { CHANGELOG_CATEGORY_ICONS } from '../../shared/changelog-categories';
import { ChangelogMeta } from '../../shared/ChangelogMeta';

/* * */

export function ChangelogDetail({ release }: { release: ChangelogReader }) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<article className={styles.root}>
			<ChangelogMeta publishedAt={release.published_at} scope={release.scope} />
			<h2 className={styles.title} tabIndex={-1}>{release.title}</h2>
			<p className={styles.summary}>{release.summary}</p>
			{ChangelogItemCategoryValues.map((category) => {
				const items = release.items.filter(item => item.category === category);
				const Icon = CHANGELOG_CATEGORY_ICONS[category];
				if (!items.length) return null;
				return (
					<section key={category} className={`${styles.section} ${categoryStyles.category}`} data-category={category}>
						<h3 className={styles.category}><Icon size={20} aria-hidden />{t(`shared:components.changelog.categories.${category}`)}<span className={styles.count}>{items.length}</span></h3>
						<ul className={styles.items}>
							{items.map(item => (
								<li key={item._id} className={styles.item}>
									<h4>{item.title}</h4>
									{item.description && <p>{item.description}</p>}
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</article>
	);
}
