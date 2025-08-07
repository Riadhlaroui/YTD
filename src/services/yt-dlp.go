package main

import (
	"log"
	"net/http"
	"os"
	"os/exec"
)

func downloadHandler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	downloadPath := r.URL.Query().Get("path")

	if url == "" {
		http.Error(w, "Missing URL", http.StatusBadRequest)
		return
	}

	if downloadPath == "" {
		http.Error(w, "Missing download path", http.StatusBadRequest)
		return
	}

	log.Println("Download URL:", url)
	log.Println("Download Path:", downloadPath)

	err := os.MkdirAll(downloadPath, os.ModePerm)
	if err != nil {
		http.Error(w, "Failed to create path: "+err.Error(), http.StatusInternalServerError)
		return
	}

	cmd := exec.Command(
		"yt-dlp",
		"-f", "bv*+ba/b",
		"--merge-output-format", "mp4",
		"-P", downloadPath,
		url,
	)

	output, err := cmd.CombinedOutput()
	log.Println("yt-dlp output:", string(output))
	if err != nil {
		http.Error(w, "yt-dlp error: "+err.Error()+"\n\n"+string(output), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func videoInfoHandler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "Missing URL", http.StatusBadRequest)
		return
	}

	// Run yt-dlp to get video info (or change this to download)
	cmd := exec.Command("yt-dlp", "--dump-json", url)
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to run yt-dlp: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return JSON response to frontend
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func main() {
	http.HandleFunc("/api/fetchInfo", videoInfoHandler)
	http.HandleFunc("/api/download", downloadHandler)
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
