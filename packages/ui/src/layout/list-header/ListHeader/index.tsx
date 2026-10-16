'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Tooltip } from '../../../components/common/Tooltip';
import { Label } from '../../../components/display/Label';
import { Toolbar } from '../../toolbar/Toolbar';

/* * */

export interface ListHeaderProps {
	actions?: ReactNode
	/** Live indicator, rendered before the title. */
	activity?: ReactNode
	/** Rows in the current view. Shown as 0 until a count is available. */
	count?: number
	/** Rendered before the title, such as a modal close button. */
	leading?: ReactNode
	search?: ReactNode
	title: string
}

/* * */

export function ListHeader({ actions, activity, count, leading, search, title }: ListHeaderProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();

	const countLabel = (count ?? 0).toLocaleString(i18n.language);

	//
	// B. Render components

	return (
		<Toolbar fit>
			{leading && <div className={styles.leading}>{leading}</div>}
			<div className={styles.identity}>
				{activity && <div className={styles.activity}>{activity}</div>}
				<div className={styles.heading}>
					<Label size="lg" caps singleLine>{title}</Label>
				</div>
				<Tooltip label={t('shared:components.layout.ListHeader.countTooltip')} position="bottom" withArrow>
					<div className={styles.count}>
						<Label size="md" variant="muted" singleLine>{`(${countLabel})`}</Label>
					</div>
				</Tooltip>
			</div>
			<div className={styles.gap} />
			{search && (
				<div className={styles.search}>
					{search}
				</div>
			)}
			{actions && <div className={styles.actions}>{actions}</div>}
		</Toolbar>
	);

	//
}
