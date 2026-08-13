package types

type Severity string

const (
	SEVERITY_IGNORE    Severity = "ignore"
	SEVERITY_ERROR     Severity = "error"
	SEVERITY_WARNING   Severity = "warning"
	SEVERITY_FORBIDDEN Severity = "forbidden"
)

type Message struct {
	Rows     []int    `json:"rows"`
	Field    string   `json:"field"`
	FileName string   `json:"file_name"`
	Message  string   `json:"message"`
	RuleID   string   `json:"rule_id"`
	Severity Severity `json:"severity"`
}

type Summary struct {
	Messages      []Message `json:"messages"`
	TotalErrors   int       `json:"total_errors"`
	TotalWarnings int       `json:"total_warnings"`
}
