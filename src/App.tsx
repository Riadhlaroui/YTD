import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ArrowBigDownDash, Eye, Moon, Search, Sun } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { DownloadDialog } from "./components/DownloadDialog";

function App() {
	const API_KEY = import.meta.env.VITE_YT_API_KEY;

	const [searchQuery, setSearchQuery] = useState("");
	const [title, setTitle] = useState<string>("");
	const [thumbnail, setThumbnail] = useState<string>("");
	const [views, setViews] = useState<number>(0);
	const [videoId, setVideoId] = useState<string>("");

	const [isChecked, setIsChecked] = useState(false);

	const [showDownloadDialog, setShowDownloadDialog] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		setIsChecked(savedTheme === "dark");
	}, []);

	const handleCheckboxChange = () => {
		const newChecked = !isChecked;
		setIsChecked(newChecked);

		if (newChecked) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	function getYoutubeVideoId(url: string): string | null {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.searchParams.get("v");
		} catch (e) {
			console.error("Invalid URL", e);
			return null;
		}
	}

	function formatViews(views: number): string {
		if (views >= 1_000_000_000) {
			return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
		} else if (views >= 1_000_000) {
			return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
		} else if (views >= 1_000) {
			return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
		}
		return views.toString();
	}

	async function searchVideos() {
		console.log("User search query = " + searchQuery);

		const videoId = getYoutubeVideoId(searchQuery);

		const videoResources = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
		);

		const res = await fetch(
			`/api/download?url=https://www.youtube.com/watch?v=${videoId}`
		);

		if (!res.ok) {
			const text = await res.text();
			console.error("Backend error response:", text);
			throw new Error("Server error while downloading video");
		}

		const contentType = res.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) {
			const text = await res.text();
			console.error("Unexpected response format:", text);
			throw new Error("Expected JSON from /api/download, got something else.");
		}

		const data = await res.json();
		console.log("Video data using yt-dlp: ", data);

		const videoData = await videoResources.json();

		console.log("Youtube API video data: ", videoData);

		const titleData = videoData.items[0].snippet.title;
		const thumbnailData = videoData.items[0].snippet.thumbnails.standard.url;
		const viewsData = videoData.items[0].statistics.viewCount;

		console.log(videoId);
		if (videoId) setVideoId(videoId);
		setTitle(titleData);
		setThumbnail(thumbnailData);
		setViews(viewsData);
	}

	return (
		<div className="w-full px-4 py-8 bg-[#f6f6f6] dark:bg-[#121212]  text-black dark:text-white">
			{/* Top Bar */}
			<div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
				<div className="flex w-full items-center gap-2">
					<Input
						id="search"
						type="text"
						placeholder="YouTube URL"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								searchVideos();
							}
						}}
					/>
					<Button variant="outline" onClick={searchVideos}>
						<Search />
					</Button>
				</div>

				{/* Theme Toggle */}
				<div className="fixed top-4 right-4 z-50">
					<div className="flex items-center justify-between w-full">
						<label className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1f1f1f]">
							<input
								type="checkbox"
								className="sr-only peer"
								checked={isChecked}
								onChange={handleCheckboxChange}
							/>
							{/* Light */}
							<span
								className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-md transition-all ${
									!isChecked
										? "bg-gray-200 text-black dark:bg-white/10 dark:text-white"
										: "text-gray-500 dark:text-gray-400"
								}`}
							>
								<Sun className="w-4 h-4" />
							</span>
							{/* Dark */}
							<span
								className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-md transition-all ${
									isChecked
										? "bg-gray-200 text-black dark:bg-white/10 dark:text-white"
										: "text-gray-500 dark:text-gray-400"
								}`}
							>
								<Moon className="w-4 h-4" />
							</span>
						</label>
					</div>
				</div>
			</div>

			{/* Video Card */}
			{videoId && (
				<div className="flex items-center justify-center mt-10">
					<div className="flex flex-col w-full max-w-[47rem] border border-gray-200 dark:border-[rgba(229,229,229,0.2)] rounded-lg overflow-hidden shadow-xl bg-[#f2f2f2] dark:bg-[#1e1e1e]">
						<a
							href={`https://www.youtube.com/watch?v=${videoId}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src={thumbnail}
								alt={title}
								className="w-full object-cover"
							/>
						</a>

						<div className="p-4">
							<div className="flex justify-between items-start">
								<p className="text-lg font-semibold leading-snug">{title}</p>
								<div className="relative group w-fit">
									{/* Shadow */}
									<div
										className="absolute inset-0 rounded-md bg-black/30 translate-y-0.5 group-hover:translate-y-1 group-active:translate-y-0 transition-transform duration-300"
										aria-hidden="true"
									></div>

									{/* Edge */}
									<div
										className="absolute inset-0 rounded-md bg-gradient-to-l from-[#2a2a2a] to-[#171616]"
										aria-hidden="true"
									></div>

									{/* Front face with icon */}
									<button
										onClick={() => setShowDownloadDialog(true)}
										className="relative z-10 flex items-center justify-center p-1.5 rounded-md bg-gradient-to-b from-[#2a2a2a] to-[#171616] transform -translate-y-[2px] group-hover:-translate-y-[4px] group-active:-translate-y-[1px] transition-transform duration-300 hover:cursor-pointer"
									>
										<ArrowBigDownDash className="w-4 h-4 text-white" />
									</button>
								</div>
							</div>

							<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
								<Eye className="w-4 h-4" />
								<span>{formatViews(views)} views</span>
							</div>

							<Separator className="w-full h-[1px] bg-gray-300 dark:bg-gray-700 my-3" />
						</div>
					</div>
				</div>
			)}

			<DownloadDialog
				open={showDownloadDialog}
				onClose={() => setShowDownloadDialog(false)}
				fieldLabel={"Video name"}
				fieldName={""}
				onSubmit={() => {
					console.log("Start downloading");
				}}
			/>
		</div>
	);
}

export default App;
