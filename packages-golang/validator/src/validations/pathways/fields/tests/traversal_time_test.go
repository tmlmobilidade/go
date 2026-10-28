package pathways_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/utils"
	"testing"
)

func TestTraversalTimeField(t *testing.T) {
	testutils.CheckPresence(t, "traversal_time", checks.TraversalTimeField)
}
