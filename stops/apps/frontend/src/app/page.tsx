import StopsList from "@/components/StopsList";
import Accessibility from "@/components/StopContainer/Accessibility";

import styles from './styles.module.css';

export default function Page() {
	return <div className={styles.container}>
		<div>
			<StopsList stops={["A", "B", "C"]} />
		</div>

		<div>
			<Accessibility />
		</div>
	</div>;
}
