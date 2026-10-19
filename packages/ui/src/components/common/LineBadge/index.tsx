'use client';

import { IconInfoTriangleFilled } from '@tabler/icons-react';
import { HubV1ApiLine } from '@tmlmobilidade/go-types-hub';

import styles from './styles.module.css';

/* * */

export interface LineBadgeProps {
	color?: string
	lineData?: HubV1ApiLine
	lineId?: string
	onClick?: () => void
	shortName?: string
	size?: 'full-width' | 'lg' | 'md'
	textColor?: string
	withAlertIcon?: boolean
}

/* * */

export function LineBadge({ color, lineData, onClick, shortName, size = 'md', textColor, withAlertIcon = false }: LineBadgeProps) {
	//

	//
	// A. Render components

	return (
		<div
			className={styles.badge}
			data-size={size}
			onClick={onClick}
			style={{ backgroundColor: color || lineData?.color, color: textColor || lineData?.text_color }}
		>
			{shortName || lineData?._id || '• • •'}
			{withAlertIcon && (
				<div className={styles.alertIcon}>
					<IconInfoTriangleFilled size={12} />
				</div>
			)}
		</div>
	);

	//
}
