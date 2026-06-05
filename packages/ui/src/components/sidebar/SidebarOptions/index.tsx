'use client';

import { ColorSwatch, Menu as MantineMenu, type MenuProps } from '@mantine/core';
import { IconBellRinging, IconBrightness, IconCheck, IconColorSwatch, IconLogout, IconMaximize, IconMinimize, IconSettings } from '@tabler/icons-react';

import { AVAILABLE_MODES, AVAILABLE_THEMES, useLayoutContext } from '../../../contexts/Layout.context';
import { useMeContext } from '../../../contexts/Me.context';
import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { useVersionContext } from '../../../contexts/Version.context';
import { Menu } from '../../menu/Menu';

/* * */

export interface SidebarOptionsProps {
	menuPosition?: MenuProps['position']
}

/* * */

export function SidebarOptions({ menuPosition }: SidebarOptionsProps = {}) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const layoutContext = useLayoutContext();
	const versionContext = useVersionContext();
	const notificationsContext = useNotificationsContext();

	//
	// B. Render components

	return (
		<Menu icon={IconSettings} label="Definições" menuPosition={menuPosition}>

			<MantineMenu.Label>Personalização</MantineMenu.Label>

			<MantineMenu.Sub position="left">
				<MantineMenu.Sub.Target>
					<MantineMenu.Sub.Item leftSection={<IconBrightness size={20} />}>
						Modo
					</MantineMenu.Sub.Item>
				</MantineMenu.Sub.Target>
				<MantineMenu.Sub.Dropdown>
					{AVAILABLE_MODES.map(item => (
						<MantineMenu.Item
							key={item._id}
							leftSection={item.icon}
							onClick={() => layoutContext.actions.activateMode(item._id)}
							rightSection={layoutContext.data.active_mode === item._id ? <IconCheck size={16} /> : null}
						>
							{item.name}
						</MantineMenu.Item>
					))}
				</MantineMenu.Sub.Dropdown>
			</MantineMenu.Sub>

			<MantineMenu.Sub position="left">
				<MantineMenu.Sub.Target>
					<MantineMenu.Sub.Item leftSection={<IconColorSwatch size={20} />}>
						Tema
					</MantineMenu.Sub.Item>
				</MantineMenu.Sub.Target>
				<MantineMenu.Sub.Dropdown>
					{AVAILABLE_THEMES.map(item => (
						<MantineMenu.Item
							key={item._id}
							leftSection={<ColorSwatch color={item.primary_color} size={16} />}
							onClick={() => layoutContext.actions.activateTheme(item._id)}
							rightSection={layoutContext.data.active_theme === item._id ? <IconCheck size={16} /> : null}
						>
							{item.name}
						</MantineMenu.Item>
					))}
				</MantineMenu.Sub.Dropdown>
			</MantineMenu.Sub>

			<MantineMenu.Item
				leftSection={layoutContext.data.active_fullscreen ? <IconMinimize /> : <IconMaximize />}
				onClick={() => layoutContext.actions.activateFullscreen()}
				rightSection={layoutContext.data.active_fullscreen ? <IconCheck size={16} /> : null}
			>
				{layoutContext.data.active_fullscreen ? 'Sair do Fullscreen' : 'Entrar em Fullscreen'}
			</MantineMenu.Item>

			<MantineMenu.Divider />

			<MantineMenu.Label>Conta</MantineMenu.Label>

			<MantineMenu.Item
				leftSection={<IconBellRinging size={20} />}
				onClick={() => Notification.requestPermission()}
				rightSection={notificationsContext.flags.enabled ? <IconCheck size={16} /> : null}
			>
				{notificationsContext.flags.enabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
			</MantineMenu.Item>

			<MantineMenu.Item
				color="var(--color-status-danger-primary)"
				leftSection={<IconLogout size={20} />}
				onClick={meContext.actions.logout}
			>
				Logout
			</MantineMenu.Item>

			<MantineMenu.Divider />

			<MantineMenu.Label>Versão {versionContext.data.version}</MantineMenu.Label>

		</Menu>
	);

	//
}
