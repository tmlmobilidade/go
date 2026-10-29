'use client';

import { type ModuleId, type ModuleScope } from '@tmlmobilidade/go-types-shared';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ChangelogMetaProps {
	muted?: boolean
	scope: ModuleScope
}

/* * */

export function ChangelogMeta({ muted = false, scope }: ChangelogMetaProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const modules: ModuleId[] = scope.type === 'modules' ? scope.module_ids : [];

	//
	// B. Render components

	return (
		<span className={styles.meta} data-muted={muted}>
			{scope.type === 'platform' && <span className={styles.scope}>{t('shared:components.changelog.modules.platform')}</span>}
			{modules.map(moduleId => <span key={moduleId} className={styles.scope}>{t(`shared:components.changelog.modules.${moduleId}`)}</span>)}
		</span>
	);
}
