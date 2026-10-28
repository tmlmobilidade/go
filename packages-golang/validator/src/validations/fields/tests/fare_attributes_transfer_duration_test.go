package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTransferDurationField(t *testing.T) {
	validationutils.FareAttributesCheckPresence(t, "transfer_duration", fields.TransferDurationField)
}
