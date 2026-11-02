package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRoutesAgencyIdField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "agency_id", fields.RoutesAgencyIdField)
}
