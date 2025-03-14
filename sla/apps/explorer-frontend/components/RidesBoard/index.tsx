'use client';

/* * */

import { FlapLine } from '@/components/FlapLine';
import { Label } from '@/components/Label';
import { SeenStatusTag } from '@/components/SeenStatusTag';
import { type ExtendedRideDisplay } from '@/contexts/Rides.context';
import { useRidesBoardContext } from '@/contexts/RidesBoard.context';
import { ViewportList } from 'react-viewport-list';

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
						<Label size="sm" caps>Status</Label>
					</div>
				</div>
			</div>

			<div className={styles.body}>
				<ViewportList ref={ridesBoardContext.data.board_ref} itemMargin={0} items={ridesBoardContext.data.rides}>
					{(item, index) => (
						<RidesBoardRow key={item._id} index={index} item={item} />
					)}
				</ViewportList>
			</div>

		</div>
	);

	//
}

/* * */

interface RidesBoardRowProps {
	index: number
	item: ExtendedRideDisplay
}

export function RidesBoardRow({ item }: RidesBoardRowProps) {
	//

	//
	// A. Render components

	return (

		<div key={item._id} className={styles.rowWrapper}>
			<div key={item._id} className={styles.row}>
				<div className={styles.cell}>
					<SeenStatusTag value={item.seen_status} />
				</div>
				<div className={styles.cell}>
					<FlapLine count={5} string={item.start_time_scheduled_display} />
				</div>
				<div className={styles.cell}>
					<FlapLine count={4} string={item.line_id} />
				</div>
				<div className={styles.cell}>
					<FlapLine count={21} string={item.headsign} />
				</div>
				<div className={styles.cell}>
					<FlapLine count={7} string={item.operational_status} />
				</div>
			</div>
		</div>
	);

	//
}
