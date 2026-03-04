/* * */

import styles from './styles.module.css';

import { useDataSimplifiedUser } from '../../../hooks/use-data/use-data-simplified-user';
import { Tag } from '../Tag';

/* * */

interface UserTagProps {
	format: 'inline' | 'tag'
	userId: string
}

/* * */

export function UserTag({ format = 'tag', userId }: UserTagProps) {
	//

	//
	// A. Fetch data

	const { data: simplifiedUserData } = useDataSimplifiedUser({ _id: userId });

	//
	// C. Render components

	if (format === 'inline') {
		return (
			<span className={styles.wrapper}>
				{simplifiedUserData?.first_name || 'N/A'}
			</span>
		);
	}

	return (
		<Tag
			label={simplifiedUserData?.first_name || 'N/A'}
			variant="secondary"
		/>
	);
}
