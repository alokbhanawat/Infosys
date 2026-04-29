import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import ProductCatalog from "./ProductCatalog";
import ProductFilters from "./ProductFilters";
import { clearStoredToken, getCurrentUser } from "../utils/auth";
import {
  addProduct,
  getProtectedProductsMessage,
  getProducts,
} from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const [statusMessage, setStatusMessage] = useState("Loading protected data...");
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [catalogFeedback, setCatalogFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  const getErrorMessage = (error, fallbackMessage) => {
    const apiMessage = error?.response?.data?.message;

    if (apiMessage) {
      return apiMessage;
    }

    if (error?.response?.status === 403) {
      return "Admin access is required for product management.";
    }

    if (error?.response?.status === 401) {
      return "Your session expired. Please log in again.";
    }

    return fallbackMessage;
  };

  const loadProducts = async (appliedFilters = filters) => {
    setCatalogLoading(true);
    try {
      const productsRes = await getProducts(appliedFilters);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCatalogFeedback("");
    } catch (error) {
      setCatalogFeedback(getErrorMessage(error, "Unable to load products."));
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    const loadProtectedProducts = async () => {
      try {
        const productsRes = await getProtectedProductsMessage();
        setStatusMessage(productsRes.data || "Protected API working.");
      } catch {
        setStatusMessage("Unable to load protected products data.");
      }

      await loadProducts();
    };

    loadProtectedProducts();
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  const handleProductChange = (e) => {
    setProductForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setFeedbackType("");

    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      setFeedback("Price and stock must be valid numbers.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      await addProduct({
        ...productForm,
        price,
        stock,
      });

      await loadProducts(filters);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: "",
      });
      setFeedback("Product added successfully.");
      setFeedbackType("success");
      setShowProductForm(false);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Unable to add product."));
      setFeedbackType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop"></div>
      <div className="dashboard-layout">
        <section className="dashboard-hero-card">
          <div className="dashboard-topbar">
            <div>
              <span className="dashboard-label">
                {isAdmin ? "Admin workspace" : "User workspace"}
              </span>
              <h1>{user?.name || "User"}</h1>
              <p className="dashboard-subtitle">{statusMessage}</p>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="dashboard-highlight-grid">
            <article className="highlight-card spotlight">
              <span>Signed in as</span>
              <strong>{user?.sub || "Not available"}</strong>
              <p>Your identity is decoded from the JWT returned by the backend login API.</p>
            </article>
            <article className="highlight-card">
              <span>Role</span>
              <strong>{user?.role || "USER"}</strong>
              <p>Product APIs are available only when the backend issues an admin role.</p>
            </article>
            <article className="highlight-card">
              <span>Session</span>
              <strong>{user?.exp ? "Active" : "Unknown"}</strong>
              <p>The frontend validates token expiry before allowing protected routes.</p>
            </article>
          </div>
        </section>

        {isAdmin && (
          <section className="admin-workspace">
            <article
              className={`dashboard-card admin-panel-card ${showProductForm ? "admin-panel-card-expanded" : ""}`}
            >
              <div className="admin-panel-header">
                <button
                  type="button"
                  className="primary-btn compact-btn"
                  onClick={() => setShowProductForm((current) => !current)}
                >
                  {showProductForm ? "Close form" : "Add product"}
                </button>
              </div>

              {showProductForm && (
                <form className="product-form compact-form" onSubmit={handleProductSubmit}>
                  <div className="input-grid">
                    <input
                      name="name"
                      placeholder="Product name"
                      value={productForm.name}
                      onChange={handleProductChange}
                      required
                    />
                    <input
                      name="category"
                      placeholder="Category"
                      value={productForm.category}
                      onChange={handleProductChange}
                    />
                  </div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    rows="4"
                  />
                  <div className="input-grid">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      placeholder="Price"
                      value={productForm.price}
                      onChange={handleProductChange}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      placeholder="Stock"
                      value={productForm.stock}
                      onChange={handleProductChange}
                      required
                    />
                  </div>
                  <input
                    name="imageUrl"
                    placeholder="Image URL"
                    value={productForm.imageUrl}
                    onChange={handleProductChange}
                  />
                  <button type="submit" className="primary-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save product"}
                  </button>
                </form>
              )}

              {feedback && <p className={`form-message ${feedbackType}`}>{feedback}</p>}
            </article>
          </section>
        )}

        <div className="catalog-layout">
          <ProductFilters
            filters={filters}
            catalogLoading={catalogLoading}
            onFilterChange={handleFilterChange}
            onFilterSubmit={handleFilterSubmit}
            onResetFilters={handleResetFilters}
          />
          <ProductCatalog
            isAdmin={isAdmin}
            products={products}
            catalogLoading={catalogLoading}
            catalogFeedback={catalogFeedback}
            onRefresh={() => loadProducts(filters)}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
