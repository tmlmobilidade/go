package presentation

import (
	"time"
)

func Init() { Terminate(time.Now().UTC().Format("2006-01-02T15:04:05.000Z")) }
