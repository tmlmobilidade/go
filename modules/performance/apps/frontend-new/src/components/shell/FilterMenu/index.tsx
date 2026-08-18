'use client';

/* * */

import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { Popover } from '@tmlmobilidade/ui';
import { createElement, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export interface FilterMenuOption {
	description?: string
	label: string
	value: string
}

interface FilterMenuProps {
	icon: React.ElementType
	label: string
	onChange: (value: string) => void
	options: FilterMenuOption[]
	rightSection?: ReactNode
	value: string
	valueLabel: string
}

/* * */

export function FilterMenu({ icon, label, onChange, options, rightSection, value, valueLabel }: FilterMenuProps) {
	return (
		<Popover offset={6} position="bottom-start" shadow="md" width={280}>
			<Popover.Target>
				<button aria-label={`${label}: ${valueLabel}`} className={styles.trigger} type="button">
					<span className={styles.icon}>{createElement(icon, { size: 19, stroke: 1.8 })}</span>
					<span className={styles.label}>{label}</span>
					<strong className={styles.value}>{valueLabel}</strong>
					{rightSection ?? <IconChevronDown aria-hidden="true" className={styles.chevron} size={16} />}
				</button>
			</Popover.Target>

			<Popover.Dropdown className={styles.dropdown}>
				<div aria-label={label} className={styles.options} role="menu">
					{options.map(option => (
						<button
							key={option.value}
							className={styles.option}
							data-selected={option.value === value}
							onClick={() => onChange(option.value)}
							role="menuitemradio"
							type="button"
						>
							<span>
								<strong>{option.label}</strong>
								{option.description && <small>{option.description}</small>}
							</span>
							{option.value === value && <IconCheck aria-hidden="true" size={17} />}
						</button>
					))}
				</div>
			</Popover.Dropdown>
		</Popover>
	);
}
