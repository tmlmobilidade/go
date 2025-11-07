/* * */

import styles from './styles.module.css';

import { Section, Spacer } from '../../layout';
import { ExportsMenu } from '../ExportsMenu';
import { NotificationsMenu } from '../NotificationsMenu';
import { OptionsMenu } from '../OptionsMenu';
import { TopbarGreeting } from '../TopbarGreeting';

/* * */

export function TopbarActions() {
	return (
		<div className={styles.container}>
			<TopbarGreeting />
			<Spacer />
			<Section flexDirection="row" gap="xs" width="fit-content">
				<ExportsMenu />
				<NotificationsMenu />
				<OptionsMenu />
			</Section>
		</div>
	);
}
