'use client';

import { type ReferencesEditorContextProps, ReferencesEditorContextProvider } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorMain } from '@/components/common/references/ReferencesEditorMain';

/* * */

export function ReferencesEditor(props: ReferencesEditorContextProps) {
	return (
		<ReferencesEditorContextProvider {...props}>
			<ReferencesEditorMain />
		</ReferencesEditorContextProvider>
	);
}
