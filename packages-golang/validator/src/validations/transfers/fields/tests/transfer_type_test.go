package transfers_fields_test

import (
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestTransferTypeField(t *testing.T) {
	testutils.CheckPresence(t, "transfer_type", checks.TransferTypeField)
}
