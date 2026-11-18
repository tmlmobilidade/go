'use client';

import { closeModal, openModal } from '@mantine/modals';
import { type ComponentProps } from 'react';

import styles from '../shared/changelog-modal.module.css';

import { ChangelogPreview } from './ChangelogPreview';

/* * */

const MODAL_ID = 'changelog-preview';

/* * */

export function openChangelogPreviewModal({ release, title }: Omit<ComponentProps<typeof ChangelogPreview>, 'onClose'>) {
	openModal({
		'aria-label': title,
		'children': <ChangelogPreview onClose={closeChangelogPreviewModal} release={release} title={title} />,
		'classNames': { body: styles.body, content: styles.content },
		'modalId': MODAL_ID,
		'padding': 0,
		'size': 800,
		'withCloseButton': false,
	});
}

export function closeChangelogPreviewModal() {
	closeModal(MODAL_ID);
}
