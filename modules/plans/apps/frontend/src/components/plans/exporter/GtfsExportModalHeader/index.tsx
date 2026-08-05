'use client';

import { useGtfsExportModalContext } from '@/contexts/GtfsExport.context';
import { IconFileDownload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

interface GtfsExportModalHeaderProps {
	onClose: () => void
}

/* * */

export function GtfsExportModalHeader({ onClose }: GtfsExportModalHeaderProps) {
	//

	//
	// A. Setup variables

	const context = useGtfsExportModalContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={onClose} type="close" />
			<Label size="lg" caps singleLine>Exportar GTFS</Label>
			<Spacer />
			<Button
				disabled={!context.flags.canSave}
				icon={<IconFileDownload />}
				label="Exportar"
				loading={context.flags.loading}
				onClick={context.actions.exportGtfs}
			/>
		</Toolbar>
	);

	//
}
