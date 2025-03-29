import Navigation from "@/components/Navigation";
import Accessibility from "@/components/StopContainer/Accessibility";

import styles from './styles.module.css';

export default function Page() {
	return <div className={styles.container}>
		<Navigation stops={["A", "B", "C"]} />

		<div>
			<Accessibility />
		</div>
	</div>;
}
