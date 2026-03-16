'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
<<<<<<< feature/iso-1173-implementacao-i18n-plans
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
=======
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Collapsible, Label, Section, useToast } from '@tmlmobilidade/ui';
>>>>>>> staging

/* * */

export function PlanDetailSectionFiles() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleDownload = async () => {
		try {
			// Open file.url in a new window
			window.open(API_ROUTES.plans.PLANS_DETAIL_OPERATION_FILE_DOWNLOAD(planDetailContext.data.id), '_blank');
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro ao transferir ficheiro',
				title: 'Erro ao transferir ficheiro',
			});
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('plans:plans.detail.PlansDetailSectionFiles.description')}
			title={t('plans:plans.detail.PlansDetailSectionFiles.title')}
		>

			<Section gap="sm">
				{planDetailContext.data.operation_file ? (
					<FileComponent
						fileData={planDetailContext.data.operation_file}
						onClick={handleDownload}
					/>
				) : (
					<Label>{t('plans:plans.detail.PlansDetailSectionFiles.empty_state.label')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
