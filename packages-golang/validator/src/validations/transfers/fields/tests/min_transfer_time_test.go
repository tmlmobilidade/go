package transfers_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/utils"
	"testing"
)

func TestMinTransferTimeField(t *testing.T) {
	testutils.CheckPresence(t, "min_transfer_time", checks.MinTransferTimeField)
}
