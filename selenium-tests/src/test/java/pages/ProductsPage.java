package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class ProductsPage extends ProductCatalogPage<ProductsPage> {
    private final By storefrontPageByCss = By.cssSelector(".storefront-page");
    private final By productsHeadingByXpath = By.xpath("//h2[normalize-space()='Shop products']");
    private final By categoriesSectionByCss = By.cssSelector("#categories.storefront-category-section");
    private final By productsSectionByCss = By.cssSelector("#products.storefront-products-panel");
    private final By profileMenuButtonByCss = By.cssSelector(".profile-menu-trigger");
    private final By logoutButtonByXpath = By.xpath("//button[.//span[normalize-space()='Logout']]");
    private final By productCardLinkByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading) .product-card-link");
    private final By productItemByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading)");
    private final By addToCartButtonByCss = By.cssSelector(".product-cart-btn");

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    @Override
    protected ProductsPage self() {
        return this;
    }

    public ProductsPage open(String baseUrl) {
        driver.get(baseUrl + "/products");
        return this;
    }

    public ProductsPage waitUntilVisible() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(storefrontPageByCss));
        wait.until(ExpectedConditions.visibilityOfElementLocated(productsHeadingByXpath));
        pauseForDemo();
        return this;
    }

    public boolean isVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(storefrontPageByCss)).isDisplayed()
                && wait.until(ExpectedConditions.visibilityOfElementLocated(productsHeadingByXpath)).isDisplayed();
    }

    public ProductsPage openCategoriesSection(String baseUrl) {
        driver.get(baseUrl + "/products#categories");
        waitUntilVisible();
        return this;
    }

    public ProductsPage openProductsSection(String baseUrl) {
        driver.get(baseUrl + "/products#products");
        waitUntilVisible();
        return this;
    }

    public boolean isCategoriesSectionVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(categoriesSectionByCss)).isDisplayed();
    }

    public boolean isProductsSectionVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(productsSectionByCss)).isDisplayed();
    }

    public ProductDetailPage openFirstProductCard() {
        WebElement firstProductCard = wait.until((webDriver) -> {
            List<WebElement> productItems = driver.findElements(productItemByCss);

            for (WebElement productItem : productItems) {
                List<WebElement> addToCartButtons = productItem.findElements(addToCartButtonByCss);
                if (!addToCartButtons.isEmpty() && addToCartButtons.get(0).isEnabled()) {
                    return productItem.findElement(productCardLinkByCss);
                }
            }

            return null;
        });
        safeClick(firstProductCard);
        return new ProductDetailPage(driver).waitUntilVisible();
    }

    public LoginPage logout() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(profileMenuButtonByCss)));
        pauseForDemo();
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(logoutButtonByXpath)));
        wait.until(ExpectedConditions.urlToBe(getBaseUrl() + "/login"));
        pauseForDemo();
        return new LoginPage(driver);
    }

    public boolean hasActiveSession() {
        return getLocalStorageItem("token") != null
                && getLocalStorageItem("userId") != null
                && getLocalStorageItem("role") != null;
    }

    public boolean isSessionCleared() {
        return getLocalStorageItem("token") == null
                && getLocalStorageItem("userId") == null
                && getLocalStorageItem("role") == null;
    }

    private String getBaseUrl() {
        String currentUrl = driver.getCurrentUrl();
        int pathStart = currentUrl.indexOf("/", currentUrl.indexOf("//") + 2);
        return pathStart == -1 ? currentUrl : currentUrl.substring(0, pathStart);
    }
}
