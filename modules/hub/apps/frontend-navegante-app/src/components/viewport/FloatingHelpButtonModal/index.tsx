'use client';

import { Modal, ModalBody } from '@mantine/core';

interface FloatingHelpButtonModalProps {
	isOpen: boolean
	onClose: () => void
}

/* * */

export function FloatingHelpButtonModal({ isOpen, onClose }: FloatingHelpButtonModalProps) {
	//

	//
	// A. Render components

	return (
		<Modal
			onClose={onClose}
			opened={isOpen}
			size="lg"
			title="Help"
		>
			<ModalBody>
				<p>Hello</p>
			</ModalBody>
		</Modal>
	);
}
