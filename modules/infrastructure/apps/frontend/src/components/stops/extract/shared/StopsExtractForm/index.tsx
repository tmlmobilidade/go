'use client';

import { Divider, Pane, type SelectDataItem } from '@tmlmobilidade/ui';

import { StopsExtractFooter } from '../StopsExtractFooter';
import { StopsExtractFormContextProvider, type StopsExtractionCreateSchema } from '../StopsExtractForm.context';
import { StopsExtractHeader } from '../StopsExtractHeader';
import { StopsExtractProperties } from '../StopsExtractProperties';

/* * */

interface StopsExtractFormProps {
	onClose: () => void
	schema: StopsExtractionCreateSchema
	showFacilitiesAndConnections?: boolean
	title: string
	versions: SelectDataItem[]
}

export function StopsExtractForm({ onClose, schema, showFacilitiesAndConnections = true, title, versions }: StopsExtractFormProps) {
	return (
		<StopsExtractFormContextProvider onClose={onClose} schema={schema}>
			<Pane header={[<StopsExtractHeader key="header" onClose={onClose} title={title} />]}>
				<StopsExtractProperties showFacilitiesAndConnections={showFacilitiesAndConnections} versions={versions} />
				<Divider />
				<StopsExtractFooter />
			</Pane>
		</StopsExtractFormContextProvider>
	);
}
