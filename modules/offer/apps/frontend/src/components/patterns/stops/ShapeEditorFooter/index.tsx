'use client';

/* * */

import { IconArrowBackUp, IconDeviceFloppy, IconRoute } from '@tabler/icons-react';
import { Button, IconButton, Spacer, Toolbar } from '@tmlmobilidade/ui';

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

			<Button
				disabled={!stopsEditorContext.data.hasUnsavedChanges}
				icon={<IconArrowBackUp />}
				label="Reverter"
				onClick={() => stopsEditorContext.actions.revertPath()}
				variant="secondary"
			/>

			<Button
				icon={<IconRoute />}
				label="Recalcular percurso"
				onClick={() => void stopsEditorContext.actions.convertShapeToEditable()}
			/>

			<Spacer />

			<Button
				icon={<IconDeviceFloppy />}
				label="Guardar"
				onClick={() => stopsEditorContext.actions.submit()}
			/>
			{/* <Button
				disabled={!ruleCreateContext.data.form.isValid()}
				label={ruleCreateContext.flags.isEditing ? 'Editar' : 'Criar'}
				onClick={ruleCreateContext.actions.submitRule}
			/> */}

		</Toolbar>
	);

	//
}
