'use client';

// import { useManualContext } from '@/contexts/Manual.context';
// import { useDisclosure } from '@mantine/hooks';

import { Left } from './Left';
import { Right } from './Right';
import styles from './styles.module.css';

/* * */

export function SpecificHeader({ data }) {
	//

	//
	// A. Setup variables

	// Contexts
	// const { isManual } = useManualContext();

	// Hooks
	// const [opened, { close, open }] = useDisclosure(false);

	//
	// B. Render components

	return (
		<div className={styles.header}>
			<Left data={data} />

			<Right data={data} />

			{/* <PatternsModal onClose={close} opened={opened} title="Patterns associados a esta paragem">
				<List>
					{stop?.pattern_ids?.map(id => <Item key={id} id={id} />)}
				</List>
			</PatternsModal> */}
		</div>
	);
}
