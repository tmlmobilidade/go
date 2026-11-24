import { type GtfsValidatorRuleId, type GtfsValidatorRulesDraft } from '@tmlmobilidade/go-types-gtfs-validator';
import { ReactNode } from 'react';

export interface GtfsValidationRulesEditorProps {
	onChange: (rules: GtfsValidatorRulesDraft) => void
	readOnly: boolean
	rules: GtfsValidatorRulesDraft
}

export interface GtfsValidationRuleSettingCardProps {
	description: string
	onRemove?: () => void
	removeLabel: string
	title: string
}

export interface GtfsValidationRulesTableProps extends GtfsValidationRulesEditorProps {
	entries: GtfsValidatorRuleId[]
	title: ReactNode
}

export interface GtfsValidationRuleSeverityProps extends GtfsValidationRulesEditorProps {
	rule: GtfsValidatorRuleId
}
