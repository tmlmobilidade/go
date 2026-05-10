'use client';

import { Accordion as MantineAccordion } from '@mantine/core';
import { type PropsWithChildren, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

interface CollapsibleProps {
	defaultOpen?: boolean
	description?: string
	icon?: ReactNode
	title: string
}

/**
 * A Collapsible is a primary layout component that should be used to handle different sections of a pane.
 * For example, it can be used to show or hide the different sections of a form while keeping the interface
 * clean and organized. It is based on the Accordion component from Mantine. Since this is the most frequent
 * interaction pattern, it is recommended to avoid using nested Accordions and instead use multiple top-level
 * Collapsibles for each section of the page.
 * @param defaultOpen Whether the Collapsible should be open by default.
 * @param description An optional description to be displayed below the title.
 * @param icon An optional icon to be displayed next to the title.
 * @param title The title of the Collapsible. Try to keep it short, one or two words is recommended.
 * @param children The content of the Collapsible.
 */
export function Collapsible({ children, defaultOpen = false, description, icon, title }: PropsWithChildren<CollapsibleProps>) {
	return (
		<MantineAccordion classNames={styles} defaultValue={defaultOpen ? 'section' : undefined}>
			<MantineAccordion.Item value="section">
				<MantineAccordion.Control>
					{icon && <span className={styles.icon}>{icon}</span>}
					{title && <p className={styles.title}>{title}</p>}
					{description && <p className={styles.description}>{description}</p>}
				</MantineAccordion.Control>
				<MantineAccordion.Panel>
					{children}
				</MantineAccordion.Panel>
			</MantineAccordion.Item>
		</MantineAccordion>
	);
}
