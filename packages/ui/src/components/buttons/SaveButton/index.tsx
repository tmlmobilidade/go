'use client';

/* * */

import { useTranslation } from 'react-i18next';

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
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (isLoading || isDisabled) return;
		// Trigger the onClick action
		onClick();
	};

	//
	// C. Render components

	return (
		<Tooltip
			disabled={isDisabled}
			label={t('shared:components.buttons.SaveButton.tooltip')}
			position="bottom"
			withArrow
		>
			<Button
				disabled={isDisabled}
				label={t('shared:components.buttons.SaveButton.label')}
				loading={isLoading}
				onClick={handleClick}
				variant="primary"
			/>
		</Tooltip>
	);

	//
}
