package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestIsBidirectionalField(t *testing.T) {
	testutils.CheckPresence(t, "is_bidirectional", checks.IsBidirectionalField)
}
