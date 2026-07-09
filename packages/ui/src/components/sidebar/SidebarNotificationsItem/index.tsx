'use client';

import { Notification } from '@tmlmobilidade/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { DeleteButton } from '../../buttons/DeleteButton';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { getSidebarNotificationScopeIcon } from '../sidebar-notification-scope-icon';

/* * */

export interface SidebarNotificationsItemProps {
	notification: Notification
}

/* * */

export function SidebarNotificationsItem({ notification }: SidebarNotificationsItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const notificationsContext = useNotificationsContext();
	const icon = getSidebarNotificationScopeIcon(notification.scope);

	if (!notification.payload) {
		return null;
	}

	return (
		<div className={styles.root}>
			<div
				aria-label={t('shared:components.sidebar.SidebarNotificationsItem.mark_as_read_aria')}
				className={styles.left}
				onClick={() => notificationsContext.actions.markAsRead(notification)}
			>
				<Section flexDirection="row" gap="sm" padding="none" width="fit-content">
					<div className={styles.iconWrapper}>{icon && React.cloneElement(icon, { size: 20 })}</div>
					<div>
						<Label size="md">{notification.payload.title || t('shared:components.sidebar.SidebarNotificationsItem.no_title')}</Label>
						<div className={styles.body}>
							<Label size="sm">{notification.payload.body || t('shared:components.sidebar.SidebarNotificationsItem.no_description')}</Label>
						</div>
					</div>
				</Section>
			</div>
			<DeleteButton onDelete={() => { notificationsContext.actions.deleteNotification(notification._id); }} />
		</div>
	);

	//
};
