'use client';

/* * */

import { MapContextProvider, Modal } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { ShapeEditor } from './ShapeEditor';
import { ShapeEditorContextProvider } from './ShapeEditor.context';

/* * */

interface ShapeEditorModalProps {
	onClose: () => void
	opened: boolean
}

export function ShapeEditorModal({ onClose, opened }: ShapeEditorModalProps) {
	return (
		<Modal
			classNames={{ body: styles.modalBody, content: styles.modalContent }}
			closeOnClickOutside={false}
			closeOnEscape={false}
			onClose={onClose}
			opened={opened}
			padding={0}
			size="100%"
			withCloseButton={false}
		>
			{opened && (
				<MapContextProvider>
					<ShapeEditorContextProvider onClose={onClose}>
						<ShapeEditor />
					</ShapeEditorContextProvider>
				</MapContextProvider>
			)}
		</Modal>
	);
}
