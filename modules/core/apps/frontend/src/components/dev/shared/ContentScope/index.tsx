'use client';

import { ContentModuleIdSchema, ContentModuleIdValues, type ContentScope } from '@tmlmobilidade/go-types-core';
import { Label, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface ContentScopeProps {
	disabled: boolean
	error?: string
	onChange: (value: ContentScope) => void
	value?: ContentScope
}

/* * */

export function ContentScope({ disabled, error, onChange, value }: ContentScopeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const type = value?.type ?? 'platform';
	const options = ContentModuleIdValues.map(id => ({ label: t(`shared:components.changelog.modules.${id}`), value: id }));

	//
	// B. Render components

	return (
		<Section gap="sm" padding="none">
			<Select
				clearable={false}
				disabled={disabled}
				label={t('default:dev.fields.scope')}
				onChange={next => onChange(next === 'modules' ? { module_ids: ['core'], type: 'modules' } : { type: 'platform' })}
				value={type}
				w="100%"
				data={[
					{ label: t('default:dev.scope.platform'), value: 'platform' },
					{ label: t('default:dev.scope.modules'), value: 'modules' },
				]}
			/>
			{type === 'modules' && (
				<MultiSelect
					data={options}
					disabled={disabled}
					error={error}
					label={t('default:dev.fields.modules')}
					value={value?.type === 'modules' ? value.module_ids : []}
					w="100%"
					onChange={(ids) => {
						const parsed = ids.map(id => ContentModuleIdSchema.parse(id));
						if (parsed.length) onChange({ module_ids: [parsed[0], ...parsed.slice(1)], type: 'modules' });
					}}
				/>
			)}
			{error && <Label variant="danger">{error}</Label>}
		</Section>
	);
}
