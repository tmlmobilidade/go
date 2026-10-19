'use client';

import { Button, closeModal, Divider, Grid, Label, openModal, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListExportContext, VehiclesListExportContextProvider } from './VehiclesListExport.context';

/* * */

export const VEHICLES_LIST_EXPORT_MODAL_ID = 'vehicles-list-export-modal';

/* * */

function VehiclesListExport() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const vehiclesListExportContext = useVehiclesListExportContext();

	//
	// B. Render components

	return (
		<Pane
			header={[
				<Toolbar key="vehicles-list-export-toolbar">
					<Label size="lg" singleLine>{t('default:vehicles.list.VehiclesListExport.title')}</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<Section gap="sm">
				<Label size="sm" caps>{t('default:vehicles.list.VehiclesListExport.activeFilters')}</Label>
				{vehiclesListExportContext.filters.length === 0 && (
					<Label size="sm">{t('default:vehicles.list.VehiclesListExport.noFilters')}</Label>
				)}
				{vehiclesListExportContext.filters.map(({ label, value }) => (
					<div key={label}>
						<Label size="sm" caps>{label}</Label>
						<Text size="sm">{value}</Text>
					</div>
				))}
			</Section>
			<Divider />
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<Button label={t('default:vehicles.list.VehiclesListExport.cancel')} onClick={closeVehiclesListExportModal} type="button" variant="secondary" />
					<Button
						disabled={!vehiclesListExportContext.flags.canSave}
						label={t('default:vehicles.list.VehiclesListExport.submit')}
						loading={vehiclesListExportContext.flags.loading}
						onClick={vehiclesListExportContext.actions.exportVehicles}
						type="button"
					/>
				</Grid>
			</Section>
		</Pane>
	);
}

/* * */

export const openVehiclesListExportModal = () => {
	openModal({
		children: (
			<VehiclesListExportContextProvider>
				<VehiclesListExport />
			</VehiclesListExportContextProvider>
		),
		closeOnClickOutside: false,
		closeOnEscape: false,
		modalId: VEHICLES_LIST_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		withCloseButton: false,
	});
};

/* * */

export const closeVehiclesListExportModal = () => {
	closeModal(VEHICLES_LIST_EXPORT_MODAL_ID);
};
