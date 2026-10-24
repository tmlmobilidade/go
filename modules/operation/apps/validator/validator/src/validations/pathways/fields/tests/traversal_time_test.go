package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestTraversalTimeField(t *testing.T) {
	testutils.CheckPresence(t, "traversal_time", checks.TraversalTimeField)
}
