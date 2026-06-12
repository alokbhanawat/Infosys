package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class AdminDashboardPage extends ProductCatalogPage<AdminDashboardPage> {
    private final By dashboardContainerByCss = By.cssSelector(".dashboard-container");
    private final By adminWorkspaceLabelByXpath = By.xpath("//span[normalize-space()='Admin workspace']");
    private final By productStockByXpath = By.xpath(".//div[contains(@class,'product-meta')]/span[starts-with(normalize-space(),'Stock:')]");

    public AdminDashboardPage(WebDriver driver) {
        super(driver);
    }

    @Override
    protected AdminDashboardPage self() {
        return this;
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

    @Override
    public boolean hasVisibleProductDetails() {
        return super.hasVisibleProductDetails() && getVisibleProducts().stream().allMatch((product) -> {
            String stock = product.findElement(productStockByXpath).getText().trim();
            return stock.startsWith("Stock:");
        });
    }
}
