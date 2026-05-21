'use client';

/* * */

import { type MenuProps } from '@mantine/core';
import { IconBell, IconBellOff } from '@tabler/icons-react';

import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { Menu } from '../../menu/Menu';
import { MenuList } from '../../menu/MenuList';
import { MenuNoContent } from '../../menu/MenuNoContent';
import { SidebarNotificationsItem } from '../SidebarNotificationsItem';

/* * */

export interface SidebarNotificationsProps {
	menuPosition?: MenuProps['position']
}

/* * */

export function SidebarNotifications({ menuPosition }: SidebarNotificationsProps = {}) {
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
		<Menu counter={unreadNotifications.length} icon={IconBell} label="Notificações" menuPosition={menuPosition} variant="danger">

			<MenuList data={unreadNotifications} itemComponent={({ item }) => <SidebarNotificationsItem notification={item} />} title="Não Lidas" />
			<MenuList data={readNotifications} itemComponent={({ item }) => <SidebarNotificationsItem notification={item} />} title="Lidas" />

			{notifications.length === 0 && (
				<MenuNoContent icon={IconBellOff} text="Sem notificações disponíveis" />
			)}
		</Menu>
	);

	//
}
