import React, { useState } from "react";
import DarkModeToggle from "./DarkModeToggle"; // Assurez-vous que le chemin est correct

function TestWrapper() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center bg-white text-black dark:bg-gray-900 dark:text-white">
      <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div>
  );
}

export default TestWrapper;
