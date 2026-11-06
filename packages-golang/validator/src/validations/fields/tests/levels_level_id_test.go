package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLevelsLevelIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "levels_level_id_field",
		table: "levels",
		field: "level_id",
		run:   fields.LevelsLevelIdField,
	})
}
