'use client';

import { ReferencesEditorMain } from '@/components/references/ReferencesEditorMain';
import { type ReferencesEditorContextProps, ReferencesEditorContextProvider } from '@/components/references/shared/ReferencesEditor.context';

/* * */

export function ReferencesEditor(props: ReferencesEditorContextProps) {
	return (
		<ReferencesEditorContextProvider {...props}>
			<ReferencesEditorMain />
		</ReferencesEditorContextProvider>
	);
}
