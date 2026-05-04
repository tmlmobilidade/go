'use client';

/* * */

import styles from './styles.module.css';

import { ShapeEditorContent } from '../ShapeEditorContent';
import { ShapeEditorFooter } from '../ShapeEditorFooter';

/* * */

export function ShapeEditor() {
	//

	//
	// A. Setup variables

	return (
		<div className={styles.container}>

			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header */}
				<div className={styles.header} />

				{/* Scrollable Content */}
				<div className={styles.content}>
					<ShapeEditorContent />
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<ShapeEditorFooter />
				</div>
			</div>
		</div>
	);
}
