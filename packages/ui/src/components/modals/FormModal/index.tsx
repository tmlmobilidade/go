/* * */

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

}

/* * */

export function FormModal({ children, header }: PropsWithChildren<FormModalProps>) {
	return (
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
	);
}
