'use client';

/* * */

import { IconDeviceFloppy, IconRoute } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
		<Toolbar>

			{/* <Button
				disabled={!stopsEditorContext.data.hasUnsavedChanges}
				icon={<IconArrowBackUp />}
				label="Reverter"
				onClick={() => stopsEditorContext.actions.revertPath()}
				variant="secondary"
			/> */}

			<Button
				icon={<IconRoute />}
				label="Recalcular percurso"
				onClick={() => void stopsEditorContext.actions.convertShapeToEditable()}
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
	);

	//
}
