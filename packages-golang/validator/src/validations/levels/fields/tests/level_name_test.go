package levels_fields_test

import (
	checks "main/validations/levels/fields/checks"
	testutils "main/validations/levels/utils"
	"testing"
)

func TestLevelNameField(t *testing.T) {
	testutils.CheckPresence(t, "level_name", checks.LevelNameField)
}
