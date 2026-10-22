package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestStairCountField(t *testing.T) {
	testutils.CheckPresence(t, "stair_count", checks.StairCountField)
}
