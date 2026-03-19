/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { useFaresContext } from '@/contexts/Fares.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { FARE_PAYMENT_METHOD, interchangeModeOptions, LineSchema } from '@tmlmobilidade/types';
import { Collapsible, MultiSelect, openConfirmModal, Section, Select, Text } from '@tmlmobilidade/ui';
import { useMemo, useRef } from 'react';

/* * */

export function LineDetailSectionTypology() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();
	const faresContext = useFaresContext();
	const typologiesContext = useTypologiesContext();

	const typologyOptions = useMemo(() => {
		return typologiesContext.data.raw?.map(typology => ({
			label: typology.name,
			value: typology._id,
		}));
	}, [typologiesContext.data.raw]);

	const prepaidFareOptions = useMemo(() => {
		return faresContext.data.raw?.filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.PREPAID).map(fare => ({
			label: fare.name,
			value: fare._id,
		}));
	}, [faresContext.data.raw]);

	const onboardFareOptions = useMemo(() => {
		return faresContext.data.raw?.filter(fare => fare.payment_method === FARE_PAYMENT_METHOD.ONBOARD).map(fare => ({
			label: fare.name,
			value: fare._id,
		}));
	}, [faresContext.data.raw]);

	//
	// B. Handle actions

	const previousTypologyRef = useRef<null | string | undefined>(undefined);

	const revertTypology = () => {
		if (previousTypologyRef.current !== undefined) {
			lineDetailContext.data.form.setFieldValue(
				'typology',
				previousTypologyRef.current, // may be string OR null
			);
		}

		previousTypologyRef.current = undefined;
	};

	const handleTypologyChange = (typology_id) => {
		if (!typology_id) return;

		const currentValue = lineDetailContext.data.form.values.typology;

		// Snapshot only once
		if (previousTypologyRef.current === undefined) {
			previousTypologyRef.current = currentValue ?? null;
		}

		const selectedTypologyData = typologiesContext.data.raw.find(item => item._id === typology_id);

		if (!selectedTypologyData) return;

		openConfirmModal({
			cancelProps: { variant: 'danger' },
			centered: true,
			children: <Text>Ao alterar a tipologia irá também substituir as tarifas associadas a esta linha. Isto terá impacto no preço dos bilhetes de bordo (navegante® a bordo) e pré-pagos (navegante® pré-pago). Tem a certeza que pretende continuar com a alteração de tipologia?</Text>,
			closeOnClickOutside: true,
			labels: { cancel: 'Cancelar', confirm: 'Confirmar' },
			onCancel: () => {
				revertTypology();
			},
			onClose: () => {
				// Defer state update to avoid setState during render
				setTimeout(() => {
					revertTypology();
				}, 0);
			},
			onConfirm: async () => {
				lineDetailContext.data.form.setFieldValue('typology', typology_id);
				lineDetailContext.data.form.setFieldValue('prepaid_fare_id', selectedTypologyData.default_prepaid_fare_id || null);
				lineDetailContext.data.form.setFieldValue('onboard_fare_ids', selectedTypologyData.default_onboard_fare_ids || []);
				previousTypologyRef.current = undefined;
			},
			title: <Text size="xl">Alterar Tipologia</Text>,
			w: 500,
		});
	};

	//
	// B. Render components

	return (
		<Collapsible title="Tipologia e Tarifas">
			<Section gap="sm">
				<Select
					key={lineDetailContext.data.form.key('typology')}
					clearable={false}
					data={typologyOptions}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Tipologia"
					onChange={handleTypologyChange}
					required={!LineSchema.shape.typology.isOptional()}
					value={lineDetailContext.data.form.values.typology}
					w="100%"
				/>

				<Select
					key={lineDetailContext.data.form.key('interchange')}
					data={interchangeModeOptions}
					disabled={lineDetailContext.flags.isReadOnly}
					label="APEX Interchange"
					required={!LineSchema.shape.interchange.isOptional()}
					w="100%"
					{...lineDetailContext.data.form.getInputProps('interchange')}
				/>

				<Select
					key={lineDetailContext.data.form.key('prepaid_fare_id')}
					data={prepaidFareOptions}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Tarifa navegante® pré-pago"
					required={!LineSchema.shape.prepaid_fare_id.isOptional()}
					w="100%"
					{...lineDetailContext.data.form.getInputProps('prepaid_fare_id')}
				/>

				<MultiSelect
					key={lineDetailContext.data.form.key('onboard_fare_ids')}
					data={onboardFareOptions}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Tarifas de bordo (navegante® a bordo)"
					required={!LineSchema.shape.onboard_fare_ids.isOptional()}
					w="100%"
					{...lineDetailContext.data.form.getInputProps('onboard_fare_ids')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
