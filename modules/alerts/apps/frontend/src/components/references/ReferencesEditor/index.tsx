'use client';

import { type ReferencesEditorContextProps, ReferencesEditorContextProvider } from '@/components/references/ReferencesEditor.context';
import { ReferencesEditorMain } from '@/components/references/ReferencesEditorMain';

/* * */

export function ReferencesEditor(props: ReferencesEditorContextProps) {
	return (
		<ReferencesEditorContextProvider {...props}>
			<ReferencesEditorMain />
		</ReferencesEditorContextProvider>
	);
}
