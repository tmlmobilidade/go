/* * */

import styles from './styles.module.css';

import { Surface } from '../../layout/Surface';

/* * */

interface PaneProps {

	/**
	 * A set of or a single React component to be rendered inside
	 * an auto-overflowing content pane. This is the main content of the pane.
	 * The pane will automatically add a scrollbar if the content overflows the pane.
	 */
	children?: React.ReactNode

	/**
	 * An array of React components to be rendered as rows inside a fixed header.
	 * This is useful for rendering a title, a toolbar, or any other component that
	 * should be fixed at the top of the pane. The header will be rendered above the children.
	 */
	header?: React.ReactNode[]

}

/* * */

export function Pane({ children, header }: PaneProps) {
	return (
		<Surface height="full">
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
