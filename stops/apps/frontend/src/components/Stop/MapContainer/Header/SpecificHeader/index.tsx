'use client';

/* * */

import { useManualContext } from '@/contexts/Manual.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { Stop } from '@tmlmobilidade/types';
// import { Stop } from '@carrismetropolitana/api-types/network';
import { useDisclosure } from '@mantine/hooks';

/* * */

import List from '../List';
import Item from '../List/Item';
import PatternsModal from '../PatternsModal';
import Left from './Left';
import Right from './Right';
import styles from './styles.module.css';

/* * */

export default function SpecificHeader() {
	//

	//
	// A. Setup variables

	// Contexts
	const { isManual } = useManualContext();
	const { actions } = useStopsContext();

	// Hooks
	const [opened, { close, open }] = useDisclosure(false);

	// const stopDetailContext = useStopDetailContext();

	// const { data: stop } = stopDetailContext;
	// console.log('=> latitude', stop.form.getValues().latitude);
	//
	// B. Render components

	return (
		<div className={styles.header}>
			<Left isManual={isManual} />

			<Right open={open} />

			{/* <PatternsModal onClose={close} opened={opened} title="Patterns associados a esta paragem">
				<List>
					{stop?.pattern_ids?.map(id => <Item key={id} id={id} />)}
				</List>
			</PatternsModal> */}
		</div>
	);
}
