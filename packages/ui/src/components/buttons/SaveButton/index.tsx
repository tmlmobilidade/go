'use client';

/* * */

import { Tooltip } from '../../common/Tooltip';
import { Button } from '../Button';

/* * */

interface SaveButtonProps {
	disabled?: boolean
	loading?: boolean
	onClick: () => void
}

/* * */

export function SaveButton({ disabled, loading, onClick }: SaveButtonProps) {
	//

	//
	// A. Handle actions

	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (loading || disabled) return;
		// Trigger the onClick action
		onClick();
	};

	//
	// B. Render components

	return (
		<Tooltip
			disabled={disabled}
			label="Guardar Alterações"
			position="bottom"
			withArrow
		>
			<Button
				disabled={disabled}
				label="Guardar"
				loading={loading}
				onClick={handleClick}
				variant="primary"
			/>
		</Tooltip>
	);

	//
}
