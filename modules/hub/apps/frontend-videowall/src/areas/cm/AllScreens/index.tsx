'use client';

/* * */

import { Screen1 } from '@/areas/cm/Screen1';
import { Screen2 } from '@/areas/cm/Screen2';
import { Screen3 } from '@/areas/cm/Screen3';
import { Screen4 } from '@/areas/cm/Screen4';
import { Compliance } from '@/components/Compliance';

import styles from './styles.module.css';

/* * */

export function AllScreens() {
	//

	//
	// A. Setup variables

	// const [snowEnabled] = useQueryState('snow', { defaultValue: '1' });

	//
	// B. Render components

	return (
		<div className={styles.container} style={{ height: 1080, width: 1920 }}>
			<Screen1 />
			{/* <Screen2 />
			<Screen3 />
			<Screen4 />
			<Compliance /> */}
			{/* <Confetti height={1080} numberOfPieces={50} width={1920} /> */}
			{/* {snowEnabled === '1' && <Snowfall snowflakeCount={40} speed={[0.5, 1]} wind={[0, 1]} />} */}
		</div>
	);

	//
}
