package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class AdminDashboardPage extends BasePage {
    private final By dashboardContainerByCss = By.cssSelector(".dashboard-container");
    private final By adminWorkspaceLabelByXpath = By.xpath("//span[normalize-space()='Admin workspace']");
    private final By catalogCardByCss = By.cssSelector(".catalog-card");
    private final By productItemByCss = By.cssSelector(".product-list .product-item:not(.product-item-loading)");
    private final By productLoadingItemByCss = By.cssSelector(".product-list .product-item-loading");
    private final By productNameByCss = By.cssSelector(".product-copy strong");
    private final By productPriceByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[contains(normalize-space(),'Rs.')]");
    private final By productStockByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[starts-with(normalize-space(),'Stock:')]");

    public AdminDashboardPage(WebDriver driver) {
        super(driver);
    }

    public AdminDashboardPage open(String baseUrl) {
        driver.get(baseUrl + "/admin");
        return this;
    }

    public AdminDashboardPage waitUntilVisible() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(dashboardContainerByCss));
        wait.until(ExpectedConditions.visibilityOfElementLocated(adminWorkspaceLabelByXpath));
        return this;
    }

    public boolean isVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(adminWorkspaceLabelByXpath)).isDisplayed();
    }

    public AdminDashboardPage waitForProductListingLoaded() {
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
            String stock = product.findElement(productStockByXpath).getText().trim();
            return !name.isEmpty() && price.startsWith("Rs.") && stock.startsWith("Stock:");
        });
    }
}
