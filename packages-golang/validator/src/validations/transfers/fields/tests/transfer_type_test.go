package transfers_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/utils"
	"testing"
)

func TestTransferTypeField(t *testing.T) {
	testutils.CheckPresence(t, "transfer_type", checks.TransferTypeField)
}
