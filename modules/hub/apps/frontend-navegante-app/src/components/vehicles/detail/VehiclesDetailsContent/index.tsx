'use client';

/* * */

import { useLinesContext } from '@/components/lines/Lines.context';
import { LicensePlate } from '@/components/vehicles/common/LicensePlate';
import { useVehiclesDetailContext } from '@/components/vehicles/detail/VehiclesDetail.context';
import { LineDisplay, Section, Table } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function VehiclesDetailsContent() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const optionLabels = useTranslation();

	const linesContext = useLinesContext();
	const vehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Fetch data

	const activeLineData = useMemo(() => {
		return linesContext.data.lines.find(line => line._id === vehiclesDetailContext.data.vehicle?.line_id);
	}, [vehiclesDetailContext.data.vehicle?.line_id, linesContext.data.lines]);

	const rows = [
		{ label: 'ID', value: vehiclesDetailContext.data.vehicle?.vehicle_id },
		{ label: 'Lugares Sentados', value: vehiclesDetailContext.data.vehicle?.available_seats },
		{ label: 'Lugares em pé', value: vehiclesDetailContext.data.vehicle?.available_standing },
		{ label: 'Capacidade Total', value: vehiclesDetailContext.data.vehicle?.available_seats + vehiclesDetailContext.data.vehicle?.available_standing },
		{ label: 'Marca', value: vehiclesDetailContext.data.vehicle?.make },
		{ label: 'Modelo', value: vehiclesDetailContext.data.vehicle?.model },
		{ label: 'Propulsão', value: vehiclesDetailContext.data.vehicle?.propulsion ? optionLabels(`VehiclePropulsion.${vehiclesDetailContext.data.vehicle.propulsion}`) : t('unknown') },
		{ label: 'Emission Class', value: vehiclesDetailContext.data.vehicle?.emission ? optionLabels(`VehicleEmissionClass.${vehiclesDetailContext.data.vehicle.emission}`) : t('unknown') },
		{ label: 'Estado Atual', value: vehiclesDetailContext.data.vehicle?.current_status },
		{ label: 'Trip ID', value: vehiclesDetailContext.data.vehicle?.trip_id || t('unknown') },
	];

	//
	// C. Render components

	return (
		<Section padding="md">

			{vehiclesDetailContext.data.vehicle ? (
				<>
					<div className={styles.dataWrapper}>
						<LineDisplay lineData={activeLineData} />

						<div className={styles.iconList}>
							<TooltipIcon icon={vehiclesListContext.data.selected?.bikes_allowed ? <IconBike /> : <IconBikeOff />} label={vehiclesListContext.data.selected?.bikes_allowed ? t('bikes_allowed') : t('no_bikes_allowed')} position="bottom" />
							<TooltipIcon icon={vehiclesListContext.data.selected?.wheelchair_accessible ? <IconDisabled2 /> : <IconDisabledOff />} label={vehiclesListContext.data.selected?.wheelchair_accessible ? t('wheelchair_accessible') : t('no_wheelchair_accessible')} position="bottom" />
							<TooltipIcon icon={vehiclesListContext.data.selected.contactless ? <IconCreditCard /> : <IconCreditCardOff />} label={vehiclesListContext.data.selected.contactless ? t('contactless') : t('no_contactless')} position="bottom" />
							{vehiclesListContext.data.selected.license_plate && <LicensePlate value={vehiclesListContext.data.selected.license_plate} />}
						</div>

						<Table withRowBorders>
							<Table.Tbody>
								{rows.map(row => (
									<Table.Tr key={row.label}>
										<Table.Td className={styles.rowLabel}>{row.label}</Table.Td>
										<Table.Td className={styles.rowValue}>{row.value}</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>

					</div>
				</>
			) : (
				<NoDataLabel text={t('no_data')} />
			)}
		</Section>
	);

	//
}
