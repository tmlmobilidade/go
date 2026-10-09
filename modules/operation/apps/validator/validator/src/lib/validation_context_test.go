package lib

import (
	"main/i18n"
	"main/types"
	"strings"
	"testing"
)

func TestValidationContextTranslatesUsingRuleID(t *testing.T) {
	original := i18n.AppTranslator
	defer func() { i18n.AppTranslator = original }()
	for _, language := range []string{"en", "pt"} {
		i18n.AppTranslator = i18n.NewTranslator(language)
		context := NewValidationContext("agency_id", "agency.txt", "agency_id_unique", 0, nil)
		message := context.GetTranslatedMessage("duplicate", "AGENCY-123")
		if !strings.Contains(message, "AGENCY-123") || strings.Contains(message, "%!") || strings.Contains(message, "agency_id_unique.") {
			t.Fatalf("%s: detail was not translated/formatted: %s", language, message)
		}
		context.WithSeverity(types.SEVERITY_ERROR)
		required := context.GetRequiredMessage("required", "recommended")
		context.WithSeverity(types.SEVERITY_WARNING)
		recommended := context.GetRequiredMessage("required", "recommended")
		if required == recommended || strings.Contains(required, "agency_id_unique.") || strings.Contains(recommended, "agency_id_unique.") {
			t.Fatalf("%s: required/recommended details were not resolved: %s / %s", language, required, recommended)
		}
		if generic := context.GetTranslatedMessage("generic"); generic == "agency_id_unique.generic" || generic == required {
			t.Fatalf("%s: generic summary was not resolved: %s", language, generic)
		}
	}
}
