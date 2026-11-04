'use client';

import { ActionIcon } from '@mantine/core';
import { IconLockFilled, IconLockOpen2 } from '@tabler/icons-react';

import { Tooltip } from '../../components/common/Tooltip';

/* * */

interface LockButtonProps {
	isDisabled?: boolean
	isLoading?: boolean
	isLocked: boolean
	onClick: () => void
	tooltip?: string
}

/* * */

export function LockButton({ isDisabled, isLoading, isLocked, onClick, tooltip }: LockButtonProps) {
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
				label={tooltip ?? 'Desbloquear'}
				position="bottom"
				withArrow
			>
				<span>
					<ActionIcon
						color="var(--color-status-success-primary)"
						disabled={isDisabled}
						loading={isLoading}
						onClick={handleClick}
						variant="subtle"
					>
						<IconLockFilled />
					</ActionIcon>
				</span>
			</Tooltip>
		);
	}

	return (
		<Tooltip
			label={tooltip ?? 'Bloquear'}
			position="bottom"
			withArrow
		>
			<ActionIcon
				disabled={isDisabled}
				loading={isLoading}
				onClick={handleClick}
				variant="default"
			>
				<IconLockOpen2 />
			</ActionIcon>
		</Tooltip>
	);
}
