'use client';

/* * */

import { AppWrapperMenu } from '@/components/layout/AppWrapper/components/common/AppWrapperMenu';
import { AppWrapperMenuList } from '@/components/layout/AppWrapper/components/common/AppWrapperMenuList';
import { AppWrapperMenuNoContent } from '@/components/layout/AppWrapper/components/common/AppWrapperMenuNoContent';
import { useNotificationsContext } from '@/contexts/Notifications.context';
import { IconBell, IconBellOff } from '@tabler/icons-react';

import { NotificationsMenuItem } from '../NotificationsMenuItem';

/* * */

export function NotificationsMenu() {
	//

	//
	// A. Setup variables

	const notificationsContext = useNotificationsContext();

	const notifications = notificationsContext.data.allNotifications || [];
	const unreadNotifications = notificationsContext.data.unreadNotifications || [];
	const readNotifications = notificationsContext.data.readNotifications || [];

	//
	// B. Render components

	return (
		<AppWrapperMenu counter={unreadNotifications.length} icon={IconBell}>

			<AppWrapperMenuList data={unreadNotifications} itemComponent={({ item }) => <NotificationsMenuItem notification={item} />} title="Não Lidas" />
			<AppWrapperMenuList data={readNotifications} itemComponent={({ item }) => <NotificationsMenuItem notification={item} />} title="Lidas" />

			{notifications.length === 0 && (
				<AppWrapperMenuNoContent icon={IconBellOff} text="Sem notificações disponíveis" />
			)}
		</AppWrapperMenu>
	);

	//
}
