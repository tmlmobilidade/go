'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { ParameterCreateDayPeriod } from '@/components/patterns/shape/parameters/create/ParameterCreateDayPeriod';
import { ParameterCreateModifiers } from '@/components/patterns/shape/parameters/create/ParameterCreateModifiers';
import { ParameterCreateStopsList } from '@/components/patterns/shape/parameters/create/ParameterCreateStopsList';
import { ParameterCreateVehicleType } from '@/components/patterns/shape/parameters/create/ParameterCreateVehicleType';
import { ParameterCreateWeekdays } from '@/components/patterns/shape/parameters/create/ParameterCreateWeekdays';
import { ParameterCreateYearPeriods } from '@/components/patterns/shape/parameters/create/ParameterCreateYearPeriods';
import { Collapsible, Divider, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ParameterCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createParameterContext = useParameterCreateContext();

	const isDefaultRule = createParameterContext.data.values.kind === 'default';

	//
	// B. Render components

	return (
		<Section gap="md">

			{/* Parameter Conditions */}
			{!isDefaultRule && (
				<Collapsible
					description={t('default:scheduling.copy.parameterConditionsHint')}
					title={t('default:scheduling.copy.parameterConditionsQuestion')}
					defaultOpen
				>
					<ParameterCreateYearPeriods />
					<Divider />
					<ParameterCreateWeekdays />
					<Divider />
					<ParameterCreateDayPeriod />
				</Collapsible>
			)}

			{/* Parameter Type */}
			<Collapsible
				title={`${isDefaultRule ? '1' : '2'}. Que tempos devem ser aplicados?`}
				defaultOpen
			>
				<Section gap="md">
					<ParameterCreateModifiers />
					<ParameterCreateStopsList />
				</Section>
			</Collapsible>

			{/* Vehicle Type */}
			<Collapsible
				title={t('default:scheduling.copy.vehicleQuestion', '', { step: isDefaultRule ? 2 : 3 })}
				defaultOpen
			>
				<ParameterCreateVehicleType />
			</Collapsible>

		</Section>
	);

	//
}
