package rules

// SeverityRank orders severities so a rule that reported at more than one severity
// is summarised by the most serious one it produced.
var SeverityRank = map[Severities]int{
	SEVERITY_IGNORE:  0,
	SEVERITY_INFO:    1,
	SEVERITY_WARNING: 2,
	SEVERITY_ERROR:   3,
}
