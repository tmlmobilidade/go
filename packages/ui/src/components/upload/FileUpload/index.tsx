'use client';

import { IconFileZip } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { useToast } from '../../../hooks';
import { ComponentWrapper } from '../../common';
import { Label } from '../../display';
import { Section } from '../../layout';
import { FileButton, FileButtonProps } from '../FileButton';

/* * */

interface FileUploadProps extends FileButtonProps {
	fileName?: string
	fileUrl?: string
	maxFileSize?: number
}

export function FileUpload({ accept, fileName, fileUrl, label, maxFileSize = 6 * 1024 * 1024, onFileChange }: FileUploadProps) {
	//

	//
	// A. Setup variables

	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<null | string>(fileUrl ?? null);
	const [name, setName] = useState<string | undefined>(fileName);

	//
	// B. Handle actions

	useEffect(() => {
		setPreview(fileUrl ?? null);
	}, [fileUrl]);

	useEffect(() => {
		if (!fileName && file) {
			setName(file.name);
		}
	}, [fileName, file]);

	const handleFileChange = (file: File) => {
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Ficheiro demasiado grande',
			});
			return;
		}
		setFile(file);
		const reader = new FileReader();
		reader.onload = () => setPreview(reader.result as string);
		reader.readAsDataURL(file);
		if (onFileChange) onFileChange(file);
	};

	//
	// C. Render components

	return (
		<ComponentWrapper>
			{preview ? (
				<Section alignItems="center" gap="sm">
					<IconFileZip size={52} />
					<Label size="sm">{name}</Label>
				</Section>
			) : (
				<FileButton
					accept={accept}
					label={label ?? 'Selecionar ficheiro'}
					onFileChange={handleFileChange}
				/>
			)}
		</ComponentWrapper>
	);

	//
}
