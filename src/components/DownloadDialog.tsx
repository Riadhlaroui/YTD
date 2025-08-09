import { useEffect, useRef, useState } from "react";
import { CircleX, Download, Info, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface DownloadDialogProps {
	open: boolean;
	videoId: string;
	onClose: () => void;
	fileName: string;
	fileSize: number;
	onSubmit: (newValue: string) => void;
	setProgress: (value: number) => void;
	setIsDownloading: (value: boolean) => void;
	setDownloadComplete: (value: boolean) => void;
	setError: (value: boolean) => void;
}

const STORAGE_KEY = "download_paths";

export function DownloadDialog({
	open,
	videoId,
	onClose,
	fileName,
	fileSize,
	setProgress,
	setIsDownloading,
	setDownloadComplete,
	setError,
}: DownloadDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const [paths, setPaths] = useState<string[]>([]);
	const [path, setPath] = useState("");
	const [adding, setAdding] = useState(false);
	const [newPath, setNewPath] = useState("");

	// Load from localStorage
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				setPaths(JSON.parse(saved)); // parses to string[]
			} catch {
				console.warn("Invalid download_paths in localStorage");
				setPaths([]);
			}
		}
	}, []);

	useEffect(() => {
		if (paths.length > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
		}
	}, [paths]);

	const handleAddClick = () => {
		setNewPath("");
		setAdding(true);
	};

	const handleSave = () => {
		const trimmed = newPath.trim();
		if (trimmed && !paths.includes(trimmed)) {
			setPaths((prev) => [...prev, trimmed]);
			setPath(trimmed);
		}
		setAdding(false);
	};

	const handleCancel = () => {
		setAdding(false);
	};

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [open]);

	async function sendDownloadRequest(videoId: string) {
		setIsDownloading(true);
		setProgress(0);

		let progressValue = 0;

		const interval = setInterval(() => {
			progressValue += 1;
			if (progressValue >= 97) {
				clearInterval(interval);
			}
			setProgress(progressValue);
		}, 69);

		try {
			const res = await fetch(
				`/api/download?url=https://www.youtube.com/watch?v=${videoId}&path=${path}`
			);

			if (!res.ok) {
				const errText = await res.text();
				throw new Error(errText);
			}

			const data = await res.text();
			console.log("yt-dlp download output:", data);

			setProgress(100);
			setDownloadComplete(true);
		} catch (err) {
			console.error("Download error:", err);
			setError(true);
			setProgress(0);
		} finally {
			clearInterval(interval);
			setIsDownloading(false);
		}
	}

	function formatFileSize(bytes: number) {
		if (bytes === 0) return "0 B";

		const units = ["B", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));

		if (i >= 0 && i < units.length) {
			return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
		}
		return "Unknown";
	}

	const handleSubmit = () => {
		if (!path) return;
		sendDownloadRequest(videoId);
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed p-2 inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
			<div
				ref={dialogRef}
				className="bg-white dark:bg-[#262626] text-black dark:text-white rounded-lg shadow-lg w-full max-w-md p-4.5 space-y-4 relative"
			>
				<button
					onClick={onClose}
					className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white hover:cursor-pointer hover:bg-gray-600/20 transition-colors duration-200"
				>
					<X size={20} />
				</button>

				<h2 className="text-xl font-semibold">Download Configuration</h2>

				<div className="space-y-2">
					<h3 className="text-lg font-medium opacity-80">File Info:</h3>
					<div className="p-3 border border-black dark:border-[rgba(229,229,229,0.27)] rounded-md flex flex-col bg-[#e2e2e284] dark:bg-[#333438c7] gap-3">
						<div className="flex flex-col">
							<span className="opacity-70">Title</span>
							<span>{fileName}</span>
						</div>
						<div className="flex flex-col">
							<span className="opacity-70">Size</span>
							<span>{formatFileSize(fileSize)}</span>
						</div>
					</div>
				</div>

				<Separator />

				<div className="space-y-2">
					<label className="font-medium opacity-70">
						Please select the destination folder:
					</label>
					<Select onValueChange={setPath} value={path}>
						<SelectTrigger className="w-full mt-1">
							<SelectValue placeholder="Select or add a folder" />
						</SelectTrigger>
						<SelectContent>
							{/* existing saved paths */}
							{paths.map((p) => (
								<SelectItem key={p} value={p}>
									{p}
								</SelectItem>
							))}

							<div className="border-t my-2" />

							{/* Add NEW Path button */}
							{!adding ? (
								<button
									onClick={handleAddClick}
									className="flex items-center gap-1 px-4 py-2 text-sm text-primary hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
								>
									<PlusCircle className="w-4 h-4" /> Add new path
								</button>
							) : (
								<div className="p-4 space-y-2">
									<Input
										value={newPath}
										onChange={(e) => setNewPath(e.target.value)}
										placeholder="Enter full folder path"
									/>
									<div className="flex justify-end gap-2">
										<Button variant="outline" size="sm" onClick={handleCancel}>
											Cancel
										</Button>
										<Button size="sm" onClick={handleSave}>
											Save
										</Button>
									</div>
								</div>
							)}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
					<Info className="w-4 h-4 mt-0.5" />
					<p>
						<span className="font-medium">Note:</span> When the download is
						complete, it is recommended to use{" "}
						<span className="font-semibold">VLC Media Player</span>.
					</p>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<div className="flex-1">
						<Button
							className="w-full flex items-center justify-center gap-2"
							variant="outline"
							onClick={onClose}
						>
							<CircleX />
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button
							className="w-full flex items-center justify-center gap-2"
							variant="default"
							onClick={handleSubmit}
						>
							<Download className="w-4 h-4" />
							Download
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
