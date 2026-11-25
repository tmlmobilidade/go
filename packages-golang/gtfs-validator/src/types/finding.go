package types

// Finding is a diagnostic produced by a rule. Rows are zero-based input rows.
type Finding struct {
	Description            string // Generic description used by the report group.
	DescriptionTranslation *Translation
	Severity               Severities
	Message                string
	MessageTranslation     *Translation
	FileName               string
	Field                  string
	Rows                   []int
}
