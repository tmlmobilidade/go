'use client';

import { IconNavigationTop } from '@tabler/icons-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	children: ReactNode
	endMarker?: ReactNode
	isActive?: boolean
	lineColor?: string
	marker: ReactNode
}

/* * */

export function RoutePlannerItineraryDetailStep({ children, endMarker, isActive = false, lineColor, marker }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<li aria-current={isActive ? 'step' : undefined} className={styles.step} data-has-end-marker={Boolean(endMarker)}>
			{lineColor && <span aria-hidden="true" className={styles.lineColor} style={{ backgroundColor: lineColor }} />}
			<div className={styles.marker} data-start-node="true">
				{marker}
				{isActive && (
					<span aria-label={t('default:routes.RoutePlanner.results.current_step')} className={styles.currentStepMarker} role="img">
						<IconNavigationTop aria-hidden="true" size={12} stroke={3} />
					</span>
				)}
			</div>
			{endMarker && <div className={styles.endMarker} data-end-node="true">{endMarker}</div>}
			<div className={styles.body}>{children}</div>
		</li>
	);
}
