import React, { useState, useEffect } from "react";

function DarkModeToggle({ isDarkMode, setIsDarkMode }) {
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="mb-6">
      <p className="text-lg mb-2">Mode sombre :</p>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox h-6 w-6"
          checked={isDarkMode}
          onChange={(e) => setIsDarkMode(e.target.checked)}
        />
        <span className="ml-2 text-sm">
          {isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
        </span>
      </label>
    </div>
  );
}

export default DarkModeToggle;
