'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Tooltip } from '../../../components/common/Tooltip';
import { Label } from '../../../components/display/Label';
import { Toolbar } from '../../toolbar/Toolbar';

/* * */

export interface ListHeaderProps {

	/**
	 * List of actions to render in the header.
	 */
	actions?: ReactNode

	/**
	 * The loading activity indicator component,
	 * rendered before the title.
	 */
	activity?: ReactNode

	/**
	 * The number of rows in the current view.
	 * Zero until a count is available.
	 */
	count?: number

	/**
	 * The component to render before the title,
	 * such as a modal close button.
	 */
	leading?: ReactNode

	/**
	 * The search input component.
	 */
	search?: ReactNode

	/**
	 * The title of the list.
	 */
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
		<Toolbar>

			{leading && leading}

			{activity && activity}

			<Label size="lg" caps singleLine>{title}</Label>

			<Tooltip label={t('shared:components.layout.ListHeader.countTooltip')} position="bottom" withArrow>
				<Label size="md" variant="muted" singleLine>{`(${countLabel})`}</Label>
			</Tooltip>

			<div className={styles.gap} />

			{search && <div className={styles.search}>{search}</div>}

			{actions && actions}

		</Toolbar>
	);
}
