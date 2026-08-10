'use client';

/* * */

import { IconArrowBackUp, IconArrowForwardUp, IconDeviceFloppy, IconRoute } from '@tabler/icons-react';
import { Button, IconButton, Spacer, Toolbar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';

/* * */

export function ShapeEditorFooter() {
	//

	//
	// A. Setup variables

	const stopsEditorContext = useStopsEditorContext();

	//
	// B. Handle actions

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Toolbar>
				<Button
					icon={<IconRoute />}
					label="Recalcular percurso"
					onClick={() => void stopsEditorContext.actions.convertShapeToEditable()}
				/>

				<IconButton
					disabled={!stopsEditorContext.flags.canUndo}
					icon={<IconArrowBackUp size={18} />}
					onClick={() => stopsEditorContext.actions.undo()}
					tooltip="Desfazer"
					variant="primary"
				/>

				<IconButton
					disabled={!stopsEditorContext.flags.canRedo}
					icon={<IconArrowForwardUp size={18} />}
					onClick={() => stopsEditorContext.actions.redo()}
					tooltip="Refazer"
					variant="primary"
				/>

				<Spacer />

				<Button
					label="Cancelar"
					onClick={() => stopsEditorContext.actions.cancel()}
					variant="danger"
				/>

				<Button
					icon={<IconDeviceFloppy />}
					label="Guardar"
					onClick={() => stopsEditorContext.actions.submit()}
				/>
			</Toolbar>
		</div>
	);

	//
}
