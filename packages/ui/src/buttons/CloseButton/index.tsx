'use client';

import { CloseButton as MantineCloseButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';

/* * */

interface CloseButtonProps {
	ariaLabel?: string
	onClick?: () => void
	type?: 'back' | 'close'
}

/* * */

export function CloseButton({ ariaLabel, onClick, type = 'back' }: CloseButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		if (onClick) onClick();
	};

	//
	// B. Render components

	if (type === 'back') {
		return <MantineCloseButton aria-label={ariaLabel} icon={<IconChevronLeft />} onClick={handleClick} size="lg" />;
	}

	return <MantineCloseButton aria-label={ariaLabel} onClick={handleClick} size="lg" />;

	//
}
