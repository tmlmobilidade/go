package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDestinationIdField(t *testing.T) {
	validationutils.FareRulesCheckPresence(t, "destination_id", fields.DestinationIdField)
}
