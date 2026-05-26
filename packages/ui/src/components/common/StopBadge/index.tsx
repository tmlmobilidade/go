'use client';

import Badge, { type BadgeProps } from '../Badge';

/* * */

export interface StopBadgeProps extends BadgeProps {
	stopId?: string
}

/* * */

export function StopBadge({ stopId, ...props }: StopBadgeProps) {
	//

	//
	// A. Render components

	return (
		<Badge {...props} variant="muted">
			{stopId || '• • •'}
		</Badge>
	);

	//
}
