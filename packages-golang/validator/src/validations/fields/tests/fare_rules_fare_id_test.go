package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFareRulesFareIdField(t *testing.T) {
	validationutils.FareRulesCheckPresence(t, "fare_id", fields.FareRulesFareIdField)
}
