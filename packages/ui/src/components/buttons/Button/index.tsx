'use client';

import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import Link from 'next/link';
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

	const commonProps = {
		disabled: disabled || loading,
		leftSection: icon && icon,
		loading,
		onClick,
		type,
		variant,
		...props,
	};

	return href ? (
		<MantineButton component={Link}href={href}{...commonProps}>{label}</MantineButton>
	) : (
		<MantineButton {...commonProps}>{label}</MantineButton>
	);

	//
}
