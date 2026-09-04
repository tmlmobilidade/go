/* * */

import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { Tag, TagGroup } from '@tmlmobilidade/ui';

/* * */

interface ApexValidationStatusTagProps {
	value: SimplifiedApexValidation['validation_status']
}

/* * */

export function ApexValidationStatusTag({ value }: ApexValidationStatusTagProps) {
	//

	if (value === '0') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'success' },
				{ filled: true, label: 'Contract Valid', variant: 'success' },
			]}
			/>
		);
	}

	if (value === '1') {
		return (
			<TagGroup tags={[
				{ filled: false, label: value, variant: 'muted' },
				{ filled: false, label: 'Antipassback', variant: 'muted' },
			]}
			/>
		);
	}

	if (value === '2') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'Card In Black List', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '3') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'SAM In Black List', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '4') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'success' },
				{ filled: true, label: 'Card in White List', variant: 'success' },
			]}
			/>
		);
	}

	if (value === '5') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'success' },
				{ filled: true, label: 'Profile In White List', variant: 'success' },
			]}
			/>
		);
	}

	if (value === '6') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'success' },
				{ filled: true, label: 'Interchange', variant: 'success' },
			]}
			/>
		);
	}

	if (value === '7') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'warning' },
				{ filled: true, label: 'Interrupted', variant: 'warning' },
			]}
			/>
		);
	}

	if (value === '8') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'No Valid Contract', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '9') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'Card Invalidated', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '10') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'Events Full', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '11') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'Not Enough Units', variant: 'danger' },
			]}
			/>
		);
	}

	if (value === '12') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'danger' },
				{ filled: true, label: 'Contract Expired', variant: 'danger' },
			]}
			/>
		);
	}

	return <Tag label="N/A" variant="muted" />;

	//
}
