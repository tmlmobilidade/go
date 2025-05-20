'use client';

/* * */

import { useManualContext } from '@/contexts/Manual.context';
import { Stop } from '@tmlmobilidade/types';
// import { Stop } from '@carrismetropolitana/api-types/network';
import { useDisclosure } from '@mantine/hooks';

/* * */

import { Left } from './Left';
import { Right } from './Right';
import styles from './styles.module.css';

/* * */

export function SpecificHeader({ actions, data }) {
	//

	//
	// A. Setup variables

	// Contexts
	const { isManual } = useManualContext();

	// Hooks
	const [opened, { close, open }] = useDisclosure(false);

	//
	// B. Render components

	return (
		<div className={styles.header}>
			<Left data={data} isManual={isManual} />

			<Right actions={actions} data={data} open={open} />

			{/* <PatternsModal onClose={close} opened={opened} title="Patterns associados a esta paragem">
				<List>
					{stop?.pattern_ids?.map(id => <Item key={id} id={id} />)}
				</List>
			</PatternsModal> */}
		</div>
	);
}
