'use client';

/* * */

import { FlapLine } from '@/components/FlapLine';
import { Label } from '@/components/Label';
import { SeenStatusTag } from '@/components/SeenStatusTag';
import { type ExtendedRideDisplay } from '@/contexts/Rides.context';
import { useRidesBoardContext } from '@/contexts/RidesBoard.context';

import styles from './styles.module.css';

/* * */

export function RidesBoard() {
	//

	//
	// A. Setup variables

	const ridesBoardContext = useRidesBoardContext();

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>

			<div className={styles.header}>

				<div className={styles.row}>
					<div className={styles.cell} />
					<div className={styles.cell}>
						<Label size="sm" caps>Time</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Line</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>To</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Validations</Label>
					</div>
					<div className={styles.cell}>
						<Label size="sm" caps>Status</Label>
					</div>
				</div>
			</div>

			<div className={styles.body}>
				{ridesBoardContext.data.slots.map(slot => (
					<RidesBoardRow key={slot._id} index={slot.index} item={slot.ride} slotId={slot._id} />
				))}
			</div>

		</div>
	);

	//
}

/* * */

interface RidesBoardRowProps {
	index: number
	item: ExtendedRideDisplay | null
	slotId: string
}

export function RidesBoardRow({ item }: RidesBoardRowProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.rowWrapper}>
			<div className={styles.row}>
				<div className={styles.cell}>
					<SeenStatusTag value={item?.seen_status || 'unseen'} />
				</div>
				<div className={styles.cell}>
					<FlapLine characterSets={['time']} count={5} string={item?.start_time_scheduled_display} />
				</div>
				<div className={styles.cell}>
					<FlapLine characterSets={['numeric']} count={4} string={item?.line_id} />
				</div>
				<div className={styles.cell}>
					<FlapLine characterSets={['alphabet', 'numeric', 'special']} count={40} string={item?.headsign} />
				</div>
				<div className={styles.cell}>
					<FlapLine characterSets={['numeric']} count={3} string={`${item?.validations_count ?? ''}`} />
				</div>
				<div className={styles.cell}>
					<FlapLine characterSets={['alphabet']} count={10} string={item?.operational_status} />
				</div>
			</div>
		</div>
	);

	//
}
