'use client';

import { useTranslation } from 'react-i18next';

import { Tooltip } from '../../components/common/Tooltip';
import { Button } from '../Button';

/* * */

interface UpdateButtonProps {
	disabled?: boolean
	loading?: boolean
	onClick: () => void
}

/* * */

export function UpdateButton({ disabled, loading, onClick }: UpdateButtonProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClick = () => {
		// If the button is loading or in read-only mode,
		// do not trigger the onClick action
		if (loading || disabled) return;
		// Trigger the onClick action
		onClick();
	};

	//
	// C. Render components

	return (
		<Tooltip
			disabled={disabled}
			label={t('shared:components.buttons.UpdateButton.tooltip')}
			position="bottom"
			withArrow
		>
			<Button
				disabled={disabled}
				label={t('shared:components.buttons.UpdateButton.label')}
				loading={loading}
				onClick={handleClick}
				variant="primary"
			/>
		</Tooltip>
	);
}
