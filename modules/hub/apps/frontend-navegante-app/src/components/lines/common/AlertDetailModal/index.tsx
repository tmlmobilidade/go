'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { Modal, ModalBody } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface AlertDetailModalProps {
	alert: HubAlert
	isOpen: boolean
	onClose: () => void
}

/* * */

export function AlertDetailModal({ alert, isOpen, onClose }: AlertDetailModalProps) {
	//

	//
	// A. Render components

	return (
		<Modal
			classNames={{ body: styles.body, header: styles.header, title: styles.title }}
			closeButtonProps={{ icon: <IconX size={24} /> }}
			onClose={onClose}
			opened={isOpen}
			size="lg"
			title={alert.title}
		>
			<ModalBody>
				<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
				<p className={styles.description}>{alert.description}</p>
			</ModalBody>
		</Modal>
	);
}
