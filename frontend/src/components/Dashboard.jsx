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
  removeProduct,
} from "../services/authService";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

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
  const [adminRemoveMode, setAdminRemoveMode] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
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
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const selectedFile = files?.[0] || null;

      if (!selectedFile) {
        setProductForm((current) => ({
          ...current,
          [name]: null,
        }));
        return;
      }

      const lowerName = selectedFile.name.toLowerCase();
      const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
      const hasValidType = ALLOWED_IMAGE_TYPES.includes((selectedFile.type || "").toLowerCase());

      if (!hasValidExtension || !hasValidType) {
        setFeedback("Upload a valid image only. PDF, EXE, and other files are not allowed.");
        setFeedbackType("error");
        e.target.value = "";
        setProductForm((current) => ({
          ...current,
          [name]: null,
        }));
        return;
      }
    }

    setProductForm((current) => ({
      ...current,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
    if (feedback) {
      setFeedback("");
      setFeedbackType("");
    }
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

    if (!productForm.image) {
      setFeedback("Please upload a product image.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", String(price));
      formData.append("stock", String(stock));
      formData.append("category", productForm.category);
      formData.append("image", productForm.image);

      await addProduct(formData);

      await loadProducts(filters);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: null,
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

  const handleRemoveProduct = async (product) => {
    if (!product?.id) {
      setCatalogFeedback("Unable to remove this product right now.");
      return;
    }

    const confirmed = window.confirm(`Remove "${product.name}" from products?`);

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);
    setCatalogFeedback("");

    try {
      await removeProduct(product.id);
      await loadProducts(filters);
      setFeedback(`"${product.name}" removed successfully.`);
      setFeedbackType("success");
    } catch (error) {
      setCatalogFeedback(getErrorMessage(error, "Unable to remove product."));
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop"></div>
      <div className="dashboard-layout">
        <section className="dashboard-hero-card">
          <div className="dashboard-topbar">
            <div className="dashboard-hero-copy">
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
            <article className="highlight-card spotlight compact-highlight">
              <span>Signed in as</span>
              <strong>{user?.sub || "Not available"}</strong>
              <p>Your identity is decoded from the JWT returned by the backend login API.</p>
            </article>
            <article className="highlight-card compact-highlight">
              <span>Role</span>
              <strong>{user?.role || "USER"}</strong>
              <p>Product APIs are available only when the backend issues an admin role.</p>
            </article>
          </div>
        </section>

        {isAdmin && (
          <section className="admin-workspace">
            <article
              className={`dashboard-card admin-panel-card ${showProductForm ? "admin-panel-card-expanded" : ""}`}
            >
              <div className="admin-panel-header">
                <div className="admin-panel-copy">
                  <span className="admin-panel-label">Product</span>
                  <h2>Add New Product</h2>
                </div>
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
                  <input type="file" name="image" accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif" onChange={handleProductChange} required />
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
            adminRemoveMode={adminRemoveMode}
            onToggleAdminRemoveMode={() => setAdminRemoveMode((current) => !current)}
            onRemoveProduct={handleRemoveProduct}
            deletingProductId={deletingProductId}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
