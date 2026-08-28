/* * */

import { Button as MantineButton, type ButtonGroupProps as MantineButtonGroupProps } from '@mantine/core';

import styles from './styles.module.css';

/* * */

export interface ButtonGroupProps extends MantineButtonGroupProps {
	buttons: { action: string, icon?: React.ReactNode, label?: string, onclick: () => void, variant?: 'danger' | 'disabled' | 'muted' | 'primary' | 'secondary' }[]
}

/* * */

export function ButtonGroup({ buttons }: ButtonGroupProps) {
	//
	//

	// A. Render Components
	return (
		<MantineButton.Group className={styles.buttonGroup}>
			{buttons.map((button, index) => (
				<MantineButton key={index} onClick={button.onclick} variant={button.variant}>
					{button.label && button.label}
					{button.icon && button.icon}
				</MantineButton>
			))}
		</MantineButton.Group>
	);

	//
};
