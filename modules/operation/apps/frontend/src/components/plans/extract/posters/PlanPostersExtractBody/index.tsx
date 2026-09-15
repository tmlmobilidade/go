'use client';

import { type PlanPostersContentMode, type PlanPostersFilterMode } from '@tmlmobilidade/go-types-downloads';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Divider, Section, SegmentedControl, Select, TagsInput } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePlanPostersExtractFormContext } from '../PlanPostersExtract.context';

/* * */

const canvasProfileOptions = [
	{ label: 'Canvas A', value: '0Master.A' },
	{ label: 'Canvas B', value: '0Master.B' },
	{ label: 'Canvas C', value: '0Master.C' },
	{ label: 'Canvas F', value: '0Master.F' },
];

/* * */

export function PlanPostersExtractBody() {
	//

	//
	// A. Setup variables

	const context = usePlanPostersExtractFormContext();
	const { t } = useTranslation();

	const plansOptions = useMemo(() => context.data.plans
		.filter(plan => plan.agency_id === context.data.agencyId)
		.map((plan) => {
			const startDate = Dates.fromOperationalDateInt(plan.active_from, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDateInt(plan.active_until, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [context.data.agencyId, context.data.plans]);

	//
	// D. Render components

	return (
		<>
			<Divider />

			<Section gap="md">
				<Select
					data={context.data.agencyOptions}
					description="Os planos e as opções de exportação são apresentados para este operador"
					label="Selecionar operador"
					onChange={context.actions.setAgencyId}
					value={context.data.agencyId}
					w="100%"
				/>
			</Section>
			<Divider />

			<Section gap="md">
				<Select
					data={plansOptions}
					description="Selecione um plano"
					disabled={!context.data.agencyId}
					label="Selecionar plano"
					onChange={context.actions.setPlanId}
					value={context.data.planId}
					w="100%"
				/>
			</Section>
			<Divider />

			{context.data.planId && (
				<Section gap="md">
					<SegmentedControl
						fullWidth={true}
						label="Conteúdo a exportar"
						onChange={value => context.actions.setContentMode(value as PlanPostersContentMode)}
						value={context.data.contentMode}
						data={[
							{ label: 'Tudo', value: 'all' },
							{ label: 'Linhas', value: 'lines' },
							{ label: 'Paragens', value: 'stops' },
							{ label: t('default:posterExport.linesAndStops'), value: 'lines_stops' },
						]}
					/>

					{context.data.contentMode !== 'all' && (
						<SegmentedControl
							fullWidth={true}
							label={context.data.contentMode === 'lines_stops' ? t('default:posterExport.combinedFilter') : context.data.contentMode === 'lines' ? 'Filtro de linhas' : 'Filtro de paragens'}
							onChange={value => context.actions.setFilterMode(value as PlanPostersFilterMode)}
							value={context.data.filterMode}
							data={[
								{ label: 'Apenas selecionadas', value: 'include' },
								{ label: 'Todas exceto selecionadas', value: 'exclude' },
							]}
						/>
					)}

					{(context.data.contentMode === 'lines' || context.data.contentMode === 'lines_stops') && (
						<TagsInput
							description={t('shared:filters.TagFilter.description')}
							label={context.data.filterMode === 'include' ? 'IDs das linhas a exportar' : 'IDs das linhas a excluir'}
							onChange={context.actions.setLineIds}
							placeholder={t('shared:filters.TagFilter.placeholder')}
							splitChars={[' ', ',', ';', '|']}
							value={context.data.lineIds}
							w="100%"
						/>
					)}

					{(context.data.contentMode === 'stops' || context.data.contentMode === 'lines_stops') && (
						<TagsInput
							description={t('shared:filters.TagFilter.description')}
							label={context.data.filterMode === 'include' ? 'IDs das paragens a exportar' : 'IDs das paragens a excluir'}
							onChange={context.actions.setStopIds}
							placeholder={t('shared:filters.TagFilter.placeholder')}
							splitChars={[' ', ',', ';', '|']}
							value={context.data.stopIds}
							w="100%"
						/>
					)}

					{context.data.contentMode !== 'all' && (
						<Select
							data={canvasProfileOptions}
							description="Este perfil será aplicado às paragens exportadas"
							label="Canvas profile"
							onChange={value => context.actions.setCanvasProfile(value as typeof context.data.canvasProfile)}
							value={context.data.canvasProfile}
							w="100%"
						/>
					)}

				</Section>
			)}
		</>
	);

	//
}
