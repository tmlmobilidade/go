'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorLines } from '@/components/common/references/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/common/references/ReferencesEditorRides';
import { ReferencesEditorStops } from '@/components/common/references/ReferencesEditorStops';
import { AlertReferenceTypeSchema } from '@tmlmobilidade/types';
import { Grid, Section, Surface, Tabs } from '@tmlmobilidade/ui';

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
		<Surface>
			<Section padding="none">
				<Grid gap="md">
					<Tabs
						onChange={referencesEditorContext.actions.changeReferenceType}
						value={referencesEditorContext.data.selected_reference_type}
						// variant="outline"
					>
						<Tabs.List>
							{referenceTypeOptions.map(option => (
								<Tabs.Tab key={option.value} value={option.value}>
									{option.label}
								</Tabs.Tab>
							))}
						</Tabs.List>

						<Tabs.Panel value="lines">
							<ReferencesEditorLines />
						</Tabs.Panel>

						<Tabs.Panel value="stops">
							<ReferencesEditorStops />
						</Tabs.Panel>

						<Tabs.Panel value="rides">
							<ReferencesEditorRides />
						</Tabs.Panel>
					</Tabs>

					{/* <SegmentedControl
					data={referenceTypeOptions}
					onChange={referencesEditorContext.actions.changeReferenceType}
					value={referencesEditorContext.data.selected_reference_type}
					fullWidth
				/> */}

					{/* {referencesEditorContext.data.selected_reference_type === 'lines' && (
					<ReferencesEditorLines />
				)} */}

					{/* {referencesEditorContext.data.selected_reference_type === 'stops' && (
					<ReferencesEditorStops />
				)} */}

					{/* {referencesEditorContext.data.selected_reference_type === 'rides' && (
					<ReferencesEditorRides />
				)} */}

				</Grid>
			</Section>
		</Surface>
	);
}
