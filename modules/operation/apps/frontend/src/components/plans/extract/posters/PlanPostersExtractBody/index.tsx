'use client';

import { type PlanPostersContentMode, type PlanPostersFilterMode } from '@tmlmobilidade/go-types-downloads';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Divider, MultiSelect, Section, SegmentedControl, Select, TagsInput } from '@tmlmobilidade/ui';
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

	const plansOptions = useMemo(() => context.data.agencyIds.map(agencyId => ({
		agencyId,
		agencyLabel: context.data.agencyOptions.find(option => option.value === agencyId)?.label ?? agencyId,
		options: context.data.plans.filter(plan => plan.agency_id === agencyId).map((plan) => {
			const startDate = Dates.fromOperationalDateInt(plan.active_from, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDateInt(plan.active_until, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				disabled: !plan.attachments.operation_gtfs_normalized,
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}),
		value: context.data.plans.find(plan => plan.agency_id === agencyId && context.data.planIds.includes(plan._id))?._id ?? null,
	})), [context.data.agencyIds, context.data.agencyOptions, context.data.planIds, context.data.plans]);

	//
	// D. Render components

	return (
		<>
			<Divider />

			<Section gap="md">
				<MultiSelect
					data={context.data.agencyOptions}
					description={t('default:posterExport.agenciesDescription')}
					label={t('default:posterExport.agenciesLabel')}
					onChange={context.actions.setAgencyIds}
					value={context.data.agencyIds}
					w="100%"
				/>
			</Section>
			<Divider />

			{plansOptions.length > 0 && (
				<>
					<Section gap="md">
						{plansOptions.map(({ agencyId, agencyLabel, options, value }) => (
							<Select
								key={agencyId}
								data={options}
								description={t('default:posterExport.planDescription')}
								label={`${t('default:posterExport.planLabel')} · ${agencyLabel}`}
								onChange={value => context.actions.setPlanId(agencyId, value)}
								value={value}
								w="100%"
							/>
						))}
					</Section>
					<Divider />
				</>
			)}

			{context.data.planIds.length > 0 && (
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
