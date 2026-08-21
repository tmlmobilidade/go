'use client';

import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { type Notification as TmlNotification } from '@tmlmobilidade/go-types-core';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface NotificationsContextState {
	actions: {
		deleteNotification: (id: string) => Promise<void>
		markAsRead: (notification: TmlNotification) => Promise<void>
		requestNotificationPermission: () => Promise<boolean>
		triggerNotificationToast: (title: string, body: string) => Promise<void>
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

/* * */

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

	const previousNotificationIdsRef = useRef<Set<string> | undefined>(undefined);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

	//
	// B. Fetch data

	const {
		data: notificationsData,
		error: notificationsError,
		isLoading: notificationsLoading,
		mutate: notificationsMutate,
	} = useSWR<TmlNotification[], HttpException>(API_ROUTES.auth.NOTIFICATIONS_LIST, {
		fetcher: async (url: string) => {
			const response = await fetchData<TmlNotification[]>(url);
			if (response.error) throw new HttpException(response.statusCode, response.error);
			return response.data ?? [];
		},
		refreshInterval: 10_000,
	});

	//
	// C. Handle actions

	const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
		if (typeof window === 'undefined' || !('Notification' in window) || !window.isSecureContext) return false;
		if (window.Notification.permission === 'denied') return false;

		const permission = window.Notification.permission === 'granted'
			? 'granted'
			: await window.Notification.requestPermission();

		const isGranted = permission === 'granted';
		setNotificationsEnabled(isGranted);
		return isGranted;
	}, []);

	const triggerNotificationToast = useCallback(async (title: string, body: string): Promise<void> => {
		if (typeof window === 'undefined' || !('Notification' in window)) return;
		if (window.Notification.permission !== 'granted') return;

		const notification = new window.Notification(title, { body });
		notification.onclick = () => window.focus();
	}, []);

	const deleteNotification = useCallback(async (id: string): Promise<void> => {
		await notificationsMutate(
			currentNotifications => currentNotifications?.filter(notification => notification._id !== id),
			{ revalidate: false },
		);

		const response = await fetchData<undefined>(API_ROUTES.auth.NOTIFICATIONS_DETAIL(id), 'DELETE');
		if (response.error) {
			await notificationsMutate();
			throw new HttpException(response.statusCode, response.error);
		}

		await notificationsMutate();
	}, [notificationsMutate]);

	const markAsRead = useCallback(async (notification: TmlNotification): Promise<void> => {
		const response = await fetchData<TmlNotification>(API_ROUTES.auth.NOTIFICATIONS_DETAIL_MARK_AS_READ(notification._id));
		if (response.error) throw new HttpException(response.statusCode, response.error);

		await notificationsMutate(
			currentNotifications => currentNotifications?.map(currentNotification => (
				currentNotification._id === notification._id
					? { ...currentNotification, is_read: true }
					: currentNotification
			)),
			{ revalidate: false },
		);

		if (notification.payload.href) window.location.href = notification.payload.href;
	}, [notificationsMutate]);

	//
	// D. Handle side effects

	useEffect(() => {
		if (typeof window === 'undefined' || !('Notification' in window)) return;
		setNotificationsEnabled(window.Notification.permission === 'granted');
	}, []);

	useEffect(() => {
		if (!notificationsData) return;

		const currentNotificationIds = new Set(notificationsData.map(notification => notification._id));
		const previousNotificationIds = previousNotificationIdsRef.current;

		if (previousNotificationIds) {
			for (const notification of notificationsData) {
				if (!notification.is_read && !previousNotificationIds.has(notification._id)) {
					void triggerNotificationToast(notification.payload.title, notification.payload.body);
				}
			}
		}

		previousNotificationIdsRef.current = currentNotificationIds;
	}, [notificationsData, triggerNotificationToast]);

	//
	// E. Define context value

	const contextValue: NotificationsContextState = useMemo(() => ({
		actions: {
			deleteNotification,
			markAsRead,
			requestNotificationPermission,
			triggerNotificationToast,
		},
		data: {
			allNotifications: notificationsData ?? [],
			readNotifications: notificationsData?.filter(notification => notification.is_read) ?? [],
			unreadNotifications: notificationsData?.filter(notification => !notification.is_read) ?? [],
		},
		flags: {
			enabled: notificationsEnabled,
			error: notificationsError,
			loading: notificationsLoading,
		},
	}), [deleteNotification, markAsRead, notificationsData, notificationsEnabled, notificationsError, notificationsLoading, requestNotificationPermission, triggerNotificationToast]);

	//
	// F. Render components

	return (
		<NotificationsContext.Provider value={contextValue}>
			{children}
		</NotificationsContext.Provider>
	);

	//
};
