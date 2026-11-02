package presentation

import (
	"fmt"
	"os"
)

func Title(message string) { fmt.Fprintf(os.Stdout, "\n▶︎ %s\n\n", message) }
