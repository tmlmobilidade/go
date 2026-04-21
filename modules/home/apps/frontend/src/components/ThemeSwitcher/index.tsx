'use client';
/* * */

import { type ModeType, useThemeContext } from '@/contexts/Theme.context';
import { IconDeviceDesktopFilled, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export function ThemeSwitcher() {
	//
	const themeContext = useThemeContext();

	const items: { _id: ModeType, icon: ReactNode, label: string }[] = [
		{ _id: 'light', icon: <IconSunFilled size={16} />, label: 'Claro' },
		{ _id: 'dark', icon: <IconMoonFilled size={16} />, label: 'Escuro' },
		{ _id: 'system', icon: <IconDeviceDesktopFilled size={16} />, label: 'Sistema' },
	];

	return (
		<div aria-label="Modo de aparência" className={styles.container} role="group">
			{items.map(item => (
				<button
					key={item._id}
					aria-label={item.label}
					className={styles.item}
					data-active={themeContext.data.active_mode === item._id}
					onClick={() => themeContext.actions.setMode(item._id)}
					type="button"
				>
					{item.icon}
				</button>
			))}
		</div>
	);
}
