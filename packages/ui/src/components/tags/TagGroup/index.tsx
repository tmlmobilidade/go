/* * */

import styles from './styles.module.css';

import { Label } from '../../display/Label';
import { Tag, TagProps } from '../Tag';

/* * */

export interface TagGroupProps {
	limit?: number
	tags: TagProps[]
}

/* * */

export function TagGroup({ limit = 2, tags = [] }: TagGroupProps) {
	//

	//
	// A. Transform data

	const slicedTags = tags.slice(0, limit);
	const remainingTagCount = tags.length - slicedTags.length;

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{slicedTags.map((props, index) => (
				<Tag key={index} {...props} />
			))}
			{remainingTagCount > 0 && (
				<Label>+{remainingTagCount}</Label>
			)}
		</div>
	);

	//
}
