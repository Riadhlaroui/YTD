package main

import (
	"log"
	"net/http"
	"os/exec"
)

func downloadHandler(w http.ResponseWriter, r *http.Request) {
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
	http.HandleFunc("/api/download", downloadHandler)
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
