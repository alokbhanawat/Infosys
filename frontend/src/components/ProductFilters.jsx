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
        <span>Search</span>
        <h2>Filter products</h2>
      </div>

      <form className="filter-form" onSubmit={onFilterSubmit}>
        <div className="input-grid filter-row">
          <input
            name="search"
            placeholder="Search by name, description, or category"
            value={filters.search}
            onChange={onFilterChange}
          />
          <input
            name="category"
            placeholder="Filter by category"
            value={filters.category}
            onChange={onFilterChange}
          />
        </div>

        <div className="input-grid filter-row">
          <input
            type="number"
            min="0"
            step="0.01"
            name="minPrice"
            placeholder="Minimum price"
            value={filters.minPrice}
            onChange={onFilterChange}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            name="maxPrice"
            placeholder="Maximum price"
            value={filters.maxPrice}
            onChange={onFilterChange}
          />
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
