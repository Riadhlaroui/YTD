import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DownloadDialogProps {
	open: boolean;
	onClose: () => void;
	fieldLabel: string;
	fieldName: string;
	onSubmit: (newValue: string) => void;
}

export function DownloadDialog({
	open,
	onClose,
	fieldLabel,
	fieldName,
	onSubmit,
}: DownloadDialogProps) {
	const [value, setValue] = useState("");
	const dialogRef = useRef<HTMLDivElement>(null);

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

	const handleSubmit = () => {
		onSubmit(value);
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

				<h2 className="text-xl font-semibold">Update your {fieldName}</h2>

				<div className="space-y-2">
					<label className="text-sm font-medium">{fieldLabel}</label>
					<Input
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder={`Enter new ${fieldLabel.toLowerCase()}`}
						className="mt-1"
					/>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<div className="flex-1">
						<Button className="w-full" variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button className="w-full" onClick={handleSubmit}>
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
