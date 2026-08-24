'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '../Button';

/* * */

interface UpdateButtonProps {
	isDisabled?: boolean
	isLoading?: boolean
	onClick: () => void
}

/* * */

export function UpdateButton({ isDisabled, isLoading, onClick }: UpdateButtonProps) {
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
		<Button
			disabled={isDisabled}
			label={t('shared:components.buttons.UpdateButton.label')}
			loading={isLoading}
			onClick={handleClick}
			variant="primary"
		/>
	);
}
