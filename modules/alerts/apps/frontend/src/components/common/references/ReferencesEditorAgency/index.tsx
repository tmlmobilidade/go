'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { Label, Section } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorAgency() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			{referencesEditorContext.data.selected_references.length > 0 && (
				<Label variant="muted">Está a criar um aviso geral. Toda a rede do operador selecionado será afetada.</Label>
			)}

		</Section>
	);

	//
}
