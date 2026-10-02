import { RuleCatalogueEntry, type ValidationRulesInput } from '@tmlmobilidade/go-types-gtfs-validator';
import { ReactNode } from 'react';

export interface GtfsValidationRulesEditorProps {
	onChange: (rules: ValidationRulesInput) => void
	readOnly: boolean
	rules: ValidationRulesInput
}

export interface GtfsValidationRuleSettingCardProps {
	description: string
	onRemove?: () => void
	removeLabel: string
	title: string
}

export interface GtfsValidationRulesTableProps extends GtfsValidationRulesEditorProps {
	entries: RuleCatalogueEntry[]
	showGroup?: boolean
	title: ReactNode
}

export interface GtfsValidationRuleSeverityProps extends GtfsValidationRulesEditorProps {
	rule: RuleCatalogueEntry
}
