package importgtfs

/* * */

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

/* * */

// Resolves a local archive or downloads it to a temporary file.
func prepareSource(source ImportGtfsConfigSource) (string, func(), error) {
	cleanup := func() {}
	if (source.Path == "") == (source.Url == "") {
		return "", cleanup, errors.New("source must contain exactly one of Path or Url")
	}
	if source.Path != "" {
		return source.Path, cleanup, nil
	}

	client := http.Client{Timeout: 30 * time.Minute}
	response, err := client.Get(source.Url)
	if err != nil {
		return "", cleanup, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", cleanup, fmt.Errorf("download GTFS: %s", response.Status)
	}
	file, err := os.CreateTemp("", "import-gtfs-*.zip")
	if err != nil {
		return "", cleanup, err
	}
	cleanup = func() { os.Remove(file.Name()) }
	_, copyError := io.Copy(file, response.Body)
	closeError := file.Close()
	if err := errors.Join(copyError, closeError); err != nil {
		cleanup()
		return "", func() {}, err
	}
	return file.Name(), cleanup, nil
}
