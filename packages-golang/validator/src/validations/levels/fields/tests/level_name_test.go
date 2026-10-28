package levels_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/levels/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/levels/utils"
	"testing"
)

func TestLevelNameField(t *testing.T) {
	testutils.CheckPresence(t, "level_name", checks.LevelNameField)
}
