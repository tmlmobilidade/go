'use client';

import { IconArrowBigUpLinesFilled } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';

import { Button } from '../../buttons/Button';

/* * */

export interface FileButtonProps {
	accept?: string
	disabled?: boolean
	icon?: ReactNode
	label: string
	loading?: boolean
	onCancel?: () => void
	onFileChange?: (file: File) => void
}

/* * */

export function FileButton({ accept, disabled, icon, label, loading, onCancel, onFileChange }: FileButtonProps) {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(loading ?? false);

	//
	// B. Handle actions

	const handleFileSelect = async () => {
		setIsLoading(true);
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = accept ?? '';
		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file && onFileChange) onFileChange(file);
			setIsLoading(false);
		};
		input.oncancel = () => {
			setIsLoading(false);
			onCancel?.();
		};
		input.click();
	};

	//
	// C. Render components

	return (
		<Button
			disabled={disabled}
			icon={icon ?? <IconArrowBigUpLinesFilled />}
			label={label}
			loading={isLoading}
			onClick={handleFileSelect}
		/>
	);

	//
}
