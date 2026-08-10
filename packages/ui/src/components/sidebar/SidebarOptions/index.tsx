'use client';

import { ColorSwatch, Menu as MantineMenu, type MenuProps } from '@mantine/core';
import { IconBellRinging, IconBrightness, IconCheck, IconColorSwatch, IconLanguage, IconLogout, IconMaximize, IconMinimize, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { AVAILABLE_MODES, AVAILABLE_THEMES, useLayoutContext } from '../../../contexts/Layout.context';
import { useMeContext } from '../../../contexts/Me.context';
import { useNotificationsContext } from '../../../contexts/Notifications.context';
import { useVersionContext } from '../../../contexts/Version.context';
import { enabledLocales } from '../../../i18n/locales';
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

	const { t } = useTranslation();
	const meContext = useMeContext();
	const layoutContext = useLayoutContext();
	const versionContext = useVersionContext();
	const notificationsContext = useNotificationsContext();

	//
	// B. Render components

	return (
		<Menu icon={IconSettings} label={t('shared:components.sidebar.SidebarOptions.label')} menuPosition={menuPosition}>

			<MantineMenu.Label>{t('shared:components.sidebar.SidebarOptions.customisation')}</MantineMenu.Label>

			<MantineMenu.Sub position="left">
				<MantineMenu.Sub.Target>
					<MantineMenu.Sub.Item leftSection={<IconBrightness size={20} />}>
						{t('shared:components.sidebar.SidebarOptions.mode')}
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
						{t('shared:components.sidebar.SidebarOptions.theme')}
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

			<MantineMenu.Sub position="left">
				<MantineMenu.Sub.Target>
					<MantineMenu.Sub.Item leftSection={<IconLanguage size={20} />}>
						{t('shared:components.sidebar.SidebarOptions.language')}
					</MantineMenu.Sub.Item>
				</MantineMenu.Sub.Target>
				<MantineMenu.Sub.Dropdown>
					{enabledLocales.map(item => (
						<MantineMenu.Item
							key={item._id}
							onClick={() => layoutContext.actions.activateLocale(item._id)}
							rightSection={layoutContext.data.active_locale === item._id ? <IconCheck size={16} /> : null}
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
				{layoutContext.data.active_fullscreen
					? t('shared:components.sidebar.SidebarOptions.exit_fullscreen')
					: t('shared:components.sidebar.SidebarOptions.enter_fullscreen')}
			</MantineMenu.Item>

			<MantineMenu.Divider />

			<MantineMenu.Label>{t('shared:components.sidebar.SidebarOptions.account')}</MantineMenu.Label>

			<MantineMenu.Item
				leftSection={<IconBellRinging size={20} />}
				onClick={notificationsContext.actions.requestNotificationPermission}
				rightSection={notificationsContext.flags.enabled ? <IconCheck size={16} /> : null}
			>
				{notificationsContext.flags.enabled
					? t('shared:components.sidebar.SidebarOptions.notifications_enabled')
					: t('shared:components.sidebar.SidebarOptions.enable_notifications')}
			</MantineMenu.Item>

			<MantineMenu.Item
				color="var(--color-status-danger-primary)"
				leftSection={<IconLogout size={20} />}
				onClick={meContext.actions.logout}
			>
				{t('shared:components.sidebar.SidebarOptions.logout')}
			</MantineMenu.Item>

			<MantineMenu.Divider />

			<MantineMenu.Label>{t('shared:components.sidebar.SidebarOptions.version')} {versionContext.data.version}</MantineMenu.Label>

		</Menu>
	);
}
