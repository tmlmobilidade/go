package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLevelsLevelIdField(t *testing.T) {
	validationutils.LevelsCheckPresence(t, "level_id", fields.LevelsLevelIdField)
}
