'use client';

import { type ContentModuleId, type ContentScope } from '@tmlmobilidade/go-types-core';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ChangelogMetaProps {
	muted?: boolean
	publishedAt: number
	scope: ContentScope
}

/* * */

export function ChangelogMeta({ muted = false, publishedAt, scope }: ChangelogMetaProps) {
	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const date = new Date(publishedAt);
	const modules: ContentModuleId[] = scope.type === 'modules' ? scope.module_ids : [];

	//
	// B. Render components

	return (
		<span className={styles.meta} data-muted={muted}>
			<time dateTime={date.toISOString()}>{new Intl.DateTimeFormat(i18n.resolvedLanguage || 'pt', { dateStyle: 'medium' }).format(date)}</time>
			{scope.type === 'platform' && <span className={styles.scope}>{t('shared:components.changelog.modules.platform')}</span>}
			{modules.map(moduleId => <span key={moduleId} className={styles.scope}>{t(`shared:components.changelog.modules.${moduleId}`)}</span>)}
		</span>
	);
}
