package fare_attributes_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_attributes/utils"
	"testing"
)

func TestTransfersField(t *testing.T) {
	testutils.CheckPresence(t, "transfers", checks.TransfersField)
}
