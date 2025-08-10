import { useEffect, useState } from "react";
import { CircleCheckBig } from "lucide-react";

interface SuccessMessageProps {
	message?: string;
	icon?: React.ReactNode;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
	message = "",
	icon = <CircleCheckBig className="text-green-700 dark:text-green-100" />,
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
				bg-green-100 text-green-700 border border-green-300 
				dark:bg-green-600/30 dark:text-green-100 dark:border-green-400/40 
				font-semibold text-sm shadow-lg backdrop-blur-md"
			>
				{icon}
				<span>{message}</span>
			</div>
		</div>
	);
};

export default SuccessMessage;
