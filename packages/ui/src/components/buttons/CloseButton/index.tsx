'use client';

/* * */

import { CloseButton as MantineCloseButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';

/* * */

interface BackButtonProps {
	onClick?: () => void
	type?: 'back' | 'close'
}

/* * */

export function CloseButton({ onClick, type = 'back' }: BackButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		if (onClick) onClick();
	};

	//
	// B. Render components

	if (type === 'back') {
		return <MantineCloseButton icon={<IconChevronLeft />} onClick={handleClick} />;
	}

	return <MantineCloseButton onClick={handleClick} />;

	//
}
