import { Link } from "react-router-dom";

function ProductCatalog({
  isAdmin,
  products,
  catalogLoading,
  catalogFeedback,
  onRefresh,
  detailBasePath,
  heading,
  subheading,
  showAccessNote = true,
  clickableCards = false,
  quantities = {},
  onDecreaseQuantity,
  onIncreaseQuantity,
  compactQuantity = false,
}) {
  const renderProductCard = (product) => (
    <>
      <div className="product-visual">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <span>{(product.name || "P").slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="product-copy">
        <strong>{product.name}</strong>
        <p>{product.description || "No description provided."}</p>
      </div>

      <div className="product-meta">
        <span>{product.category || "Uncategorized"}</span>
        <span>Rs. {product.price}</span>
        {clickableCards ? (
          <div
            className={`quantity-picker ${compactQuantity ? "quantity-picker-compact" : ""}`}
            onClick={(event) => event.preventDefault()}
          >
            <button
              type="button"
              className="quantity-btn"
              onClick={() => onDecreaseQuantity?.(product)}
              aria-label={`Decrease quantity for ${product.name}`}
            >
              -
            </button>
            <span className="quantity-value">{quantities[product.id] ?? 1}</span>
            <button
              type="button"
              className="quantity-btn"
              onClick={() => onIncreaseQuantity?.(product)}
              aria-label={`Increase quantity for ${product.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <span>Stock: {product.stock}</span>
        )}
      </div>
    </>
  );

  return (
    <section className="dashboard-card catalog-card">
      <div className="catalog-header">
        <div className="section-heading">
          {subheading ? <span>{subheading}</span> : null}
          <h2>{heading || (isAdmin ? "Product showcase" : "Browse products")}</h2>
        </div>

        <button type="button" className="secondary-btn header-btn" onClick={onRefresh}>
          {catalogLoading ? "Refreshing..." : "Refresh products"}
        </button>
      </div>

      {catalogFeedback && <p className="form-message error">{catalogFeedback}</p>}

      {!isAdmin && showAccessNote && (
        <div className="access-note">
          You can browse products here. Product creation remains admin-only for the current role.
        </div>
      )}

      <div className="product-list">
        {products.length === 0 ? (
          <p className="empty-state">
            {catalogLoading ? "Loading products..." : "No products matched the current filters."}
          </p>
        ) : (
          products.map((product) => (
            <article key={product.id} className="product-item">
              {clickableCards ? (
                <Link className="product-card-link" to={`${detailBasePath}/${product.id}`}>
                  {renderProductCard(product)}
                </Link>
              ) : (
                renderProductCard(product)
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ProductCatalog;
