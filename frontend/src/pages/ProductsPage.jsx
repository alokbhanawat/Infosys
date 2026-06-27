import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserProfileMenu from "../components/UserProfileMenu";
import ProductFilters from "../components/ProductFilters";
import ProductCatalog from "../components/ProductCatalog";
import ProductThemeToggle from "../components/ProductThemeToggle";
import { addToCart, getCurrentUserProfile, getProducts } from "../services/authService";
import { useProductDarkMode } from "../hooks/useProductDarkMode";
import { getCurrentUser } from "../utils/auth";
import { PRODUCT_CATEGORIES, applyProductFilters, getProductApiFilters } from "../utils/productCategories";
import "../styles/storefront.css";

const featureBanners = [
  { title: "Mobiles", offer: "Up to 35% off", tone: "mobile", filter: "Mobiles" },
  { title: "Laptops", offer: "Performance deals", tone: "laptop", filter: "Laptops" },
  { title: "Headphones", offer: "Audio week picks", tone: "headphone", filter: "Headphones" },
  { title: "Smart TVs", offer: "Cinema at home", tone: "tv", filter: "Smart TVs" },
  { title: "Refrigerators", offer: "Fresh savings", tone: "refrigerator", filter: "Refrigerators" },
];

function ProductsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useProductDarkMode();
  const tokenUser = getCurrentUser();
  const [user, setUser] = useState(tokenUser);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  const loadProducts = async (appliedFilters = filters) => {
    setCatalogLoading(true);

    try {
      const productsRes = await getProducts(getProductApiFilters(appliedFilters));
      const productList = Array.isArray(productsRes.data) ? productsRes.data : [];

      setProducts(applyProductFilters(productList, appliedFilters));
      setCatalogFeedback("");
    } catch (error) {
      setCatalogFeedback(error?.response?.data?.message || "Unable to load products.");
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await loadProducts();

      if (!tokenUser?.userId) {
        try {
          const profileResponse = await getCurrentUserProfile();
          setUser(profileResponse.data || null);
        } catch {
          setUser(tokenUser);
        }
      }
    };

    initializePage();
  }, []);

  const handleFilterChange = (e) => {
    const { name, type, checked, value } = e.target;

    setFilters((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    await loadProducts(filters);
  };

  const handleResetFilters = async () => {
    const resetFilters = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    };

    setFilters(resetFilters);
    await loadProducts(resetFilters);
  };

  const handleCategorySelect = async (category) => {
    const nextFilters = {
      ...filters,
      category,
    };

    navigate("/products");
    setFilters(nextFilters);
    await loadProducts(nextFilters);
  };

  const handleIncreaseQuantity = (product) => {
    setQuantities((current) => {
      const nextValue = Math.min((current[product.id] ?? 1) + 1, Number(product.stock) || 1);

      return {
        ...current,
        [product.id]: nextValue,
      };
    });
  };

  const handleDecreaseQuantity = (product) => {
    setQuantities((current) => ({
      ...current,
      [product.id]: Math.max((current[product.id] ?? 1) - 1, 1),
    }));
  };

  const handleAddToCart = async (product) => {
    if (!user?.userId) {
      setCartFeedback("Unable to determine the current user. Please log in again.");
      return;
    }

    try {
      await addToCart({
        userId: user.userId,
        productId: product.id,
        quantity: quantities[product.id] ?? 1,
      });
      setCartFeedback(`${product.name} added to cart successfully.`);
    } catch (error) {
      setCartFeedback(error?.response?.data?.message || "Unable to add this item to cart.");
    }
  };

  return (
    <div className={`storefront-page ${isDarkMode ? "product-page-dark" : ""}`}>
      <div className="storefront-shell">
        <header className="storefront-navbar">
          <Link className="storefront-brand" to="/products" aria-label="Go to products home">
            <span className="storefront-brand-mark">IE</span>
            <span>
              <strong>Infi Electronics</strong>
              <small>Smart shopping hub</small>
            </span>
          </Link>

          <nav className="storefront-nav-links" aria-label="Store navigation">
            <a href="#categories">Categories</a>
            <a href="#products">Products</a>
            <Link to="/orders">Orders</Link>
            <Link to="/cart">Cart</Link>
          </nav>

          <div className="storefront-nav-actions">
            <ProductThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
            <UserProfileMenu user={user} />
          </div>
        </header>

        <section className="storefront-hero">
          <div className="storefront-hero-copy">
            <span className="storefront-eyebrow">Electronics megastore</span>
            <h1>Upgrade your tech with deals that feel premium.</h1>
            <p>
              Shop mobiles, laptops, headphones, smart TVs, refrigerators, and everyday electronics from a clean, fast catalog.
            </p>
            <div className="storefront-hero-buttons">
              <Link className="primary-btn storefront-shop-btn" to="/products">
                Shop Now
              </Link>
            </div>
          </div>

          <div className="storefront-hero-side">
            <div className="storefront-hero-art" aria-hidden="true">
              <span className="hero-device hero-device-phone" />
              <span className="hero-device hero-device-laptop" />
              <span className="hero-device hero-device-headphone" />
            </div>
            <div className="storefront-mini-panel">
              <article>
                <span>Visible</span>
                <strong>{products.length}</strong>
              </article>
              <article>
                <span>User</span>
                <strong>{user?.name || "Shopper"}</strong>
              </article>
              <article>
                <span>View</span>
                <strong>{filters.inStock ? "In stock" : "All items"}</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="storefront-banner-strip" id="deals" aria-label="Featured electronic deals">
          {featureBanners.map((banner) => (
            <button
              type="button"
              className={`deal-banner deal-banner-${banner.tone}`}
              key={banner.title}
              onClick={() => handleCategorySelect(banner.filter)}
            >
              <span className="deal-banner-copy">
                <small>{banner.offer}</small>
                <strong>{banner.title}</strong>
              </span>
              <span className="deal-banner-visual" aria-hidden="true" />
            </button>
          ))}
        </section>

        <section className="storefront-category-section" id="categories">
          <div className="storefront-section-title">
            <span>Shop by category</span>
            <h2>Electronics for every room, desk, and commute.</h2>
          </div>

          <div className="category-card-grid">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                type="button"
                className={`category-card category-card-${category.tone}`}
                key={category.name}
                onClick={() => handleCategorySelect(category.value)}
              >
                <span className="category-card-icon" aria-hidden="true" />
                <strong>{category.name}</strong>
                <small>{category.text}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="storefront-layout">
          <ProductFilters
            filters={filters}
            catalogLoading={catalogLoading}
            onFilterChange={handleFilterChange}
            onFilterSubmit={handleFilterSubmit}
            onResetFilters={handleResetFilters}
          />

          <div id="products" className="storefront-products-panel">
            {cartFeedback ? <p className="form-message success">{cartFeedback}</p> : null}
            <ProductCatalog
              isAdmin={false}
              products={products}
              catalogLoading={catalogLoading}
              catalogFeedback={catalogFeedback}
              onRefresh={() => loadProducts(filters)}
              detailBasePath="/products"
              heading="Shop products"
              subheading=""
              showAccessNote={false}
              clickableCards
              quantities={quantities}
              onDecreaseQuantity={handleDecreaseQuantity}
              onIncreaseQuantity={handleIncreaseQuantity}
              showAddToCart
              onAddToCart={handleAddToCart}
              compactQuantity
            />
          </div>
        </section>

        <footer className="storefront-footer">
          <div>
            <strong>Infi Electronics</strong>
            <p>Clean shopping experience for modern electronics.</p>
          </div>
          <nav aria-label="Footer links">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

export default ProductsPage;
