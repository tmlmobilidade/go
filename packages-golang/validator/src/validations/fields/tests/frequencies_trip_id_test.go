package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFrequenciesTripIdField(t *testing.T) {
	validationutils.FrequenciesCheckPresence(t, "trip_id", fields.FrequenciesTripIdField)
}
