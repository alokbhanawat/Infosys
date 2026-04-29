import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductFilters from "../components/ProductFilters";
import ProductCatalog from "../components/ProductCatalog";
import { getProducts } from "../services/authService";
import { clearStoredToken, getCurrentUser } from "../utils/auth";
import "../styles/storefront.css";

function ProductsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState("");
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
      const productsRes = await getProducts(appliedFilters);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCatalogFeedback("");
    } catch (error) {
      setCatalogFeedback(error?.response?.data?.message || "Unable to load products.");
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

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

  return (
    <div className="storefront-page">
      <div className="storefront-shell">
        <section className="storefront-hero">
          <div className="storefront-hero-copy">
            <span className="storefront-badge">Fresh picks for your store</span>
            <h1>Shop Products</h1>
            <p>
              Browse products, refine results with filters, and open any card to explore the full
              product details on its own page.
            </p>
          </div>

          <div className="storefront-hero-side">
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

            <button className="logout-btn storefront-logout" onClick={handleLogout}>
              Logout
            </button>
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
            compactQuantity
          />
        </section>
      </div>
    </div>
  );
}

export default ProductsPage;
