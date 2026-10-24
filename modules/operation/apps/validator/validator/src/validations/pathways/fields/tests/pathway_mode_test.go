package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestPathwayModeField(t *testing.T) {
	testutils.CheckPresence(t, "pathway_mode", checks.PathwayModeField)
}
