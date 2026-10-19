'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeZonesExtractModal } from '../ZonesExtract.modal';
import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtract() {
	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useZonesExtractFormContext();

	return (
		<Pane
			footer={[
				<Toolbar key="footer">
					<Spacer />
					<Button
						disabled={!capabilities?.createEnabled}
						icon={<IconFileDownload size={20} />}
						label={t('shared:extractions.versions.offer-zones-v1.export_button')}
						loading={status.isCreating}
						onClick={actions.create}
					/>
				</Toolbar>,
			]}
			header={[
				<Toolbar key="header">
					<CloseButton onClick={closeZonesExtractModal} type="close" />
					<Label size="lg" singleLine>{t('shared:extractions.versions.offer-zones-v1.title')}</Label>
				</Toolbar>,
			]}
		>
			<Section>
				<Text>{t('shared:extractions.versions.offer-zones-v1.selection', { count: form.getValues('properties.zone_ids').length })}</Text>
			</Section>
		</Pane>
	);
}
