import Navigation from "@/components/Navigation";
import Stop from "@/components/Stop";

import styles from './styles.module.css';

export default function Page() {
	return <div className={styles.container}>
		<Navigation stops={["A", "B", "C"]} />
		<Stop />
	</div>;
}
