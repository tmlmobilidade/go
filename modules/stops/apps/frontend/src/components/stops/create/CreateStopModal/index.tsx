'use client';

/* * */

import { CreateStopModalAlerts } from '@/components/stops/create/CreateStopModalAlerts';
import { CreateStopModalControls } from '@/components/stops/create/CreateStopModalControls';
import { CreateStopModalHeader } from '@/components/stops/create/CreateStopModalHeader';
import { CreateStopModalSwitch } from '@/components/stops/create/CreateStopModalSwitch';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { Divider, Modal, Pane } from '@go/ui';

/* * */

interface CreateStopModalProps {
	onClose?: () => void
	opened?: boolean
}

/* * */

export function CreateStopModal({ onClose, opened }: CreateStopModalProps) {
	return (
		<Modal
			onClose={onClose}
			opened={opened}
			padding={0}
			radius={0}
			size="xl"
			styles={{ content: { backgroundColor: 'transparent' } }}
			withCloseButton={false}
			centered
		>
			<StopCreateContextProvider>
				<Pane header={[<CreateStopModalHeader />]}>
					<CreateStopModalAlerts />
					<CreateStopModalSwitch />
					<Divider />
					<CreateStopModalControls onClose={onClose} />
				</Pane>
			</StopCreateContextProvider>
		</Modal>
	);
}
