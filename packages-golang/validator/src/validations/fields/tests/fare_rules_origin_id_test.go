package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestOriginIdField(t *testing.T) {
	validationutils.FareRulesCheckPresence(t, "origin_id", fields.OriginIdField)
}
