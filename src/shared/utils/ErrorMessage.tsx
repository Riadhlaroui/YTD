import { useEffect, useState } from "react";
import { CircleSlash } from "lucide-react";

interface ErrorMessageProps {
	message?: string;
	icon?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
	message = "Something went wrong.",
	icon = <CircleSlash className="text-red-700 dark:text-red-100" />,
}) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true);

		const timer = setTimeout(() => setVisible(false), 3500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={`transition-opacity duration-500 ease-in-out ${
				visible ? "opacity-100" : "opacity-0"
			}`}
		>
			<div
				className="flex items-center gap-2 mt-1 p-3 rounded-md 
				bg-red-100 text-red-700 border border-red-300 
				dark:bg-red-600/30 dark:text-red-100 dark:border-red-400/40 
				font-semibold text-sm shadow-lg backdrop-blur-md"
			>
				{icon}
				<span>{message}</span>
			</div>
		</div>
	);
};

export default ErrorMessage;
