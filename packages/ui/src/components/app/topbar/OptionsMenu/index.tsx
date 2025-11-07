'use client';

/* * */

import { AppWrapperMenu } from '@/components/app/topbar/AppWrapperMenu';
import { Label } from '@/components/display/Label';
import { useMeContext } from '@/contexts';
import { AVAILABLE_MODES, AVAILABLE_THEMES, useThemeContext } from '@/contexts/Theme.context';
import { ColorSwatch, Menu } from '@mantine/core';
import { IconBellRinging, IconChevronRight, IconColorSwatch, IconLogout, IconSettings, IconSunMoon } from '@tabler/icons-react';

/* * */

interface MenuItem {
	href?: string
	icon: React.ReactNode
	label: string
	onClick?: () => void
	submenu?: MenuItem[]
}

/* * */

export function OptionsMenu() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const themeContext = useThemeContext();

	//
	// B. Define menu structure

	const MENU_ITEMS: MenuItem[] = [
		{
			icon: <IconSunMoon size={18} />,
			label: 'Modo',
			submenu: AVAILABLE_MODES.map(item => ({
				icon: item.icon,
				label: item.name,
				onClick: () => themeContext.actions.activateMode(item._id),
			})),
		},
		{
			icon: <IconBellRinging size={18} />,
			label: 'Ativar Notificações',
			onClick: () => Notification.requestPermission(),
		},
		{
			icon: <IconColorSwatch size={18} />,
			label: 'Temas',
			submenu: AVAILABLE_THEMES.map(item => ({
				icon: <ColorSwatch color={item.primary_color} size={16} />,
				label: item.name,
				onClick: () => themeContext.actions.activateTheme(item._id),
			})),
		},
		{
			icon: <IconLogout size={18} />,
			label: 'Logout',
			onClick: meContext.actions.logout,
		},
	];

	//
	// D. Render helpers

	const renderMenuItem = (item: MenuItem) => {
		if (item.submenu) {
			return (
				<Menu.Item
					key={item.label}
					leftSection={item.icon}
					px={12}
					py={8}
				>
					<Menu offset={8} position="left-start" shadow="md" trigger="hover" width={180}>
						<Menu.Target>
							<div style={{
								alignItems: 'center',
								cursor: 'pointer',
								display: 'flex',
								justifyContent: 'space-between',
								width: '100%',
							}}
							>
								<Label size="md" singleLine>{item.label}</Label>
								<IconChevronRight size={16} />
							</div>
						</Menu.Target>
						<Menu.Dropdown>
							{item.submenu.map((subItem, subIndex) => (
								<Menu.Item
									key={subItem.label}
									leftSection={subItem.icon}
									onClick={subItem.onClick}
									px={12}
									py={6}
									style={{
										backgroundColor: themeContext.data.active_theme === AVAILABLE_THEMES[subIndex]?._id
											? 'var(--color-system-background-200)'
											: undefined,
									}}
								>
									<Label size="md" singleLine>{subItem.label}</Label>
								</Menu.Item>
							))}
						</Menu.Dropdown>
					</Menu>
				</Menu.Item>
			);
		}

		return (
			<Menu.Item
				key={item.label}
				component={item.href ? 'a' : 'button'}
				href={item.href}
				leftSection={item.icon}
				onClick={item.onClick}
				px={12}
				py={8}
			>
				<Label size="md" singleLine>{item.label}</Label>
			</Menu.Item>
		);
	};

	//
	// E. Render components

	return (
		<AppWrapperMenu icon={IconSettings}>
			<Menu.Label>Personalização</Menu.Label>
			{MENU_ITEMS.slice(0, 2).map(renderMenuItem)}
			<Menu.Divider />
			<Menu.Label>Conta</Menu.Label>
			{MENU_ITEMS.slice(2).map(renderMenuItem)}
		</AppWrapperMenu>
	);

	//
}
