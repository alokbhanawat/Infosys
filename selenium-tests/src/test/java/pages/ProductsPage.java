package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ProductsPage extends ProductCatalogPage<ProductsPage> {
    private final By productsHeadingByXpath = By.xpath("//h1[normalize-space()='Shop Products']");
    private final By profileMenuButtonByCss = By.cssSelector(".profile-menu-trigger");
    private final By logoutButtonByXpath = By.xpath("//button[.//span[normalize-space()='Logout']]");
    private final By productCardLinkByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading) .product-card-link");

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
        wait.until(ExpectedConditions.visibilityOfElementLocated(productsHeadingByXpath));
        return this;
    }

    public boolean isVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(productsHeadingByXpath)).isDisplayed();
    }

    public ProductDetailPage openFirstProductCard() {
        WebElement firstProductCard = wait.until(ExpectedConditions.elementToBeClickable(productCardLinkByCss));
        safeClick(firstProductCard);
        return new ProductDetailPage(driver).waitUntilVisible();
    }

    public LoginPage logout() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(profileMenuButtonByCss)));
        pauseForDemo();
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(logoutButtonByXpath)));
        pauseForDemo();
        wait.until(ExpectedConditions.urlToBe(getBaseUrl() + "/login"));
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
