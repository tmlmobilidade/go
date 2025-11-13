'use client';

/* * */

import { ActionIcon } from '@mantine/core';
import { IconLockFilled, IconLockOpen2 } from '@tabler/icons-react';

/* * */

interface LockButtonProps {
	isLoading?: boolean
	isLocked: boolean
	isReadOnly?: boolean
	onClick: () => void
}

/* * */

export function LockButton({ isLoading, isLocked, isReadOnly, onClick }: LockButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (isLoading || isReadOnly) return;
		// Trigger the onClick action
		onClick();
	};

	//
	// B. Render components

	if (isLocked) {
		return (
			<ActionIcon
				color="var(--color-status-success-primary)"
				loading={isLoading}
				onClick={handleClick}
				variant="subtle"
			>
				<IconLockFilled />
			</ActionIcon>
		);
	}

	return (
		<ActionIcon
			color="var(--color-primary)"
			loading={isLoading}
			onClick={handleClick}
			variant="subtle"
		>
			<IconLockOpen2 />
		</ActionIcon>
	);

	//
}
