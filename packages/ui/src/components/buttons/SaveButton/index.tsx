'use client';

/* * */

import { Tooltip } from '../../common/Tooltip';
import { Button } from '../Button';

/* * */

interface SaveButtonProps {
	isDisabled?: boolean
	isLoading?: boolean
	onClick: () => void
}

/* * */

export function SaveButton({ isDisabled, isLoading, onClick }: SaveButtonProps) {
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

	return (
		<Tooltip
			disabled={isDisabled}
			label="Guardar Alterações"
			position="bottom"
			withArrow
		>
			<Button
				disabled={isDisabled}
				label="Guardar"
				loading={isLoading}
				onClick={handleClick}
				variant="primary"
			/>
		</Tooltip>
	);

	//
}
