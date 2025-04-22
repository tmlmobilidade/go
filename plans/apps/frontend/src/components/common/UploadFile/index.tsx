import { IconFileZip } from '@tabler/icons-react';
import { ComponentWrapper, DeleteActionIcon, FileButton, Label, Section, useToast } from '@tmlmobilidade/ui';
import React, { useEffect, useState } from 'react';

import styles from './styles.module.css';

interface UploadFileProps {
	fileName?: string
	fileUrl?: string
	label?: string
	maxFileSize?: number
	maxHeight?: number
	maxWidth?: number
	onFileChange?: (file: File) => void
}

export function UploadFile({
	fileName,
	fileUrl,
	label,
	maxFileSize = 6 * 1024 * 1024, // 5MB default
	onFileChange,
}: UploadFileProps) {
	//

	//
	// A. Setup variables
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<null | string>(fileUrl ?? null);
	const [name, setName] = useState<string | undefined>(fileName);

	useEffect(() => {
		setPreview(fileUrl ?? null);
	}, [fileUrl]);

	useEffect(() => {
		if (!fileName && file) {
			setName(file.name);
		}
	}, [fileName, file]);

	//
	// B. Handle File Change
	const handleFileChange = (file: File) => {
		setFile(file);
		if (file.size > maxFileSize) {
			useToast.error({
				message: 'O tamanho do ficheiro excede o limite permitido.',
				title: 'Erro ao carregar filem',
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = () => setPreview(reader.result as string);
		reader.readAsDataURL(file);

		onFileChange?.(file);
	};

	const handleDelete = () => {
		setPreview(null);
		setFile(null);
	};

	//
	// C. Render components
	const renderFilePreview = () => (
		<Section alignItems="center" gap="sm">
			<IconFileZip size={52} />
			<Label size="sm">{name}</Label>
			<div className={styles.deleteContainer}>
				<DeleteActionIcon onClick={handleDelete} />
			</div>
		</Section>
	);

	return (
		<div className={styles.container}>
			{label && <Label>{label}</Label>}
			<ComponentWrapper className={styles.fileContainer}>
				{preview ? (
					renderFilePreview()
				) : (
					<FileButton
						accept="application/zip"
						label="Carregar arquivo GTFS"
						onFileChange={handleFileChange}
					/>
				)}
			</ComponentWrapper>
		</div>
	);
}
