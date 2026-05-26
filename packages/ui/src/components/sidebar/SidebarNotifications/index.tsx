'use client';

/* * */

import { type MenuProps } from '@mantine/core';
import { IconBell, IconBellOff } from '@tabler/icons-react';
import { type Notification } from '@tmlmobilidade/types';

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

function SidebarNotificationsMenuItem({ item }: { item: Notification }) {
	return <SidebarNotificationsItem notification={item} />;
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

			<MenuList data={unreadNotifications} getItemKey={item => item._id} itemComponent={SidebarNotificationsMenuItem} title="Não Lidas" />
			<MenuList data={readNotifications} getItemKey={item => item._id} itemComponent={SidebarNotificationsMenuItem} title="Lidas" />

			{notifications.length === 0 && (
				<MenuNoContent icon={IconBellOff} text="Sem notificações disponíveis" />
			)}
		</Menu>
	);

	//
}
