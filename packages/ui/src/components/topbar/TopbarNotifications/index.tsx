'use client';

/* * */

import { IconBell, IconBellOff } from '@tabler/icons-react';

import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { TopbarMenu } from '../TopbarMenu';
import { TopbarMenuList } from '../TopbarMenuList';
import { TopbarMenuNoContent } from '../TopbarMenuNoContent';
import { TopbarNotificationsItem } from '../TopbarNotificationsItem';

/* * */

export function TopbarNotifications() {
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
		<TopbarMenu counter={unreadNotifications.length} icon={IconBell} label="Notificações">

			<TopbarMenuList data={unreadNotifications} itemComponent={({ item }) => <TopbarNotificationsItem notification={item} />} title="Não Lidas" />
			<TopbarMenuList data={readNotifications} itemComponent={({ item }) => <TopbarNotificationsItem notification={item} />} title="Lidas" />

			{notifications.length === 0 && (
				<TopbarMenuNoContent icon={IconBellOff} text="Sem notificações disponíveis" />
			)}
		</TopbarMenu>
	);

	//
}
