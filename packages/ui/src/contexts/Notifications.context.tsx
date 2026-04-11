'use client';

/* * */

import { API_ROUTES, getAppConfig, HttpException } from '@tmlmobilidade/consts';
import { Notification as TmlNotification } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface NotificationsContextState {
	actions: {
		deleteNotification: (id: string) => void
		markAsRead: (notification: TmlNotification) => void
		triggerNotificationToast: (title: string, body: string) => void
	}
	data: {
		allNotifications: TmlNotification[]
		readNotifications: TmlNotification[]
		unreadNotifications: TmlNotification[]
	}
	flags: {
		enabled: boolean
		error?: HttpException
		loading: boolean
	}
}

/* * */

const NotificationsContext = createContext<NotificationsContextState | undefined>(undefined);

export function useNotificationsContext() {
	const context = useContext(NotificationsContext);
	if (!context) throw new Error('useNotificationsContext must be used within a NotificationsContextProvider');
	return context;
}

/* * */

export const NotificationsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const { data: notificationsData, error: notificationsError, isLoading: notificationsLoading } = useSWR<TmlNotification[], HttpException>(API_ROUTES.auth.NOTIFICATIONS_LIST, { refreshInterval: 10_000 });

	//
	// C. Transform data

	useEffect(() => {
		askNotificationPermission();
	}, []);

	/**
	 * Effect to trigger a notification toast when new notifications are detected.
	 *
	 * This effect compares the current list of user notification IDs with the previous list.
	 * If there are new notification IDs (i.e., notifications that were not present before),
	 * and this is not the initial load (prevIds.length > 0), it triggers a notification toast.
	 *
	 * Dependencies:
	 * - userNotifications: The current list of user notifications.
	 * - notificationsLoading: Loading state for notifications.
	 */
	useEffect(() => {
		if (!notificationsData || !notificationsLoading || !notificationsError) return;
		notificationsData.map((n) => {
			if (!n.is_read) {
				triggerNotificationToast(
					'Tem uma nova notificação',
					'Clique no sino para ver suas notificações.',
				);
			}
		});
	}, [notificationsData, notificationsLoading, notificationsError]);

	//
	// D. Handle actions

	const askNotificationPermission = async (): Promise<boolean> => {
		if (typeof window === 'undefined') return false;

		if (!('Notification' in window)) {
			console.warn('This browser does not support notifications.');
			return false;
		}

		if (!window.isSecureContext) {
			console.warn('Notifications require HTTPS or localhost.');
			return false;
		}

		if (Notification.permission === 'granted') {
			return true;
		}

		if (Notification.permission === 'denied') {
			console.warn('Notification permission was denied.');
			return false;
		}

		try {
			const permission = await Notification.requestPermission();
			return permission === 'granted';
		} catch (err) {
			console.error('Error requesting notification permission:', err);
			return false;
		}
	};

	const triggerNotificationToast = async (title: string, body: string) => {
		try {
			const allowed = await askNotificationPermission();
			if (!allowed) {
				console.warn('Notifications not allowed, skipping.');
				return;
			}

			const notification = new Notification(title, { body });
			notification.onclick = () => {
				window.focus();
			};
		} catch (err) {
			console.error('Failed to trigger notification:', err);
		}
	};

	const deleteNotification = async (id: string) => {
		if (!notificationsData) return;

		// Optimistically update UI
		mutate(
			notificationsData.filter(n => n._id !== id),
			false, // don't revalidate yet
		);

		try {
			await fetchData(`${getAppConfig('auth', 'api_url')}/notifications/${id}`, 'DELETE');

			// Revalidate after successful delete to ensure consistency
			mutate(`${getAppConfig('auth', 'api_url')}/notifications`);
		} catch (error) {
			// Rollback if something goes wrong
			mutate(`${getAppConfig('auth', 'api_url')}/notifications`);
			console.error('Failed to delete notification:', error);
		}
	};

	const markAsRead = async (notification: TmlNotification) => {
		if (notification.payload.href) {
			fetchData(`${getAppConfig('auth', 'api_url')}/notifications/${notification._id}/mark-as-read`);
			window.location.href = notification.payload.href;
		} else {
			await fetchData(`${getAppConfig('auth', 'api_url')}/notifications/${notification._id}/mark-as-read`);
			mutate(`${getAppConfig('auth', 'api_url')}/notifications`);
		}
	};

	//
	// E. Define context value

	const contextValue: NotificationsContextState = useMemo(() => ({
		actions: {
			deleteNotification,
			markAsRead,
			triggerNotificationToast,
		},
		data: {
			allNotifications: notificationsData ?? [],
			readNotifications: notificationsData?.filter(n => n.is_read) ?? [],
			unreadNotifications: notificationsData?.filter(n => !n.is_read) ?? [],
		},
		flags: {
			enabled: Notification.permission === 'granted',
			error: notificationsError,
			loading: notificationsLoading,
		},
	}), [
		notificationsData,
		notificationsError,
		notificationsLoading,
	]);

	//
	// E. Render components

	return (
		<NotificationsContext.Provider value={contextValue}>
			{children}
		</NotificationsContext.Provider>
	);

	//
};
