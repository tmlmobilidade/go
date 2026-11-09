'use client';

import { closeModal, openModal } from '@mantine/modals';

import styles from '../shared/changelog-modal.module.css';

import { ChangelogList } from './ChangelogList';

/* * */

const MODAL_ID = 'changelog-list';

/* * */

export function openChangelogListModal(title: string) {
	openModal({
		'aria-label': title,
		'children': <ChangelogList onClose={closeChangelogListModal} />,
		'classNames': { body: styles.body, content: styles.content },
		'modalId': MODAL_ID,
		'padding': 0,
		'size': 800,
		'withCloseButton': false,
	});
}

export function closeChangelogListModal() {
	closeModal(MODAL_ID);
}
