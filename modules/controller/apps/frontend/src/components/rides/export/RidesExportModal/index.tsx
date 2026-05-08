'use client';

import { RidesListContextState } from '@/components/rides/list/RidesList.context';
import { AgenciesContextProvider, useAgenciesContext } from '@/contexts/Agencies.context';
import { RidesExportModalContextProvider, useRidesExportModalContext } from '@/contexts/RidesExport.context';
import { IconFileDownload } from '@tabler/icons-react';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { Button, CloseButton, closeModal, DateTimeInput, Divider, ExportsContextProvider, Grid, Label, openModal, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { translateFilterKey, translateFilterValue } from './translations';

/* * */

export const RIDES_EXPORT_MODAL_ID = 'rides-export-modal';

/* * */

export const openRideExportModal = (filters: RidesListContextState['filters']) => {
	openModal({
		children: (
			<ExportsContextProvider>
				<AgenciesContextProvider>
					<RidesExportModalContextProvider initialFilters={filters}>
						<RidesExportModal />
					</RidesExportModalContextProvider>
				</AgenciesContextProvider>
			</ExportsContextProvider>
		),
		closeOnClickOutside: false,
		modalId: RIDES_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};

/* * */

export default function RidesExportModal() {
	//

	//
	// A. Setup variables

	const context = useRidesExportModalContext();
	const agenciesContext = useAgenciesContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const agencyMap = useMemo(() => {
		const map = new Map<string, string>();
		agenciesContext.data.raw.forEach((agency) => {
			map.set(agency._id, agency.name);
		});
		return map;
	}, [agenciesContext.data.raw]);

	const getFormattedValue = (key: string, value: number | string | string[]): string => {
		if (Array.isArray(value)) {
			return value.map((v) => {
				if (key === 'agency') {
					return agencyMap.get(v) || v;
				}
				return translateFilterValue(key, v);
			}).join(', ');
		}
		return translateFilterValue(key, String(value));
	};

	//
	// C. Render Components

	return (
		<div style={{ minHeight: '200px' }}>
			<Toolbar>
				<CloseButton onClick={() => closeModal(RIDES_EXPORT_MODAL_ID)} type="close" />
				<Label size="lg" caps singleLine>{t('default:rides.export.RidesExportModal.title')}</Label>
				<Spacer />
				<Button
					disabled={!context.flags.canSave}
					icon={<IconFileDownload />}
					label={t('default:rides.export.RidesExportModal.ExportButton.label')}
					loading={context.flags.loading}
					onClick={context.actions.exportRides}
				/>
			</Toolbar>

			<Divider />
			<Section>
				<Grid columns="ab" gap="md">
					<DateTimeInput

						onChange={value => context.actions.setFilterDateStart(value)}
						placeholder={t('default:rides.export.RidesExportModal.fields.start_date.placeholder')}
						value={context.filters.date_start as UnixTimestamp}
					/>
					<DateTimeInput
						onChange={value => context.actions.setFilterDateEnd(value)}
						placeholder={t('default:rides.export.RidesExportModal.fields.end_date.placeholder')}
						value={context.filters.date_end as UnixTimestamp}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="sm">
				{Object.entries(context.filters).map(([key, value]) => {
					if (key === 'date_start' || key === 'date_end') return null;
					if (!value || (Array.isArray(value) && value.length === 0)) return null;
					return (
						<div key={key}>
							<Label size="sm" caps>{translateFilterKey(key)}</Label>
							<Text size="sm">{getFormattedValue(key, value['value'])}</Text>
						</div>
					);
				})}
			</Section>
		</div>
	);

	//
}
