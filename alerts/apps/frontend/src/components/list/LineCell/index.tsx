import { useLinesContext } from '@/contexts/Lines.context';
import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function LineCell({ line_ids }: { line_ids: string[] }) {
	//

	//
	// A. Setup variables
	const { data: { lines } } = useLinesContext();

	//
	// B. Render
	return (
		<div className={styles.wrapper}>
			<div className={styles.badges}>
				{line_ids.slice(0, 2).map((line, index) => (
					<Tag key={`${line}-${index}`} label={lines.find(l => l.id === line)?.id} variant="muted" />
				))}
			</div>
			{line_ids.length > 2 && <span>+{line_ids.length - 2}</span>}
		</div>
	);
}
