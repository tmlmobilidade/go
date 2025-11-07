'use client';

/* * */

import { sidebarApps } from '@/components/app/sidebar/AppSidebar';
import { DeleteButton } from '@/components/buttons';
import { Label } from '@/components/display/Label';
import { Section } from '@/components/layout/Section';
import { useNotificationsContext } from '@/contexts/Notifications.context';
import { Notification } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

/* * */

export function NotificationsMenuItem({ notification }: { notification: Notification }) {
	//

	//
	// A. Setup variables

	const notificationsContext = useNotificationsContext();
	const icon = sidebarApps.find(app => app._id === notification.scope)?.icon;

	if (!notification.payload) {
		return null;
	}

	return (
		<div className={styles.root}>
			<div
				aria-label="Marcar como lido"
				className={styles.left}
				onClick={() => notificationsContext.actions.markAsRead(notification)}
			>
				<Section flexDirection="row" gap="sm" padding="none" width="fit-content">
					<div className={styles.iconWrapper}>{icon && React.cloneElement(icon, { size: 20 })}</div>
					<div>
						<Label size="md">{notification.payload.title || 'Sem titulo'}</Label>
						<div className={styles.body}>
							<Label size="sm">{notification.payload.body || 'Sem Descrição'}</Label>
						</div>
					</div>
				</Section>
			</div>
			<DeleteButton
				onDelete={() => { notificationsContext.actions.deleteNotification(notification._id); }}
				variant="subtle"
			/>
		</div>
	);

	//
};
