import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/authService";
import { clearStoredToken } from "../utils/auth";
import "../styles/product-detail.css";

function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const productRes = await getProductById(productId);
        setProduct(productRes.data || null);
        setQuantity(1);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  const stockLabel = useMemo(() => {
    if (!product) {
      return "";
    }

    return Number(product.stock) > 0 ? "Available now" : "Currently unavailable";
  }, [product]);

  return (
    <div className="product-detail-page">
      <div className="product-detail-shell">
        <div className="product-detail-topbar">
          <Link className="back-link" to="/products">
            Back to products
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {loading ? (
          <section className="product-detail-card loading-state">
            <p>Loading product details...</p>
          </section>
        ) : error ? (
          <section className="product-detail-card loading-state">
            <p>{error}</p>
          </section>
        ) : (
          <section className="product-detail-card">
            <div className="product-detail-media">
              {product?.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="product-detail-placeholder">
                  <span>{(product?.name || "P").slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="product-detail-copy">
              <span className="product-detail-id">Product ID: {product?.id}</span>
              <h1>{product?.name}</h1>
              <p className="product-detail-description">
                {product?.description || "No description provided for this product yet."}
              </p>

              <div className="product-detail-meta">
                <article>
                  <span>Category</span>
                  <strong>{product?.category || "Uncategorized"}</strong>
                </article>
                <article>
                  <span>Price</span>
                  <strong>Rs. {product?.price}</strong>
                </article>
              </div>

              <div className="product-detail-quantity">
                <span>Quantity</span>
                <div className="quantity-picker quantity-picker-compact">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                    aria-label={`Decrease quantity for ${product?.name}`}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() =>
                      setQuantity((current) => Math.min(current + 1, Number(product?.stock) || 1))
                    }
                    aria-label={`Increase quantity for ${product?.name}`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-detail-purchase">
                <strong>{stockLabel}</strong>
                <p>
                  This detail page is loaded using the backend product id from the URL:
                  {" "}
                  <code>{productId}</code>
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
