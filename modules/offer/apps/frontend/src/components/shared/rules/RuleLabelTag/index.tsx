'use client';

import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RuleLabelTagProps {
	label: string
	tooltip?: false | string
}

/* * */

/** One rule-title presentation, with the full label available when space is limited. */
export function RuleLabelTag({ label, tooltip }: RuleLabelTagProps) {
	const { t } = useTranslation();
	const displayLabel = label || t('default:scheduling.copy.newRule');

	return (
		<div className={styles.root}>
			<Tag label={displayLabel} tooltip={tooltip === false ? undefined : tooltip ?? displayLabel} variant="muted" />
		</div>
	);
}
