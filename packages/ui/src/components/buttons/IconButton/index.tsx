'use client';

import { ActionIcon, FloatingPosition } from '@mantine/core';

import { Tooltip } from '../../common/Tooltip';

/* * */

interface LinkProps {
	href: string
	type: 'link'
}

interface ButtonProps {
	onClick: () => void
	type?: 'button'
}

type IconButtonProps = (ButtonProps | LinkProps) & {
	color?: string
	disabled?: boolean
	icon: React.ReactNode
	isLoading?: boolean
	isReadOnly?: boolean
	tooltip?: string
	tooltipOrienation?: FloatingPosition
	variant?: 'danger' | 'disabled' | 'muted' | 'primary' | 'secondary' | 'subtle'
};

/* * */

export function IconButton({ color, disabled, icon, isLoading, isReadOnly, tooltip, tooltipOrienation, variant = 'subtle', ...props }: IconButtonProps) {
	//

	//
	// A. Define variables
	const isLink = props.type === 'link';

	//
	// B. Handle actions
	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (isLoading || isReadOnly) return;

		// Trigger the onClick action
		if ('onClick' in props && props.onClick) {
			props.onClick();
		}
	};

	//
	// C. Render components

	const renderButton = () => {
		return (
			<ActionIcon
				color={color ?? 'var(--color-primary)'}
				component={isLink ? 'a' : 'button'}
				disabled={disabled}
				href={isLink ? (props as LinkProps).href : undefined}
				loading={isLoading}
				onClick={isLink ? undefined : handleClick}
				variant={variant}
			>
				{icon}
			</ActionIcon>
		);
	};

	return (
		tooltip ? (
			<Tooltip label={tooltip} position={tooltipOrienation} withArrow>
				{renderButton()}
			</Tooltip>
		) : (
			renderButton()
		)
	);
}
