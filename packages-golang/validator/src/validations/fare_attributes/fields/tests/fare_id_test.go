package fare_attributes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"testing"
)

func TestFareIdField(t *testing.T) { testutils.CheckPresence(t, "fare_id", checks.FareIdField) }
