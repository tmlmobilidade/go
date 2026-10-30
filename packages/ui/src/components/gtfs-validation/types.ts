import { type AgencyPlans } from '@tmlmobilidade/go-types-core';
import { type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';
import { ReactNode } from 'react';

export interface GtfsValidationRulesEditorProps {
	onChange: (rules: AgencyPlans['validation_rules']) => void
	readOnly: boolean
	rules: AgencyPlans['validation_rules']
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
