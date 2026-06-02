'use client';

import { useVkmModalContext, VkmModalContextProvider } from '@/contexts/VkmModal.context';
import { IconCalculator, IconRulerMeasure } from '@tabler/icons-react';
import { type VkmCalculationResult, type VkmExtensionSource, type VkmPeriodResult } from '@tmlmobilidade/types';
import { AgenciesContextProvider, Button, CloseButton, closeModal, Collapsible, DateInput, Divider, Grid, Label, Loader, openModal, Section, SegmentedControl, type SegmentedControlDataItem, Select, Spacer, Text, Toolbar, useAgenciesContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export const VKM_MODAL_ID = 'vkm-modal';

/* * */

const calculationMethodOptions: SegmentedControlDataItem[] = [
	{ label: 'Ano móvel', value: 'rolling_year' },
	{ label: 'Intervalo fixo', value: 'fixed_range' },
];

const extensionSourceOptions: { label: string, value: VkmExtensionSource }[] = [
	{ label: 'GO (recomendado)', value: 'go' },
	{ label: 'Stop times', value: 'stop_times' },
];

const methodLabels = {
	fixed_range: 'Intervalo fixo',
	rolling_year: 'Ano móvel',
} as const;

const sourceLabels = {
	go: 'GO',
	stop_times: 'Stop times',
} as const;

const sourceDescriptions = {
	go: 'Usa a extensão atualmente guardada no percurso e corresponde ao equivalente da antiga opção recomendada de shape (GO v1).',
	stop_times: 'Soma as distâncias entre paragens (`distance_delta`) ao longo do percurso.',
} as const;

const integerFormatter = new Intl.NumberFormat('pt-PT');
const kilometerFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const euroFormatter = new Intl.NumberFormat('pt-PT', { currency: 'EUR', style: 'currency' });
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2, style: 'percent' });

/* * */

export const openVkmModal = () => {
	openModal({
		children: (
			<AgenciesContextProvider>
				<VkmModalContextProvider>
					<VkmModal />
				</VkmModalContextProvider>
			</AgenciesContextProvider>
		),
		closeOnClickOutside: false,
		modalId: VKM_MODAL_ID,
		padding: 0,
		size: '80%',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};

/* * */

function formatOperationalDate(value: string) {
	return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`;
}

function formatKilometers(value: number) {
	return `${kilometerFormatter.format(value)} km`;
}

function buildOverviewCards(result: VkmCalculationResult) {
	return [
		{ label: 'Distância total', value: formatKilometers(result.total_from_distance) },
		{ label: 'Custo estimado', value: euroFormatter.format(result.total_in_euros) },
		...(result.inputs.calculation_method === 'rolling_year'
			? [{ label: 'Face ao contratado', value: percentFormatter.format(result.total_relative_to_contract) }]
			: []),
	];
}

function buildDayTypeCards(result: VkmCalculationResult) {
	return [
		{ label: 'Dias úteis', value: formatKilometers(result.day_type_one) },
		{ label: 'Sábados', value: formatKilometers(result.day_type_two) },
		{ label: 'Domingos e feriados', value: formatKilometers(result.day_type_three) },
	];
}

function buildPeriodDayTypeCards(period: VkmPeriodResult) {
	return [
		{ label: 'Dias úteis', value: formatKilometers(period.day_type_one) },
		{ label: 'Sábados', value: formatKilometers(period.day_type_two) },
		{ label: 'Domingos e feriados', value: formatKilometers(period.day_type_three) },
	];
}

/* * */

function VkmModal() {
	//

	//
	// A. Setup variables

	const context = useVkmModalContext();
	const agenciesContext = useAgenciesContext();

	const selectedAgency = useMemo(() => {
		return agenciesContext.data.raw.find(item => item._id === context.data.form.values.agency_id) ?? null;
	}, [agenciesContext.data.raw, context.data.form.values.agency_id]);

	const overviewCards = useMemo(() => {
		if (!context.data.result) return [];
		return buildOverviewCards(context.data.result);
	}, [context.data.result]);

	const dayTypeCards = useMemo(() => {
		if (!context.data.result) return [];
		return buildDayTypeCards(context.data.result);
	}, [context.data.result]);

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<Toolbar>
				<CloseButton onClick={() => closeModal(VKM_MODAL_ID)} type="close" />
				<Label size="lg" caps singleLine>Consultar VKM</Label>
				<Spacer />
			</Toolbar>

			<Divider />

			<div className={styles.filtersPanel}>
				<Section gap="md">
					<Select
						data={agenciesContext.data.as_options}
						description="Selecione o operador para calcular os VKM da oferta planeada"
						label="Operador"
						placeholder="Selecionar operador"
						w="100%"
						{...context.data.form.getInputProps('agency_id')}
					/>
				</Section>

				<Divider />

				<Section gap="sm">
					<SegmentedControl
						data={calculationMethodOptions}
						description="Escolha se quer calcular um ano móvel a partir da data inicial ou um intervalo fechado."
						label="Método de cálculo"
						onChange={value => context.actions.setCalculationMethod(value as typeof context.data.form.values.calculation_method)}
						value={context.data.form.values.calculation_method}
						fullWidth
					/>
				</Section>

				<Divider />

				<Section gap="sm">
					<SegmentedControl
						data={extensionSourceOptions}
						description={sourceDescriptions[context.data.form.values.extension_source]}
						label="Fonte da extensão"
						onChange={value => context.data.form.setFieldValue('extension_source', value as VkmExtensionSource)}
						value={context.data.form.values.extension_source}
						fullWidth
					/>
				</Section>

				<Divider />

				<Section gap="md">
					<Grid columns={context.data.form.values.calculation_method === 'fixed_range' ? 'ab' : 'a'} gap="md">
						<DateInput
							description="Primeira data considerada no cálculo"
							label="Data inicial"
							placeholder="YYYYMMDD"
							{...context.data.form.getInputProps('start_date')}
						/>
						{context.data.form.values.calculation_method === 'fixed_range' && (
							<DateInput
								description="Última data considerada no cálculo"
								label="Data final"
								placeholder="YYYYMMDD"
								{...context.data.form.getInputProps('end_date')}
							/>
						)}
					</Grid>

					<Spacer />

					<div className={styles.actionsRow}>
						<Button
							disabled={!context.flags.canSave}
							icon={<IconCalculator />}
							label="Calcular"
							loading={context.flags.loading}
							onClick={context.actions.calculateVkm}
						/>
					</div>
				</Section>
			</div>

			<Divider />

			<Section gap="md">
				{context.flags.loading ? (
					<div className={styles.resultsState}>
						<Loader />
						<Text c="dimmed" size="sm">A calcular VKM para a configuração selecionada...</Text>
					</div>
				) : context.data.result ? (
					<div className={styles.resultsStack}>
						<div className={styles.summary}>
							<div className={styles.summaryHeader}>
								<IconRulerMeasure size={20} />
								<Text fw={700} size="lg">Resumo do cálculo</Text>
							</div>
							<Text c="dimmed" size="sm">
								{selectedAgency?.name ?? context.data.result.inputs.agency_name}
								{' · '}
								{methodLabels[context.data.result.inputs.calculation_method]}
								{' · '}
								{sourceLabels[context.data.form.values.extension_source]}
								{' · '}
								{formatOperationalDate(context.data.result.inputs.start_date)}
								{' - '}
								{formatOperationalDate(context.data.result.inputs.end_date)}
							</Text>
							<Text c="dimmed" size="sm">
								Preço por km:
								{' '}
								{euroFormatter.format(context.data.result.inputs.price_per_km)}
								{' · '}
								VKM contratados/ano:
								{' '}
								{integerFormatter.format(context.data.result.inputs.total_vkm_per_year)}
							</Text>
						</div>

						<div className={styles.sectionPanel}>
							<Text fw={700} size="base">Visão geral</Text>
							<div className={styles.metricsGrid}>
								{overviewCards.map(card => (
									<div key={card.label} className={styles.metricCard}>
										<Text c="dimmed" size="sm">{card.label}</Text>
										<Text fw={700} size="xl">{card.value}</Text>
									</div>
								))}
							</div>

							<div className={styles.breakdownBlock}>
								<Text fw={700} size="base">Totais por dia tipo</Text>
								<div className={styles.metricsGrid}>
									{dayTypeCards.map(card => (
										<div key={card.label} className={styles.metricCard}>
											<Text c="dimmed" size="sm">{card.label}</Text>
											<Text fw={700} size="xl">{card.value}</Text>
										</div>
									))}
								</div>
							</div>
						</div>

						{context.data.result.periods.length > 0 ? context.data.result.periods.map((period, index) => (
							<Collapsible key={period.id ?? `${period.name}-${index}`} title={`Totais para ${period.name}`} defaultOpen>
								<div className={styles.periodSection}>
									<div className={styles.periodTotalCard}>
										<Text c="dimmed" size="sm">Total do período</Text>
										<Text fw={700} size="xl">{formatKilometers(period.total)}</Text>
									</div>

									<div className={styles.periodBreakdownGrid}>
										{buildPeriodDayTypeCards(period).map(card => (
											<div key={`${period.id ?? period.name}-${card.label}`} className={styles.metricCard}>
												<Text c="dimmed" size="sm">{card.label}</Text>
												<Text fw={700} size="xl">{card.value}</Text>
											</div>
										))}
									</div>
								</div>
							</Collapsible>
						)) : (
							<div className={styles.sectionPanel}>
								<Text fw={700} size="base">Totais por período</Text>
								<Text c="dimmed" size="sm">Não existem períodos definidos para o intervalo selecionado.</Text>
							</div>
						)}
					</div>
				) : (
					<div className={styles.resultsState}>
						<Text c="dimmed" size="sm">Selecione um operador, ajuste os parâmetros e clique em calcular para ver os VKM.</Text>
					</div>
				)}
			</Section>
		</div>
	);

	//
}
