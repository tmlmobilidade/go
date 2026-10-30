package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestContainsIdField(t *testing.T) {
	validationutils.FareRulesCheckPresence(t, "contains_id", fields.ContainsIdField)
}
