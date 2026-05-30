function ProductThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      type="button"
      className="product-theme-toggle"
      onClick={onToggle}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="product-theme-toggle-track" aria-hidden="true">
        <span className="product-theme-toggle-thumb">
          {isDarkMode ? (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M20.2 14.7A7.6 7.6 0 0 1 9.3 3.8 8.6 8.6 0 1 0 20.2 14.7Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 5.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6Zm0-3.2 1.1 3h-2.2L12 2Zm0 20-1.1-3h2.2L12 22ZM2 12l3-1.1v2.2L2 12Zm20 0-3 1.1v-2.2L22 12ZM4.9 4.9l2.9 1.3-1.6 1.6-1.3-2.9Zm14.2 14.2-2.9-1.3 1.6-1.6 1.3 2.9Zm0-14.2-1.3 2.9-1.6-1.6 2.9-1.3ZM4.9 19.1l1.3-2.9 1.6 1.6-2.9 1.3Z" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}

export default ProductThemeToggle;
