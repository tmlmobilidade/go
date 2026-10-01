'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '../Button';

/* * */

interface CreateButtonProps {
	isDisabled?: boolean
	isLoading?: boolean
	onClick: () => void
}

/* * */

export function CreateButton({ isDisabled, isLoading, onClick }: CreateButtonProps) {
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
			label={t('shared:components.buttons.CreateButton.label')}
			loading={isLoading}
			onClick={handleClick}
			variant="primary"
		/>
	);
}
