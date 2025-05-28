'use client';

import { useStopsContext } from '@/contexts/Stops.context';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Routes } from '@/lib/routes';
import { Modal } from '@mantine/core';
import { Pane, useDisclosure } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Buttons } from './Buttons';
import { Confirmation } from './Confirmation';
import { Identification } from './Identification';
import { Labels } from './Labels';
import { Location } from './Location'; // Ensure Location is a valid React component
import styles from './styles.module.css';

enum Phase {
	CONFIRMATION = 'CONFIRMATION',
	IDENTIFICATION = 'IDENTIFICATION',
	LOCATION = 'LOCATION',
}

export function Form() {
	//

	//
	// A. Setup Variables
	// const [opened, { _open, _close }] = useDisclosure(true);
	const [opened] = useDisclosure(true);
	const { actions: { getStopById } } = useStopsContext();
	const router = useRouter();

	const [phase, setPhase] = useState<Phase>(Phase.LOCATION);
	const { actions, data } = useStopsDetailContext();
	console.log('lat', data.form.getValues().latitude);
	console.log('lon', data.form.getValues().longitude);

	//
	// B. Render components
	return (
		<div>
			<Modal fullScreen={true} onClose={() => router.push(Routes.STOP_LIST)} opened={opened} title="Nova Paragem">
				{/* Modal content */}
				<Pane>
					<div className={styles.container}>
						<Labels phase={phase} />
						{phase === Phase.LOCATION && <Location data={data} getStopById={getStopById} />}
						{phase === Phase.IDENTIFICATION && <Identification data={data} />}
						{phase === Phase.CONFIRMATION && <Confirmation data={data} />}
						<Buttons actions={actions} data={data} phase={phase} setPhase={setPhase} />
					</div>
				</Pane>
			</Modal>
		</div>
	);
}
