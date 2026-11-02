package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestMinTransferTimeField(t *testing.T) {
	validationutils.TransfersCheckPresence(t, "min_transfer_time", fields.MinTransferTimeField)
}
