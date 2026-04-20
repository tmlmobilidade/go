'use client';
/* * */

import { AVAILABLE_MODES, useThemeContext } from '@/contexts/Theme.context';
import { IconCheck, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function ThemeSwitcher() {
	//
	const themeContext = useThemeContext();
	const triggerIcon = themeContext.data.resolved_mode === 'dark' ? <IconMoonFilled size={18} /> : <IconSunFilled size={18} />;
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={styles.container}>
			<button
				className={styles.trigger}
				onClick={() => setIsOpen(prev => !prev)}
				type="button"
			>
				{triggerIcon}
			</button>

			{isOpen && (
				<div className={styles.dropdown} role="menu">
					{AVAILABLE_MODES.map(item => (
						<button
							key={item._id}
							className={styles.item}
							type="button"
							onClick={() => {
								themeContext.actions.setMode(item._id);
								setIsOpen(false);
							}}
						>
							<span className={styles.itemIcon}>{item.icon}</span>
							<span className={styles.itemLabel}>{item.name}</span>
							{themeContext.data.active_mode === item._id && <IconCheck size={14} />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
