package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ProductDetailPage extends BasePage {
    private final By productDetailCardByCss = By.cssSelector(".product-detail-card:not(.loading-state)");
    private final By productIdByCss = By.cssSelector(".product-detail-id");
    private final By productNameByCss = By.cssSelector(".product-detail-copy h1");
    private final By productPriceByXpath = By.xpath("//div[contains(@class,'product-detail-meta')]//span[normalize-space()='Price']/following-sibling::strong[contains(normalize-space(),'Rs.')]");
    private final By addToCartButtonByCss = By.cssSelector(".product-detail-cart-btn");

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    public ProductDetailPage waitUntilVisible() {
        wait.until(ExpectedConditions.urlContains("/products/"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(productDetailCardByCss));
        wait.until(ExpectedConditions.visibilityOfElementLocated(productIdByCss));
        return this;
    }

    public boolean isVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(productDetailCardByCss)).isDisplayed();
    }

    public boolean hasProductDetails() {
        String productId = wait.until(ExpectedConditions.visibilityOfElementLocated(productIdByCss)).getText().trim();
        String productName = wait.until(ExpectedConditions.visibilityOfElementLocated(productNameByCss)).getText().trim();
        String productPrice = wait.until(ExpectedConditions.visibilityOfElementLocated(productPriceByXpath)).getText().trim();

        return productId.startsWith("Product ID:")
                && !productName.isEmpty()
                && productPrice.startsWith("Rs.");
    }

    public boolean isProductActionVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(addToCartButtonByCss)).isDisplayed();
    }
}
