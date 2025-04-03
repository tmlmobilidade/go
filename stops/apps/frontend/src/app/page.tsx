"use client";

import Navigation from "@/components/Navigation";
import Stop from "@/components/Stop";

import styles from './styles.module.css';
import { useStopsContext } from "@/contexts/Stops.context";

export default function Page() {
	const { actions: _stopsActions, data: stopsData, flags: _stopsFlags } = useStopsContext();
	console.log("-> StopsData:", stopsData);

	return <div className={styles.container}>
		<Navigation />
		<Stop />
	</div>;
}
