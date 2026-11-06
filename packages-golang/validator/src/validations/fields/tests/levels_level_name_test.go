package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLevelNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "levels_level_name_field",
		table: "levels",
		field: "level_name",
		run:   fields.LevelNameField,
	})
}
