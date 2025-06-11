/* * */

import { File } from '@/components/common/File';
import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
/* * */

export function PlanDetailSectionFiles() {
	//

	//
	// A. Setup variables
	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data

	//
	// C. Render components

	function renderFile() {
		return (
			<Section alignItems="flex-start" gap="md" justifyContent="flex-start">
				<File
					file={planDetailContext.data.plan.file}
				/>
			</Section>
		);
	}

	function renderEmpty() {
		return (
			<Section alignItems="flex-start" gap="md" justifyContent="flex-start">
				<Label>Nenhum ficheiro selecionado</Label>
			</Section>
		);
	}
	return (
		<Collapsible
			description="Ficheiros GTFS referentes a este plano."
			title="Ficheiros GTFS"
		>
			{planDetailContext.data.plan.operation_file_id ? renderFile() : renderEmpty()}
		</Collapsible>
	);
}
