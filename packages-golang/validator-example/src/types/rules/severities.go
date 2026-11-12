package rules

// Severities are the possible severity levels for a validation rule.
type Severities string

const (
	SEVERITY_IGNORE Severities = "ignore"
	SEVERITY_INFO Severities = "info"
	SEVERITY_WARNING Severities = "warning"
	SEVERITY_ERROR Severities = "error"
)