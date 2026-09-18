'use client';

import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { IconX } from '@tabler/icons-react';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { Modal } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AlertDetailModalProps {
	alert: HubV1ApiAlert
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
			<Modal.Body>
				<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
				<p className={styles.description}>{alert.description}</p>
			</Modal.Body>
		</Modal>
	);
}
