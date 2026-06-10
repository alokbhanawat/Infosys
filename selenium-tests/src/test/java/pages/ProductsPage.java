package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class ProductsPage extends BasePage {
    private final By productsHeadingByXpath = By.xpath("//h1[normalize-space()='Shop Products']");
    private final By profileMenuButtonByCss = By.cssSelector(".profile-menu-trigger");
    private final By logoutButtonByXpath = By.xpath("//button[.//span[normalize-space()='Logout']]");
    private final By catalogCardByCss = By.cssSelector(".catalog-card");
    private final By productItemByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading)");
    private final By productLoadingItemByCss = By.cssSelector(".product-list .product-item-loading");
    private final By productCardLinkByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading) .product-card-link");
    private final By productNameByCss = By.cssSelector(".product-copy strong");
    private final By productPriceByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[contains(normalize-space(),'Rs.')]");

    public ProductsPage(WebDriver driver) {
        super(driver);
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

    public ProductsPage waitForProductListingLoaded() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(catalogCardByCss));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(productLoadingItemByCss));
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(productItemByCss, 0));
        return this;
    }

    public int getVisibleProductCount() {
        List<WebElement> products = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(productItemByCss));
        return products.size();
    }

    public boolean hasVisibleProductDetails() {
        List<WebElement> products = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(productItemByCss));

        return products.stream().allMatch((product) -> {
            String name = product.findElement(productNameByCss).getText().trim();
            String price = product.findElement(productPriceByXpath).getText().trim();
            return !name.isEmpty() && price.startsWith("Rs.");
        });
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
