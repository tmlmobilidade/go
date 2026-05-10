'use client';

import { FileInput, Stack } from '@mantine/core';

import { Button } from '../../buttons';
import { Grid } from '../../layout';

/* * */

interface GeoJsonInputProps {
	disabled?: boolean
	error?: string
	label?: string
	onChange?: (value: unknown) => void
	onError?: (error: string | undefined) => void
	onRemove?: () => void
	onUpdateMap?: () => void
}

export function GeoJsonInput({
	disabled,
	error,
	label = 'GeoJSON',
	onChange,
	onError,
	onRemove,
	onUpdateMap,
}: GeoJsonInputProps) {
	//

	//
	// A. Handle actions

	const handleFile = async (file: File | null) => {
		if (!file) return;

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			onChange?.(parsed);
		}
		catch {
			onError?.('Invalid GeoJSON file');
		}
	};

	const handleRemove = () => {
		onChange?.(null);
		onRemove?.();
	};

	//
	// B. Render components

	return (
		<Stack gap="xs">
			<FileInput
				accept=".json,.geojson,application/geo+json"
				disabled={disabled}
				error={error}
				label={label}
				onChange={handleFile}
				placeholder="Upload GeoJSON file"
			/>

			<Grid columns="ab" gap="md">
				<Button
					label="Atualizar"
					onClick={onUpdateMap}
				/>

				<Button
					label="Remover"
					onClick={handleRemove}
					variant="danger"
				/>
			</Grid>
		</Stack>
	);
}
