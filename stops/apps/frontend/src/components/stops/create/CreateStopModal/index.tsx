'use client';

/* * */

import { CreateStopModalHeader } from '@/components/stops/create/CreateStopModalHeader';
import { CreateStopModalSwitch } from '@/components/stops/create/CreateStopModalSwitch';
import { StopCreateContextProvider } from '@/contexts/StopCreate.context';
import { Modal, Pane } from '@tmlmobilidade/ui';

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
					<CreateStopModalSwitch />
				</Pane>
			</StopCreateContextProvider>
		</Modal>
	);
}
