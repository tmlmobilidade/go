package types

// Summary is the exported validation report. Totals count distinct collected diagnostics.
type Summary struct {
	Results []RuleResult `json:"results"`
	Totals  Totals       `json:"totals"`
}

type Totals struct {
	Errors   int `json:"errors"`
	Warnings int `json:"warnings"`
	Infos    int `json:"infos"`
}

// RuleResult groups sampled findings for one rule.
type RuleResult struct {
	Description string     `json:"description"`
	Messages    []Message  `json:"messages"`
	RuleID      string     `json:"rule_id"`
	Severity    Severities `json:"severity"`
	TotalRows   int        `json:"total_rows"` // Distinct affected rows across all files before sampling.
}

// Message contains the rule's diagnostic text and sampled CSV line numbers.
type Message struct {
	Message string `json:"message"`
	Rows    []int  `json:"rows"`
}
