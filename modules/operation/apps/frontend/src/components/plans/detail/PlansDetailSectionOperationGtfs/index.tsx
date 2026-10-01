'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Collapsible, FileItem, Grid, Label, NoDataLabel, Section } from '@tmlmobilidade/ui';

/* * */

export function PlansDetailSectionOperationGtfs() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Handle actions

	const handleDownloadOperationGtfs = async () => {
		window.open(API_ROUTES.operation.PLANS_DETAIL_OPERATION_GTFS_DOWNLOAD(planDetailContext.data.id), '_blank');
	};

	const handleDownloadOperationGtfsNormalized = async () => {
		window.open(API_ROUTES.operation.PLANS_DETAIL_OPERATION_GTFS_NORMALIZED_DOWNLOAD(planDetailContext.data.id), '_blank');
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Arquivo GTFS de operação."
			title="Plano de Operação"
		>
			<Section>
				<Grid columns="ab" gap="sm">

					<Section gap="sm" padding="none">
						<Label caps>Plano de Operação Original</Label>
						{planDetailContext.data.operation_gtfs ? (
							<FileItem
								fileName={planDetailContext.data.operation_gtfs.name}
								fileType={planDetailContext.data.operation_gtfs.type}
								onDownload={handleDownloadOperationGtfs}
							/>
						) : (
							<NoDataLabel text="Nenhum ficheiro disponível" />
						)}
					</Section>

					<Section gap="sm" padding="none">
						<Label caps>Plano de Operação Normalizado</Label>
						{planDetailContext.data.operation_gtfs_normalized ? (
							<FileItem
								fileName={planDetailContext.data.operation_gtfs_normalized.name}
								fileType={planDetailContext.data.operation_gtfs_normalized.type}
								onDownload={handleDownloadOperationGtfsNormalized}
							/>
						) : (
							<NoDataLabel text="Nenhum ficheiro disponível" />
						)}
					</Section>

				</Grid>
			</Section>
		</Collapsible>
	);
}
