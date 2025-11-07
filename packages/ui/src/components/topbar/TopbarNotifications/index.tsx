'use client';

/* * */

import { IconBell, IconBellOff } from '@tabler/icons-react';

import { useNotificationsContext } from '../../../contexts';
import { AppWrapperMenu } from '../AppWrapperMenu';
import { AppWrapperMenuList } from '../AppWrapperMenuList';
import { AppWrapperMenuNoContent } from '../AppWrapperMenuNoContent';
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
		<AppWrapperMenu counter={unreadNotifications.length} icon={IconBell}>

			<AppWrapperMenuList data={unreadNotifications} itemComponent={({ item }) => <TopbarNotificationsItem notification={item} />} title="Não Lidas" />
			<AppWrapperMenuList data={readNotifications} itemComponent={({ item }) => <TopbarNotificationsItem notification={item} />} title="Lidas" />

			{notifications.length === 0 && (
				<AppWrapperMenuNoContent icon={IconBellOff} text="Sem notificações disponíveis" />
			)}
		</AppWrapperMenu>
	);

	//
}
