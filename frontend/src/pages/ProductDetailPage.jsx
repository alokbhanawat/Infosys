import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MagnifiedProductImage from "../components/MagnifiedProductImage";
import ProductThemeToggle from "../components/ProductThemeToggle";
import UserProfileMenu from "../components/UserProfileMenu";
import { addToCart, getCurrentUserProfile, getProductById } from "../services/authService";
import { useProductDarkMode } from "../hooks/useProductDarkMode";
import { getCurrentUser } from "../utils/auth";
import "../styles/product-detail.css";

function ProductDetailPage() {
  const { productId } = useParams();
  const { isDarkMode, toggleDarkMode } = useProductDarkMode();
  const tokenUser = getCurrentUser();
  const [user, setUser] = useState(tokenUser);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        if (!tokenUser?.userId) {
          const profileResponse = await getCurrentUserProfile();
          setUser(profileResponse.data || null);
        }

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

  const stockLabel = useMemo(() => {
    if (!product) {
      return "";
    }

    return Number(product.stock) > 0 ? "Available now" : "Currently unavailable";
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!user?.userId) {
      setCartFeedback("Unable to determine the current user. Please log in again.");
      return;
    }

    try {
      await addToCart({
        userId: user.userId,
        productId: product.id,
        quantity,
      });
      setCartFeedback(`${product.name} added to cart successfully.`);
    } catch (requestError) {
      setCartFeedback(
        requestError?.response?.data?.message || "Unable to add this product to cart.",
      );
    }
  };

  return (
    <div className={`product-detail-page ${isDarkMode ? "product-page-dark" : ""}`}>
      <div className="product-detail-shell">
        <div className="product-detail-topbar">
          <Link className="back-link" to="/products">
            Back to products
          </Link>
          <div className="product-detail-topbar-actions">
            <ProductThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            <UserProfileMenu user={user} />
          </div>
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
                <MagnifiedProductImage src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="product-detail-placeholder">
                  <span>{(product?.name || "P").slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="product-detail-copy">
              <p className="product-detail-id">Product ID: {product?.id}</p>
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
                <article>
                  <span>Status</span>
                  <strong>{stockLabel}</strong>
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
                  Choose the quantity and use the button below for the product action.
                </p>
                {cartFeedback ? <p className="form-message success">{cartFeedback}</p> : null}
                <button
                  type="button"
                  className="primary-btn product-detail-cart-btn"
                  disabled={Number(product?.stock) <= 0}
                  onClick={handleAddToCart}
                >
                  {Number(product?.stock) > 0 ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
