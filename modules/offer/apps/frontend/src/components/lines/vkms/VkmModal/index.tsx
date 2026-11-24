'use client';

import { useVkmModalContext, VkmModalContextProvider } from '@/contexts/VkmModal.context';
import { IconCalculator, IconRulerMeasure } from '@tabler/icons-react';
import { type VkmCalculationResult, type VkmExtensionSource, type VkmPeriodResult } from '@tmlmobilidade/go-types-offer';
import { Button, CloseButton, closeModal, Collapsible, DateInput, Divider, Grid, Label, Loader, MeContextProvider, openModal, Section, SegmentedControl, type SegmentedControlDataItem, Select, Spacer, Text, Toolbar, useLocaleContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LinesListContextProvider, useLinesListContext } from '../../list/LinesList.context';

/* * */

export const VKM_MODAL_ID = 'vkm-modal';

/* * */

export const openVkmModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<LinesListContextProvider>
					<VkmModalContextProvider>
						<VkmModal />
					</VkmModalContextProvider>
				</LinesListContextProvider>
			</MeContextProvider>
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

function VkmModal() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();

	const calculationMethodOptions: SegmentedControlDataItem[] = [
		{ label: t('lines:vkms.VkmModal.rolling_year'), value: 'rolling_year' },
		{ label: t('lines:vkms.VkmModal.fixed_range'), value: 'fixed_range' },
	];

	const extensionSourceOptions: { label: string, value: VkmExtensionSource }[] = [
		{ label: t('lines:vkms.VkmModal.go_recommended'), value: 'go' },
		{ label: t('lines:vkms.VkmModal.stop_times'), value: 'stop_times' },
	];

	const methodLabels = {
		fixed_range: t('lines:vkms.VkmModal.fixed_range'),
		rolling_year: t('lines:vkms.VkmModal.rolling_year'),
	} as const;

	const sourceLabels = {
		go: 'GO',
		stop_times: t('lines:vkms.VkmModal.stop_times'),
	} as const;

	const sourceDescriptions = {
		go: t('lines:vkms.VkmModal.go_description'),
		stop_times: t('lines:vkms.VkmModal.stop_times_description'),
	} as const;

	// Use Portugal's regional number conventions for GO's Portuguese language.
	const numberLocale = locale === 'pt' ? 'pt-PT' : locale;
	const integerFormatter = new Intl.NumberFormat(numberLocale);
	const kilometerFormatter = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
	const euroFormatter = new Intl.NumberFormat(numberLocale, { currency: 'EUR', style: 'currency' });
	const percentFormatter = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 2, style: 'percent' });

	function formatOperationalDate(date: number) {
		const value = String(date);
		return new Intl.DateTimeFormat(locale, { timeZone: 'UTC' }).format(new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`));
	}

	function formatKilometers(value: number) {
		return `${kilometerFormatter.format(value)} km`;
	}

	function buildOverviewCards(result: VkmCalculationResult) {
		return [
			{ label: t('lines:vkms.VkmModal.total_distance'), value: formatKilometers(result.total_from_distance) },
			{ label: t('lines:vkms.VkmModal.estimated_cost'), value: euroFormatter.format(result.total_in_euros) },
			...(result.inputs.calculation_method === 'rolling_year'
				? [{ label: t('lines:vkms.VkmModal.relative_contract'), value: percentFormatter.format(result.total_relative_to_contract) }]
				: []),
		];
	}

	function buildDayTypeCards(result: VkmCalculationResult) {
		return [
			{ label: t('lines:vkms.VkmModal.business_days'), value: formatKilometers(result.day_type_one) },
			{ label: t('lines:vkms.VkmModal.saturdays'), value: formatKilometers(result.day_type_two) },
			{ label: t('lines:vkms.VkmModal.sundays_holidays'), value: formatKilometers(result.day_type_three) },
		];
	}

	function buildPeriodDayTypeCards(period: VkmPeriodResult) {
		return [
			{ label: t('lines:vkms.VkmModal.business_days'), value: formatKilometers(period.day_type_one) },
			{ label: t('lines:vkms.VkmModal.saturdays'), value: formatKilometers(period.day_type_two) },
			{ label: t('lines:vkms.VkmModal.sundays_holidays'), value: formatKilometers(period.day_type_three) },
		];
	}

	const context = useVkmModalContext();
	const linesListContext = useLinesListContext();

	const selectedAgency = useMemo(() => {
		return linesListContext.data.agencyOptions.find(item => item.value === context.data.form.values.agency_id) ?? null;
	}, [linesListContext.data.agencyOptions, context.data.form.values.agency_id]);

	const overviewCards = context.data.result ? buildOverviewCards(context.data.result) : [];

	const dayTypeCards = context.data.result ? buildDayTypeCards(context.data.result) : [];

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<Toolbar>
				<CloseButton onClick={() => closeModal(VKM_MODAL_ID)} type="close" />
				<Label size="lg" caps singleLine>{t('lines:vkms.VkmModal.vkm')}</Label>
				<Spacer />
			</Toolbar>

			<Divider />

			<div className={styles.filtersPanel}>
				<Section gap="md">
					<Select
						data={linesListContext.data.agencyOptions}
						description={t('lines:vkms.VkmModal.vkm_agency_hint')}
						label={t('lines:vkms.VkmModal.agency')}
						placeholder={t('lines:vkms.VkmModal.select_agency')}
						w="100%"
						{...context.data.form.getInputProps('agency_id')}
					/>
				</Section>

				<Divider />

				<Section gap="sm">
					<SegmentedControl
						data={calculationMethodOptions}
						description={t('lines:vkms.VkmModal.method_hint')}
						label={t('lines:vkms.VkmModal.calculation_method')}
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
						label={t('lines:vkms.VkmModal.extension_source')}
						onChange={value => context.data.form.setFieldValue('extension_source', value as VkmExtensionSource)}
						value={context.data.form.values.extension_source}
						fullWidth
					/>
				</Section>

				<Divider />

				<Section gap="md">
					<Grid columns={context.data.form.values.calculation_method === 'fixed_range' ? 'ab' : 'a'} gap="md">
						<DateInput
							description={t('lines:vkms.VkmModal.start_hint')}
							label={t('lines:vkms.VkmModal.start_date')}
							placeholder="YYYYMMDD"
							{...context.data.form.getInputProps('start_date')}
						/>
						{context.data.form.values.calculation_method === 'fixed_range' && (
							<DateInput
								description={t('lines:vkms.VkmModal.end_hint')}
								label={t('lines:vkms.VkmModal.end_date')}
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
							label={t('lines:vkms.VkmModal.calculate')}
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
						<Text c="dimmed" size="sm">{t('lines:vkms.VkmModal.calculating')}</Text>
					</div>
				) : context.data.result ? (
					<div className={styles.resultsStack}>
						<div className={styles.summary}>
							<div className={styles.summaryHeader}>
								<IconRulerMeasure size={20} />
								<Text fw={700} size="lg">{t('lines:vkms.VkmModal.calculation_summary')}</Text>
							</div>
							<Text c="dimmed" size="sm">
								{selectedAgency?.label ?? context.data.result.inputs.agency_name}
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
								{t('lines:vkms.VkmModal.price_km')}{' '}
								{euroFormatter.format(context.data.result.inputs.price_per_km)}
								{' · '}
								{t('lines:vkms.VkmModal.contracted_vkm')}{' '}
								{integerFormatter.format(context.data.result.inputs.total_vkm_per_year)}
							</Text>
						</div>

						<div className={styles.sectionPanel}>
							<Text fw={700} size="base">{t('lines:vkms.VkmModal.overview')}</Text>
							<div className={styles.metricsGrid}>
								{overviewCards.map(card => (
									<div key={card.label} className={styles.metricCard}>
										<Text c="dimmed" size="sm">{card.label}</Text>
										<Text fw={700} size="xl">{card.value}</Text>
									</div>
								))}
							</div>

							<div className={styles.breakdownBlock}>
								<Text fw={700} size="base">{t('lines:vkms.VkmModal.day_totals')}</Text>
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
							<Collapsible key={period.id ?? `${period.name}-${index}`} title={t('lines:vkms.VkmModal.period_heading', { name: period.name })} defaultOpen>
								<div className={styles.periodSection}>
									<div className={styles.periodTotalCard}>
										<Text c="dimmed" size="sm">{t('lines:vkms.VkmModal.period_total')}</Text>
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
								<Text fw={700} size="base">{t('lines:vkms.VkmModal.period_totals')}</Text>
								<Text c="dimmed" size="sm">{t('lines:vkms.VkmModal.no_periods')}</Text>
							</div>
						)}
					</div>
				) : (
					<div className={styles.resultsState}>
						<Text c="dimmed" size="sm">{t('lines:vkms.VkmModal.vkm_empty')}</Text>
					</div>
				)}
			</Section>
		</div>
	);

	//
}
