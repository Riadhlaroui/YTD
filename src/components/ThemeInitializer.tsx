// ThemeInitializer.tsx
import { useEffect } from "react";

export const ThemeInitializer = () => {
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, []);

	return null;
};
