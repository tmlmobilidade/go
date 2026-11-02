package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestMunicipalityIdField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "municipality_id", fields.MunicipalityIdField, 1)
}
