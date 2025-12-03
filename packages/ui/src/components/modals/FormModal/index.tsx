/* * */

import { Modal } from '@mantine/core';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';

/* * */

interface FormModalProps {

	/**
	 * An array of React components to be rendered as rows inside a fixed header.
	 * This is useful for rendering a title, a toolbar, or any other component that
	 * should be fixed at the top of the pane. The header will be rendered above the children.
	 */
	header?: React.ReactNode[]

	/**
	 * Indicates whether the modal is open or closed.
	 * @default true
	 */
	isOpen?: boolean

	/**
	 * Function to be called when the modal is requested to be closed.
	 */
	onClose: () => void

}

/* * */

export function FormModal({ children, header, isOpen = true, onClose }: PropsWithChildren<FormModalProps>) {
	return (
		<Modal
			closeOnClickOutside={false}
			onClose={onClose}
			opened={isOpen}
			padding={0}
			radius={0}
			size="xl"
			styles={{ content: { backgroundColor: 'transparent' } }}
			withCloseButton={false}
			centered
		>
			<Surface>
				{header && (
					<div className={styles.header}>
						{header.map((headerRow, index) => (
							<div key={index} className={styles.headerRow}>
								{headerRow}
							</div>
						))}
					</div>
				)}
				{children && (
					<div className={styles.children}>
						{children}
					</div>
				)}
			</Surface>
		</Modal>
	);
}
