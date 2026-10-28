package vehicles_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"testing"
)

func TestModelField(t *testing.T) { testutils.CheckPresence(t, "model", checks.ModelField) }
