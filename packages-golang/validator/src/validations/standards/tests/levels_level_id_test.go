package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestLevelsLevelId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "levels_level_id_field",
		table: "levels",
		field: "level_id",
		run:   standard.LevelsLevelIdField,
	})
}
