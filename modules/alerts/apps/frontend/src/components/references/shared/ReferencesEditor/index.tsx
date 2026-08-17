'use client';

import { type ReferencesEditorContextProps, ReferencesEditorContextProvider } from '@/components/references/shared/ReferencesEditor.context';
import { ReferencesEditorMain } from '@/components/references/shared/ReferencesEditorMain';

/* * */

export function ReferencesEditor(props: ReferencesEditorContextProps) {
	return (
		<ReferencesEditorContextProvider {...props}>
			<ReferencesEditorMain />
		</ReferencesEditorContextProvider>
	);
}
