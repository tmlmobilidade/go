'use client';

import { Menu } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { IconDownload, IconFileTypeZip, IconTrash } from '@tabler/icons-react';
import { mimeTypes } from '@tmlmobilidade/consts';
import { type ComponentPropsWithRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Label } from '../../display/Label';

/* * */

interface FileItemProps {
	fileName: string
	fileType: string
	onDelete?: () => void
	onDownload?: () => void
}

/* * */

const FILE_ICON_MAP = {
	[mimeTypes.zip]: <IconFileTypeZip size={28} />,
};

/* * */

function FileItemBody({ fileName, fileType, ref, ...props }: ComponentPropsWithRef<'div'> & Pick<FileItemProps, 'fileName' | 'fileType'>) {
	return (
		<div {...props} ref={ref} className={styles.body}>
			{FILE_ICON_MAP[fileType]}
			<Label>{fileName}</Label>
		</div>
	);
}

/* * */

export function FileItem({ fileName, fileType, onDelete, onDownload }: FileItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleConfirmDelete = () => {
		openConfirmModal({
			children: <Label>{t('shared:components.files.FileItem.actions.delete.confirmation_description')}</Label>,
			closeOnClickOutside: true,
			confirmProps: { variant: 'danger' },
			labels: {
				cancel: t('shared:components.files.FileItem.actions.delete.confirmation_cancel'),
				confirm: t('shared:components.files.FileItem.actions.delete.confirmation_confirm'),
			},
			onConfirm: onDelete,
			title: t('shared:components.files.FileItem.actions.delete.confirmation_title'),
		});
	};

	//
	// C. Render components

	return (
		<Menu trigger="click">

			<Menu.Target>
				<FileItemBody
					fileName={fileName}
					fileType={fileType}
				/>
			</Menu.Target>

			<Menu.Dropdown>

				<Menu.Item
					leftSection={<IconDownload size={20} />}
					onClick={onDownload}
				>
					{t('shared:components.files.FileItem.actions.download.label')}
				</Menu.Item>

				{onDelete && (
					<Menu.Item
						color="red"
						leftSection={<IconTrash size={20} />}
						onClick={handleConfirmDelete}
					>
						{t('shared:components.files.FileItem.actions.delete.label')}
					</Menu.Item>
				)}

			</Menu.Dropdown>

		</Menu>
	);
}
