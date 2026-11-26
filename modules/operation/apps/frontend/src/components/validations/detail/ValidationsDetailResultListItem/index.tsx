'use client';

import { type ValidationsDetailResultItem } from '@/components/validations/detail/use-validations-detail-results';
import { SeverityTag } from '@tmlmobilidade/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ValidationsDetailResultListItemProps {
	isSelected: boolean
	item: ValidationsDetailResultItem
	onSelect: (id: string) => void
}

/* * */

export function ValidationsDetailResultListItem({ isSelected, item, onSelect }: ValidationsDetailResultListItemProps) {
	//

	//
	// A. Setup variables

	const severityId = useId();
	const { i18n } = useTranslation();
	const { description, id, result, ruleId } = item;
	const affectedRows = result.total_rows.toLocaleString(i18n.resolvedLanguage);

	//
	// B. Render components

	return (
		<li className={styles.row} data-selected={isSelected}>
			<div className={styles.severity} id={severityId}>
				<SeverityTag severity={result.severity} />
			</div>
			<button
				aria-current={isSelected || undefined}
				aria-describedby={severityId}
				className={styles.button}
				onClick={() => onSelect(id)}
				type="button"
			>
				<span className={styles.rule}>
					<code>{ruleId}</code>
					<span>{description}</span>
				</span>
				<span className={styles.count}>{affectedRows}</span>
			</button>
		</li>
	);

	//
}
