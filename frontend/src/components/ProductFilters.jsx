function ProductFilters({
  filters,
  catalogLoading,
  onFilterChange,
  onFilterSubmit,
  onResetFilters,
}) {
  return (
    <section className="dashboard-card filter-card">
      <div className="section-heading">
        <span>Search catalog</span>
        <h2>Find your next device</h2>
      </div>
      <p className="filter-intro">
        Search by keyword, choose a category, set a budget, and keep ready-to-ship products in view.
      </p>

      <form className="filter-form" onSubmit={onFilterSubmit}>
        <label className="filter-field filter-search-field">
          <span>Search products</span>
          <input
            name="search"
            placeholder="Search mobiles, laptops, TVs..."
            value={filters.search}
            onChange={onFilterChange}
          />
        </label>

        <div className="input-grid filter-row">
          <label className="filter-field">
            <span>Category</span>
            <input
              name="category"
              placeholder="Mobiles, laptops, headphones..."
              value={filters.category}
              onChange={onFilterChange}
            />
          </label>
        </div>

        <div className="input-grid filter-row">
          <label className="filter-field">
            <span>Minimum price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="minPrice"
              placeholder="Rs. 0"
              value={filters.minPrice}
              onChange={onFilterChange}
            />
          </label>
          <label className="filter-field">
            <span>Maximum price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="maxPrice"
              placeholder="Rs. 100000"
              value={filters.maxPrice}
              onChange={onFilterChange}
            />
          </label>
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            name="inStock"
            checked={filters.inStock}
            onChange={onFilterChange}
          />
          <span>Show only in-stock products</span>
        </label>

        <div className="filter-actions">
          <button type="submit" className="primary-btn" disabled={catalogLoading}>
            {catalogLoading ? "Searching..." : "Apply filters"}
          </button>
          <button
            type="button"
            className="secondary-btn filter-reset-btn"
            onClick={onResetFilters}
            disabled={catalogLoading}
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProductFilters;
