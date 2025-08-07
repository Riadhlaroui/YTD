import { useEffect, useRef, useState } from "react";
import { CircleX, Download, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";

interface DownloadDialogProps {
	open: boolean;
	videoId: string;
	onClose: () => void;
	fileName: string;
	onSubmit: (newValue: string) => void;
}

export function DownloadDialog({
	open,
	videoId,
	onClose,
	fileName,
	onSubmit,
}: DownloadDialogProps) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [value, setValue] = useState("");
	const dialogRef = useRef<HTMLDivElement>(null);
	const [path, setPath] = useState("");

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

	const handleOutsideClick = (e: MouseEvent) => {
		if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
			onClose();
		}
	};

	useEffect(() => {
		if (open) {
			document.addEventListener("mousedown", handleOutsideClick);
		} else {
			document.removeEventListener("mousedown", handleOutsideClick);
		}
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [open]);

	async function sendDownloadRequest(videoId: string) {
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
		} catch (err) {
			console.error("Download error:", err);
		}
	}

	const handleSubmit = () => {
		onSubmit(value);
		sendDownloadRequest(videoId);
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
			<div
				ref={dialogRef}
				className="bg-white dark:bg-[#262626] text-black dark:text-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 relative"
			>
				<button
					onClick={onClose}
					className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white hover:cursor-pointer hover:bg-gray-600/20 transition-colors duration-200"
				>
					<X size={20} />
				</button>

				<h2 className="text-xl font-semibold">Download Configuration:</h2>

				<div className="space-y-2">
					<span>{fileName}</span>
				</div>

				<Separator />

				<div className="w-full space-y-2">
					<label className="text-sm font-medium mb-2">
						Please enter the path to the destination folder:
					</label>
					<Input
						type="text"
						value={path}
						onChange={(e) => setPath(e.target.value)}
					/>
					<div className="flex items-start gap-2 text-sm text-muted-foreground mt-4">
						<Info className="w-4 h-4 mt-0.5" />
						<p>
							<span className="font-medium">Note:</span> When the download is
							complete, it is recommended to use{" "}
							<span className="font-semibold">VLC Media Player</span>.
						</p>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<div className="flex-1">
						<Button
							className="w-full flex items-center justify-center gap-2 hover:cursor-pointer"
							variant="outline"
							onClick={onClose}
						>
							<CircleX />
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button
							className="w-full flex items-center justify-center gap-2 hover:cursor-pointer"
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
