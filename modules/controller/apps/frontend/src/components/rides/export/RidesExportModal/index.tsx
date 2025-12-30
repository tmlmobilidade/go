'use client';

/* * */

import { AgenciesContextProvider, useAgenciesContext } from '@/contexts/Agencies.context';
import { RidesExportModalContextProvider, useRidesExportModalContext } from '@/contexts/RidesExport.context';
import { RidesListContextState } from '@/contexts/RidesList.context';
import { IconFileDownload } from '@tabler/icons-react';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { Button, closeModal, DateTimePicker, Divider, ExportsContextProvider, Grid, Label, openModal, Section, Text } from '@tmlmobilidade/ui';
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
		size: 'auto',
		styles: { content: { overflow: 'unset' } },
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
	const { t } = useTranslation('controller', { keyPrefix: 'rides.exportModal' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

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
			<Section>
				<Label size="lg" caps>{t('title')}</Label>
				<Text>{t('description')}</Text>
			</Section>

			<Divider />
			<Section>
				<Grid columns="ab" gap="md">
					<DateTimePicker
						onChange={value => context.actions.setFilterDateStart(value)}
						placeholder={t('fields.startDate')}
						value={context.filters.date_start as UnixTimestamp}
						fullWidth
					/>
					<DateTimePicker
						onChange={value => context.actions.setFilterDateEnd(value)}
						placeholder={t('fields.endDate')}
						value={context.filters.date_end as UnixTimestamp}
						fullWidth
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
							<Text size="sm">{getFormattedValue(key, value)}</Text>
						</div>
					);
				})}
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={context.flags.loading}
						label={tGlobal('cancel')}
						onClick={() => closeModal(RIDES_EXPORT_MODAL_ID)}
						variant="danger"
					/>
					<Button
						disabled={!context.flags.canSave}
						icon={<IconFileDownload />}
						label={tGlobal('export_circulations')}
						loading={context.flags.loading}
						onClick={context.actions.exportRides}
					/>
				</Grid>
			</Section>

		</div>
	);

	//
}
