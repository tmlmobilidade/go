package transfers_fields_test

import (
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestMinTransferTimeField(t *testing.T) {
	testutils.CheckPresence(t, "min_transfer_time", checks.MinTransferTimeField)
}
