'use client';

import { ActionIcon } from '@mantine/core';
import { IconLockFilled, IconLockOpen2 } from '@tabler/icons-react';

import { Tooltip } from '../../common/Tooltip';

/* * */

interface LockButtonProps {
	isDisabled?: boolean
	isLoading?: boolean
	isLocked: boolean
	onClick: () => void
}

/* * */

export function LockButton({ isDisabled, isLoading, isLocked, onClick }: LockButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (isLoading || isDisabled) return;
		// Trigger the onClick action
		onClick();
	};

	//
	// B. Render components

	if (isLocked) {
		return (
			<Tooltip
				label="Desbloquear"
				position="bottom"
				withArrow
			>
				<ActionIcon
					color="var(--color-status-success-primary)"
					disabled={isDisabled}
					loading={isLoading}
					onClick={handleClick}
					variant="subtle"
				>
					<IconLockFilled />
				</ActionIcon>
			</Tooltip>
		);
	}

	return (
		<Tooltip
			label="Bloquear"
			position="bottom"
			withArrow
		>
			<ActionIcon
				color="var(--color-primary)"
				disabled={isDisabled}
				loading={isLoading}
				onClick={handleClick}
				variant="subtle"
			>
				<IconLockOpen2 />
			</ActionIcon>
		</Tooltip>
	);

	//
}
