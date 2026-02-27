'use client';

/* * */

import { ColorSwatch, Menu } from '@mantine/core';
import { IconBellRinging, IconBrightness, IconCheck, IconColorSwatch, IconLogout, IconMaximize, IconMinimize, IconSettings } from '@tabler/icons-react';

import { AVAILABLE_MODES, AVAILABLE_THEMES, useLayoutContext } from '../../../contexts/Layout.context';
import { useMeContext } from '../../../contexts/Me.context';
import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { TopbarMenu } from '../TopbarMenu';

/* * */

export function TopbarOptions() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const layoutContext = useLayoutContext();
	const notificationsContext = useNotificationsContext();

	//
	// B. Render components

	return (
		<TopbarMenu icon={IconSettings} label="Definições">

			<Menu.Label>Personalização</Menu.Label>

			<Menu.Sub position="left">
				<Menu.Sub.Target>
					<Menu.Sub.Item leftSection={<IconBrightness size={20} />}>
						Modo
					</Menu.Sub.Item>
				</Menu.Sub.Target>
				<Menu.Sub.Dropdown>
					{AVAILABLE_MODES.map(item => (
						<Menu.Item
							key={item._id}
							leftSection={item.icon}
							onClick={() => layoutContext.actions.activateMode(item._id)}
							rightSection={layoutContext.data.active_mode === item._id ? <IconCheck size={16} /> : null}
						>
							{item.name}
						</Menu.Item>
					))}
				</Menu.Sub.Dropdown>
			</Menu.Sub>

			<Menu.Sub position="left">
				<Menu.Sub.Target>
					<Menu.Sub.Item leftSection={<IconColorSwatch size={20} />}>
						Tema
					</Menu.Sub.Item>
				</Menu.Sub.Target>
				<Menu.Sub.Dropdown>
					{AVAILABLE_THEMES.map(item => (
						<Menu.Item
							key={item._id}
							leftSection={<ColorSwatch color={item.primary_color} size={16} />}
							onClick={() => layoutContext.actions.activateTheme(item._id)}
							rightSection={layoutContext.data.active_theme === item._id ? <IconCheck size={16} /> : null}
						>
							{item.name}
						</Menu.Item>
					))}
				</Menu.Sub.Dropdown>
			</Menu.Sub>

			<Menu.Item
				leftSection={layoutContext.data.active_fullscreen ? <IconMinimize /> : <IconMaximize />}
				onClick={() => layoutContext.actions.activateFullscreen()}
				rightSection={layoutContext.data.active_fullscreen ? <IconCheck size={16} /> : null}
			>
				{layoutContext.data.active_fullscreen ? 'Sair do Fullscreen' : 'Entrar em Fullscreen'}
			</Menu.Item>

			<Menu.Divider />

			<Menu.Label>Conta</Menu.Label>

			<Menu.Item
				leftSection={<IconBellRinging size={20} />}
				onClick={() => Notification.requestPermission()}
				rightSection={notificationsContext.flags.enabled ? <IconCheck size={16} /> : null}
			>
				{notificationsContext.flags.enabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
			</Menu.Item>

			<Menu.Item
				color="var(--color-status-danger-primary)"
				leftSection={<IconLogout size={20} />}
				onClick={meContext.actions.logout}
			>
				Logout
			</Menu.Item>

		</TopbarMenu>
	);

	//
}
