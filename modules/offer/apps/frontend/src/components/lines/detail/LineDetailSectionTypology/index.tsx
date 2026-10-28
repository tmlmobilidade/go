/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { useFaresContext } from '@/contexts/Fares.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { FARE_PAYMENT_METHOD, interchangeModeOptions, LineSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, MultiSelect, openConfirmModal, Section, Select, StandardFormController, Text, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function LineDetailSectionTypology() {
	//

	//
	// A. Setup variables

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
			children: <Text>Ao alterar a tipologia irá também substituir as tarifas associadas a esta linha. Isto terá impacto no preço dos bilhetes de bordo (navegante® a bordo) e pré-pagos (navegante® pré-pago). Tem a certeza que pretende continuar com a alteração de tipologia?</Text>,
			closeOnClickOutside: true,
			labels: { cancel: 'Cancelar', confirm: 'Confirmar' },
			onConfirm: () => {
				lineDetailContext.actions.applyChanges({
					onboard_fare_ids: selectedTypologyData.default_onboard_fare_ids || [],
					prepaid_fare_id: selectedTypologyData.default_prepaid_fare_id || null,
					typology: typology_id,
				});
			},
			title: <Text size="xl">Alterar Tipologia</Text>,
			w: 500,
		});
	};

	//
	// C. Render components

	return (
		<Collapsible title="Tipologia e Tarifas">
			<Section gap="sm">
				<Select
					clearable={false}
					data={typologyOptions}
					label="Tipologia"
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
							data={interchangeModeOptions}
							error={fieldState.error?.message}
							label="APEX Interchange"
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
							label="Tarifa navegante® pré-pago"
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
							label="Tarifas de bordo (navegante® a bordo)"
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
