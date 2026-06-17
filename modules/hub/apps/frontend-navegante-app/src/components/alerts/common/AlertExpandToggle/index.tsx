'use client';

/* * */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	children?: React.ReactNode
	defaultState?: boolean
	isHiddenLabel?: string
	isVisibleLabel?: string
}

/* * */

export function AlertExpandToggle({ children, defaultState, isHiddenLabel, isVisibleLabel }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isVisible, setIsVisible] = useState(defaultState);

	//
	// B. Handle actions

	const handleToggle = () => {
		setIsVisible(prev => !prev);
	};

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.toggle} onClick={handleToggle}>
				{isVisible ? (isVisibleLabel || t('default:alerts.AlertsListToolbar.expand_toggle.is_visible.label')) : (isHiddenLabel || t('default:alerts.AlertsListToolbar.expand_toggle.is_hidden.label'))}
			</div>
			{isVisible && (
				<div className={styles.childrenWrapper}>
					{children}
				</div>
			)}
		</div>
	);

	//
}
