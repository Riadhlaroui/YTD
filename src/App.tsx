import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
	ArrowBigDownDash,
	Eye,
	Moon,
	Search,
	Sun,
	Youtube,
} from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { DownloadDialog } from "./components/DownloadDialog";
import { Skeleton } from "./components/ui/skeleton";

function App() {
	const API_KEY = import.meta.env.VITE_YT_API_KEY;

	const [searchQuery, setSearchQuery] = useState("");
	const [title, setTitle] = useState<string>("");
	const [thumbnail, setThumbnail] = useState<string>("");
	const [views, setViews] = useState<number>(0);
	const [videoId, setVideoId] = useState<string>("");

	const [isChecked, setIsChecked] = useState(false);

	const [loading, setLoading] = useState(false);

	const [showDownloadDialog, setShowDownloadDialog] = useState(false);

	const [fullTitle, setFullTitle] = useState("");
	const [channelTitle, setChannelTitle] = useState("");
	const [channelUrl, setChannelUrl] = useState("");

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
		setLoading(true); // START loading
		try {
			console.log("User search query = " + searchQuery);
			setVideoId("");

			const videoId = getYoutubeVideoId(searchQuery);
			if (!videoId) {
				throw new Error("Invalid YouTube URL");
			}

			const videoResources = await fetch(
				`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
			);

			const res = await fetch(
				`/api/fetchInfo?url=https://www.youtube.com/watch?v=${videoId}`
			);

			if (!res.ok) {
				const text = await res.text();
				console.error("Backend error response:", text);
				throw new Error("Server error while fetching video info");
			}

			const contentType = res.headers.get("content-type") || "";
			if (!contentType.includes("application/json")) {
				const text = await res.text();
				console.error("Unexpected response format:", text);
				throw new Error(
					"Expected JSON from /api/fetchInfo, got something else."
				);
			}

			const data = await res.json();
			console.log("Video data using yt-dlp: ", data);

			setFullTitle(data.fulltitle);
			setChannelTitle(data.channel);
			setChannelUrl(data.channel_url);

			const videoData = await videoResources.json();
			console.log("Youtube API video data: ", videoData);

			const titleData = videoData.items[0].snippet.title;
			const thumbnailData = videoData.items[0].snippet.thumbnails.standard.url;
			const viewsData = videoData.items[0].statistics.viewCount;

			setVideoId(videoId);
			setTitle(titleData);
			setThumbnail(thumbnailData);
			setViews(viewsData);
		} catch (error) {
			console.error("Search error:", error);
			alert(error instanceof Error ? error.message : "Unknown error occurred");
		} finally {
			setLoading(false);
			setSearchQuery("");
		}
	}

	return (
		<div className="w-full px-4 py-8 bg-[#f6f6f6] dark:bg-[#121212]  text-black dark:text-white">
			{/* Top Bar */}
			<div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
				<div className="flex w-full items-center gap-2">
					<Input
						id="search"
						type="text"
						className=" "
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
					<Button variant="outline" onClick={searchVideos} disabled={loading}>
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

			{loading && (
				<div className="flex flex-col gap-6 mt-6 w-full max-w-[47rem] mx-auto">
					{/* Video thumbnail skeleton */}
					<Skeleton className="h-[480px] w-full rounded-lg bg-[#c9ced8] dark:bg-[#1f1f1f]" />

					{/* Text skeletons */}
					<div className="flex flex-col gap-3">
						<Skeleton className="h-6 w-2/5 bg-[#c9ced8] dark:bg-[#1f1f1f]" />{" "}
						{/* Title */}
						<Skeleton className="h-4 w-3/5 bg-[#c9ced8] dark:bg-[#1f1f1f]" />{" "}
						{/* Subtitle */}
					</div>
				</div>
			)}
			{/* Video Card */}
			{videoId && (
				<div className="flex items-center justify-center mt-6">
					<div className="flex flex-col w-full max-w-[48rem] border border-black dark:border-[rgba(229,229,229,0.27)] rounded-lg overflow-hidden shadow-xl bg-[#f2f2f2] dark:bg-[#1e1e1e]">
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

							<Separator className="w-full h-[1px] bg-gray-300 dark:bg-gray-700 my-3" />

							<div className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Youtube className="w-5 h-5 text-gray-500 dark:text-gray-400" />
								<p className="text-foreground">Channel:</p>
								<a href={channelUrl} target="_blank" rel="noopener noreferrer">
									<span className="text-gray-700 dark:text-gray-300 hover:underline hover:text-primary transition-colors truncate">
										{channelTitle}
									</span>
								</a>
							</div>

							<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
								<Eye className="w-4 h-4" />
								<span>{formatViews(views)} views</span>
							</div>
						</div>
					</div>
				</div>
			)}

			<DownloadDialog
				open={showDownloadDialog}
				videoId={videoId}
				onClose={() => setShowDownloadDialog(false)}
				fileName={fullTitle}
				onSubmit={() => {
					console.log("Start downloading");
				}}
			/>
		</div>
	);
}

export default App;
