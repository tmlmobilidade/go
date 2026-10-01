'use client';

import { CloseButton as MantineCloseButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';

/* * */

interface CloseButtonProps {
	onClick?: () => void
	type?: 'back' | 'close'
}

/* * */

export function CloseButton({ onClick, type = 'back' }: CloseButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		if (onClick) onClick();
	};

	//
	// B. Render components

	if (type === 'back') {
		return <MantineCloseButton icon={<IconChevronLeft />} onClick={handleClick} size="lg" />;
	}

	return <MantineCloseButton onClick={handleClick} size="lg" />;

	//
}
