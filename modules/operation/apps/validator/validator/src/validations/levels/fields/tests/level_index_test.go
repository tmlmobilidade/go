package levels_fields_test

import (
	checks "main/validations/levels/fields/checks"
	testutils "main/validations/levels/utils"
	"testing"
)

func TestLevelIndexField(t *testing.T) {
	testutils.CheckPresence(t, "level_index", checks.LevelIndexField)
}
