package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public abstract class ProductCatalogPage<T extends ProductCatalogPage<T>> extends BasePage {
    protected final By catalogCardByCss = By.cssSelector(".catalog-card");
    protected final By productItemByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading)");
    protected final By productLoadingItemByCss = By.cssSelector(".product-list .product-item-loading");
    protected final By productNameByCss = By.cssSelector(".product-copy strong");
    protected final By productDescriptionByCss = By.cssSelector(".product-copy p");
    protected final By productCategoryByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[1]");
    protected final By productPriceByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[contains(normalize-space(),'Rs.')]");
    private final By searchInputByCss = By.cssSelector(".filter-form input[name='search']");
    private final By categoryInputByCss = By.cssSelector(".filter-form input[name='category']");
    private final By applyFiltersButtonByCss = By.cssSelector(".filter-form button[type='submit']");

    protected ProductCatalogPage(WebDriver driver) {
        super(driver);
    }

    protected abstract T self();

    public T waitForProductListingLoaded() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(catalogCardByCss));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(productLoadingItemByCss));
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(productItemByCss, 0));
        return self();
    }

    public int getVisibleProductCount() {
        return getVisibleProducts().size();
    }

    public boolean hasVisibleProductDetails() {
        return getVisibleProducts().stream().allMatch((product) -> {
            String name = product.findElement(productNameByCss).getText().trim();
            String price = product.findElement(productPriceByXpath).getText().trim();
            return !name.isEmpty() && price.startsWith("Rs.");
        });
    }

    public String getFirstVisibleProductName() {
        return getVisibleProducts().get(0).findElement(productNameByCss).getText().trim();
    }

    public String getFirstFilterableCategory() {
        return getVisibleProducts().stream()
                .map(this::getProductCategory)
                .filter((category) -> !category.isBlank() && !"Uncategorized".equalsIgnoreCase(category))
                .findFirst()
                .orElse("");
    }

    public T searchByName(String productName) {
        typeIntoFilter(searchInputByCss, productName);
        applyFilters();
        wait.until((webDriver) -> hasVisibleProducts() && allCurrentProductsMatchSearchTerm(productName));
        return self();
    }

    public T filterByCategory(String category) {
        typeIntoFilter(categoryInputByCss, category);
        applyFilters();
        wait.until((webDriver) -> hasVisibleProducts() && allCurrentProductsHaveCategory(category));
        return self();
    }

    public boolean hasProductNamed(String expectedProductName) {
        return getVisibleProducts().stream()
                .map((product) -> product.findElement(productNameByCss).getText().trim())
                .anyMatch((name) -> name.equalsIgnoreCase(expectedProductName));
    }

    public boolean allVisibleProductsMatchSearchTerm(String searchTerm) {
        return allCurrentProductsMatchSearchTerm(searchTerm);
    }

    public boolean allVisibleProductsHaveCategory(String expectedCategory) {
        return allCurrentProductsHaveCategory(expectedCategory);
    }

    protected List<WebElement> getVisibleProducts() {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(productItemByCss));
    }

    private void applyFilters() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(applyFiltersButtonByCss)));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(productLoadingItemByCss));
    }

    private void typeIntoFilter(By filterInputBy, String value) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(filterInputBy));
        ((JavascriptExecutor) driver).executeScript("""
                const input = arguments[0];
                const value = arguments[1];
                const valueSetter = Object.getOwnPropertyDescriptor(input.__proto__, 'value').set;
                valueSetter.call(input, value);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                """, input, value);
        wait.until(ExpectedConditions.attributeToBe(input, "value", value));
    }

    private boolean hasVisibleProducts() {
        return !driver.findElements(productItemByCss).isEmpty();
    }

    private boolean allCurrentProductsMatchSearchTerm(String searchTerm) {
        String normalizedSearchTerm = searchTerm.toLowerCase();

        return getVisibleProducts().stream().allMatch((product) -> {
            String name = product.findElement(productNameByCss).getText().trim().toLowerCase();
            String description = product.findElement(productDescriptionByCss).getText().trim().toLowerCase();
            String category = getProductCategory(product).toLowerCase();
            return name.contains(normalizedSearchTerm)
                    || description.contains(normalizedSearchTerm)
                    || category.contains(normalizedSearchTerm);
        });
    }

    private boolean allCurrentProductsHaveCategory(String expectedCategory) {
        return getVisibleProducts().stream()
                .map(this::getProductCategory)
                .allMatch((category) -> category.equalsIgnoreCase(expectedCategory));
    }

    private String getProductCategory(WebElement product) {
        return product.findElement(productCategoryByXpath).getText().trim();
    }
}
