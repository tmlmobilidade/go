'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Routes } from '@/lib/routes';
import { Modal } from '@mantine/core';
import { Pane, useDisclosure } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
	const [opened] = useDisclosure(true);
	const router = useRouter();
	const [municipality, setMunicipality] = useState(null);

	const [phase, setPhase] = useState<Phase>(Phase.LOCATION);
	const { data } = useStopsDetailContext();

	useEffect(() => {
		fetch('/data/municipalities.json').then(res => res.json()).then((municipalities) => {
			for (const municipalityData of municipalities.features) {
				if (municipalityData.id === data.form.getValues().municipality_id) {
					setMunicipality(municipalityData.properties.name);
				}
			}
		});
	}, [data]);

	//
	// B. Render components
	return (
		<div className={styles.container}>
			<Modal fullScreen={false} onClose={() => router.push(Routes.STOP_LIST)} opened={opened} size="lg" title="Nova Paragem">
				<Pane>
					<div className={styles.section}>
						<Labels phase={phase} />
						{phase === Phase.LOCATION && <Location municipality={municipality} />}
						{phase === Phase.IDENTIFICATION && <Identification />}
						{phase === Phase.CONFIRMATION && <Confirmation municipality={municipality} />}
						<Buttons phase={phase} setPhase={setPhase} />
					</div>
				</Pane>
			</Modal>
		</div>
	);
}
