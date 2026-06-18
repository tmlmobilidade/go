'use client';

import { IconMessageCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './styles.module.css';

/* * */

export type FeedbackTriggerPosition = 'bottom-left' | 'bottom-right' | 'inline';
export type FeedbackTriggerVariant = 'brand' | 'default';

export interface FeedbackTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'onClick' | 'type'> {
	ariaLabel?: string
	className?: string
	icon?: ReactNode
	label?: string
	onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>
	position?: FeedbackTriggerPosition
	variant?: FeedbackTriggerVariant
	withBubble?: boolean
}

/* * */

export function FeedbackTrigger({
	ariaLabel,
	className,
	icon,
	label = 'Dá-nos o teu feedback',
	onClick,
	position = 'bottom-right',
	variant = 'default',
	withBubble = true,
	...props
}: FeedbackTriggerProps) {
	const accessibleLabel = ariaLabel || label || 'Feedback';
	const shouldShowBubble = withBubble && !!label;

	return (
		<button
			{...props}
			aria-label={accessibleLabel}
			className={clsx(styles.button, className)}
			data-label={label}
			data-position={position}
			data-variant={variant}
			data-with-bubble={shouldShowBubble}
			onClick={onClick}
			type="button"
		>
			{icon ?? <IconMessageCircle aria-hidden={true} size={24} stroke={2} />}
		</button>
	);
}
