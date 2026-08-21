'use client';

import { type ReferencesEditorContextProps, ReferencesEditorContextProvider } from '../ReferencesEditor.context';
import { ReferencesEditorMain } from '../ReferencesEditorMain';

/* * */

export function ReferencesEditor(props: ReferencesEditorContextProps) {
	return (
		<ReferencesEditorContextProvider {...props}>
			<ReferencesEditorMain />
		</ReferencesEditorContextProvider>
	);
}
