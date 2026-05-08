import { Link } from "react-router-dom";

function ProductCatalog({
  isAdmin,
  products,
  catalogLoading,
  catalogFeedback,
  onRefresh,
  adminRemoveMode = false,
  onToggleAdminRemoveMode,
  onRemoveProduct,
  deletingProductId = null,
  detailBasePath,
  heading,
  subheading,
  showAccessNote = true,
  clickableCards = false,
  quantities = {},
  onDecreaseQuantity,
  onIncreaseQuantity,
  compactQuantity = false,
  showAddToCart = false,
  onAddToCart,
}) {
  const renderProductCardBody = (product) => (
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
        {isAdmin ? <span>Stock: {product.stock}</span> : null}
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

        <div className="catalog-header-actions">
          <div className="catalog-action-stack">
            <button type="button" className="secondary-btn header-btn" onClick={onRefresh}>
              {catalogLoading ? "Refreshing..." : "Refresh products"}
            </button>

            {isAdmin ? (
              <button
                type="button"
                className={`header-btn ${adminRemoveMode ? "danger-btn" : "secondary-btn"}`}
                onClick={onToggleAdminRemoveMode}
              >
                {adminRemoveMode ? "Hide remove products" : "Remove products"}
              </button>
            ) : null}
          </div>
        </div>
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
                <>
                  <Link className="product-card-link" to={`${detailBasePath}/${product.id}`}>
                    {renderProductCardBody(product)}
                  </Link>

                  <div className="product-card-actions">
                    <div className={`quantity-picker ${compactQuantity ? "quantity-picker-compact" : ""}`}>
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

                    <button
                      type="button"
                      className="primary-btn product-cart-btn"
                      onClick={() => onAddToCart?.(product)}
                      disabled={Number(product.stock) <= 0}
                    >
                      {Number(product.stock) > 0 ? "Add to cart" : "Out of stock"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {renderProductCardBody(product)}

                  {isAdmin && adminRemoveMode ? (
                    <div className="product-card-actions product-card-actions-admin">
                      <button
                        type="button"
                        className="danger-btn product-remove-btn"
                        onClick={() => onRemoveProduct?.(product)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? "Removing..." : "Remove product"}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ProductCatalog;
