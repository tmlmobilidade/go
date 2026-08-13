package lib

import (
	"main/i18n"
	"main/types"
)

// MessageAdder is an interface for adding validation messages
// This avoids import cycles by not depending on services.MessageService directly
type MessageAdder interface {
	AddMessage(message types.Message)
}

// ValidationContext encapsulates common validation patterns and reduces duplication
// across validation functions. It handles message creation, severity checking,
// and common validation logic.
type ValidationContext struct {
	// Field name being validated (e.g., "stop_code")
	Field string

	// File name (e.g., "stops.txt")
	FileName string

	// Row number (0-based index)
	Row int

	// RuleID is the default rule_id in output; use Add* methods' ruleID override for a
	// more specific id when a validation emits several distinct error kinds.
	RuleID string

	// Severity from rules (defaults to SEVERITY_IGNORE)
	Severity types.Severity

	// Message adder for adding messages (avoids import cycle)
	MessageAdder MessageAdder
}

// NewValidationContext creates a new ValidationContext with default severity
func NewValidationContext(field, fileName, ruleID string, row int, messageAdder MessageAdder) *ValidationContext {
	return &ValidationContext{
		Field:        field,
		FileName:     fileName,
		Row:          row,
		RuleID:       ruleID,
		Severity:     types.SEVERITY_IGNORE,
		MessageAdder: messageAdder,
	}
}

// WithSeverity sets the severity from rules and returns the context for chaining
func (vc *ValidationContext) WithSeverity(severity types.Severity) *ValidationContext {
	if severity != "" {
		vc.Severity = severity
	}
	return vc
}

// ShouldIgnore returns true if validation should be skipped (IGNORE severity)
func (vc *ValidationContext) ShouldIgnore() bool {
	return vc.Severity == types.SEVERITY_IGNORE
}

// IsForbidden returns true if the field is forbidden (FORBIDDEN severity)
func (vc *ValidationContext) IsForbidden() bool {
	return vc.Severity == types.SEVERITY_FORBIDDEN
}

// ShouldSkip returns true if validation should be skipped (IGNORE or FORBIDDEN)
func (vc *ValidationContext) ShouldSkip() bool {
	return vc.ShouldIgnore() || vc.IsForbidden()
}

// AddError adds an error message. Optional ruleID overrides the context default
// (used when a single validation reports multiple distinguishable issues).
func (vc *ValidationContext) AddError(message string, ruleID ...string) {
	vc.AddMessage(message, types.SEVERITY_ERROR, ruleID...)
}

// AddWarning adds a warning message. Optional ruleID overrides the default.
func (vc *ValidationContext) AddWarning(message string, ruleID ...string) {
	vc.AddMessage(message, types.SEVERITY_WARNING, ruleID...)
}

// AddMessage adds a message with the specified severity. If ruleID is passed,
// it is used as rule_id; otherwise the context RuleID is used.
func (vc *ValidationContext) AddMessage(message string, severity types.Severity, ruleID ...string) {
	rid := vc.RuleID
	if len(ruleID) > 0 {
		rid = ruleID[0]
	}
	vc.MessageAdder.AddMessage(types.Message{
		Field:    vc.Field,
		FileName: vc.FileName,
		Rows:     []int{vc.Row},
		Message:  message,
		Severity: severity,
		RuleID:   rid,
	})
}

// AddMessageWithSeverity adds a message using the context's severity. Optional
// ruleID overrides the default.
func (vc *ValidationContext) AddMessageWithSeverity(message string, ruleID ...string) {
	vc.AddMessage(message, vc.Severity, ruleID...)
}

// GetTranslatedMessage gets a translated message by key
func (vc *ValidationContext) GetTranslatedMessage(key string, args ...interface{}) string {
	return i18n.AppTranslator.Get(key, args...)
}

// GetRequiredMessage gets a translated message for required field validation
func (vc *ValidationContext) GetRequiredMessage(requiredKey, recommendedKey string) string {
	if vc.Severity == types.SEVERITY_ERROR {
		return vc.GetTranslatedMessage(requiredKey)
	}
	return vc.GetTranslatedMessage(recommendedKey)
}
