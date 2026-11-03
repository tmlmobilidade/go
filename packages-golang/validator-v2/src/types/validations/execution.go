package validations_types

import (
	"sync"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// Execution shares immutable inputs and one synchronized collector across workers.
// Only the scheduler owns rule statuses; workers record operational errors here.
type Execution struct {
	Tables   *sqliteTypes.SQLiteTables
	Messages messages.MessageService
	Mu       sync.Mutex
	Failures map[string]error
	Err      error // Combined technical errors; read after all workers finish
}
