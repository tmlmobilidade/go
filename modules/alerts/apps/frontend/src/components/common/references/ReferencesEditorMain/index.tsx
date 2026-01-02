'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorLines } from '@/components/common/references/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/common/references/ReferencesEditorRides';
import { ReferencesEditorStops } from '@/components/common/references/ReferencesEditorStops';
import { AlertReferenceTypeSchema } from '@tmlmobilidade/types';
import { Tabs } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function ReferencesEditorMain() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const referenceTypeOptions = AlertReferenceTypeSchema.options.map((value) => {
		switch (value) {
			case 'lines':
				return { label: 'Linhas', value };
			case 'rides':
				return { label: 'Circulações', value };
			case 'stops':
				return { label: 'Paragens', value };
		}
	});

	//
	// C. Render components

	return (
		<Tabs
			onChange={referencesEditorContext.actions.changeReferenceType}
			value={referencesEditorContext.data.selected_reference_type}
		>

			<div className={styles.tabs}>
				<Tabs.List grow>
					{referenceTypeOptions.map(option => (
						<Tabs.Tab key={option.value} value={option.value}>
							{option.label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</div>

			{referenceTypeOptions.map(option => (
				<Tabs.Panel key={option.value} value={option.value}>
					{option.value === 'lines' && <ReferencesEditorLines />}
					{option.value === 'stops' && <ReferencesEditorStops />}
					{option.value === 'rides' && <ReferencesEditorRides />}
				</Tabs.Panel>
			))}

		</Tabs>
	);
}
