/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { useFaresContext } from '@/contexts/Fares.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { FARE_PAYMENT_METHOD, INTERCHANGE_MODE, LineSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, MultiSelect, openConfirmModal, Section, Select, StandardFormController, Text, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function LineDetailSectionTypology() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineDetailContext = useLineDetailContext();
	const lineDetailContextValues = useStandardFormWatch({ control: lineDetailContext.form.control });
	const faresContext = useFaresContext();
	const typologiesContext = useTypologiesContext();

	const typologyOptions = useMemo(() => {
		return typologiesContext.data.raw.map(typology => ({
			label: typology.name,
			value: typology._id,
		}));
	}, [typologiesContext.data.raw]);

	const prepaidFareOptions = useMemo(() => {
		return faresContext.data.raw
			.filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.PREPAID)
			.map(fare => ({
				label: fare.name,
				value: fare._id,
			}));
	}, [faresContext.data.raw]);

	const onboardFareOptions = useMemo(() => {
		return faresContext.data.raw
			.filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.ONBOARD)
			.map(fare => ({
				label: fare.name,
				value: fare._id,
			}));
	}, [faresContext.data.raw]);

	//
	// B. Handle actions

	const handleTypologyChange = (typology_id: null | string) => {
		if (!typology_id || !lineDetailContext.capabilities.editEnabled) return;

		const selectedTypologyData = typologiesContext.data.raw.find(item => item._id === typology_id);

		if (!selectedTypologyData) return;

		openConfirmModal({
			cancelProps: { variant: 'danger' },
			centered: true,
			children: <Text>{t('lines:detail.LineDetailSectionTypology.typology_confirmation')}</Text>,
			closeOnClickOutside: true,
			labels: { cancel: t('lines:detail.LineDetailSectionTypology.cancel'), confirm: t('lines:detail.LineDetailSectionTypology.confirm') },
			onConfirm: () => {
				lineDetailContext.actions.applyChanges({
					onboard_fare_ids: selectedTypologyData.default_onboard_fare_ids || [],
					prepaid_fare_id: selectedTypologyData.default_prepaid_fare_id || null,
					typology: typology_id,
				});
			},
			title: <Text size="xl">{t('lines:detail.LineDetailSectionTypology.change_typology')}</Text>,
			w: 500,
		});
	};

	//
	// C. Render components

	return (
		<Collapsible title={t('lines:detail.LineDetailSectionTypology.typology_fares')}>
			<Section gap="sm">
				<Select
					clearable={false}
					data={typologyOptions}
					label={t('lines:detail.LineDetailSectionTypology.typology')}
					onChange={handleTypologyChange}
					readOnly={!lineDetailContext.capabilities.editEnabled}
					required={!LineSchema.shape.typology.isOptional()}
					value={lineDetailContextValues.typology}
					w="100%"
				/>

				<StandardFormController
					control={lineDetailContext.form.control}
					name="interchange"
					render={({ field, fieldState }) => (
						<Select
							data={Object.values(INTERCHANGE_MODE).map(value => ({ label: t(`lines:detail.LineDetailSectionTypology.interchange_options.${value}`), value }))}
							error={fieldState.error?.message}
							label={t('lines:detail.LineDetailSectionTypology.apex_interchange')}
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.interchange.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? null}
						/>
					)}
				/>

				<StandardFormController
					control={lineDetailContext.form.control}
					name="prepaid_fare_id"
					render={({ field, fieldState }) => (
						<Select
							data={prepaidFareOptions}
							error={fieldState.error?.message}
							label={t('lines:detail.LineDetailSectionTypology.prepaid_fare')}
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.prepaid_fare_id.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? null}
						/>
					)}
				/>

				<StandardFormController
					control={lineDetailContext.form.control}
					name="onboard_fare_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={onboardFareOptions}
							error={fieldState.error?.message}
							label={t('lines:detail.LineDetailSectionTypology.onboard_fares')}
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.onboard_fare_ids.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? []}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);

	//
}
