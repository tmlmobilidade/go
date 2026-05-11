'use client';

import { Notification } from '@tmlmobilidade/types';
import React from 'react';

import styles from './styles.module.css';

import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { DeleteButton } from '../../buttons/DeleteButton';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { sidebarApps } from '../../sidebar/Sidebar';

/* * */

export function TopbarNotificationsItem({ notification }: { notification: Notification }) {
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
			<DeleteButton onDelete={() => { notificationsContext.actions.deleteNotification(notification._id); }} />
		</div>
	);

	//
};
