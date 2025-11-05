'use client';

/* * */

import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import React from 'react';

/* * */

export interface ButtonProps extends MantineButtonProps {
	href?: string
	icon?: React.ReactNode
	label?: string
	onClick?: () => void
	target?: string
	type?: 'button' | 'reset' | 'submit'
	variant?: 'danger' | 'disabled' | 'muted' | 'primary' | 'secondary' | 'transparent'
}

/* * */

export function Button({ disabled, href, icon, label, loading, onClick, type = 'button', variant = 'primary', ...props }: ButtonProps) {
	//

	//
	// A. Transform data

	if (disabled) {
		variant = 'disabled';
	}

	//
	// B. Render components

	return (
		<MantineButton
			component={href ? 'a' : 'button'}
			disabled={disabled || loading}
			href={href}
			leftSection={icon && icon}
			loading={loading}
			onClick={onClick}
			type={type}
			variant={variant}
			{...props}
		>
			{label}
		</MantineButton>
	);

	//
}
