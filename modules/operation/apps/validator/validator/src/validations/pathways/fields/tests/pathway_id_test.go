package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestPathwayIdField(t *testing.T) {
	testutils.CheckPresence(t, "pathway_id", checks.PathwayIdField)
}
