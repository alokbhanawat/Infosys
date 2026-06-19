package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class CartPage extends BasePage {
    private final By cartHeroByCss = By.cssSelector(".cart-hero");
    private final By loadingStateByXpath = By.xpath("//p[normalize-space()='Loading cart items...']");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public CartPage open(String baseUrl) {
        driver.get(baseUrl + "/cart");
        return this;
    }

    public CartPage waitUntilVisible() {
        wait.until(ExpectedConditions.urlContains("/cart"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(cartHeroByCss));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(loadingStateByXpath));
        return this;
    }

    public boolean hasProduct(String productName) {
        return wait.until((webDriver) -> findCartItemByProductName(productName).isDisplayed());
    }

    public boolean isProductAbsent(String productName) {
        return wait.until((webDriver) -> findCartItemsByProductName(productName).isEmpty());
    }

    public int getQuantityForProduct(String productName) {
        WebElement cartItem = wait.until((webDriver) -> findCartItemByProductName(productName));
        String quantity = cartItem.findElement(By.cssSelector(".cart-quantity-value")).getText().trim();
        return Integer.parseInt(quantity);
    }

    public CartPage changeQuantityTo(String productName, int targetQuantity) {
        wait.until((webDriver) -> {
            int currentQuantity = getQuantityForProduct(productName);
            if (currentQuantity == targetQuantity) {
                return true;
            }

            WebElement cartItem = findCartItemByProductName(productName);
            String actionLabel = currentQuantity < targetQuantity ? "Increase quantity" : "Decrease quantity";
            WebElement quantityButton = cartItem.findElement(By.xpath(".//button[contains(@aria-label,'"
                    + actionLabel + "')]"));
            safeClick(quantityButton);
            return false;
        });
        return this;
    }

    public CartPage removeProduct(String productName) {
        WebElement cartItem = wait.until((webDriver) -> findCartItemByProductName(productName));
        WebElement removeButton = cartItem.findElement(By.cssSelector(".cart-remove-btn"));
        safeClick(removeButton);
        wait.until((webDriver) -> findCartItemsByProductName(productName).isEmpty());
        return this;
    }

    private WebElement findCartItemByProductName(String productName) {
        return driver.findElement(cartItemByProductName(productName));
    }

    private List<WebElement> findCartItemsByProductName(String productName) {
        return driver.findElements(cartItemByProductName(productName));
    }

    private By cartItemByProductName(String productName) {
        return By.xpath(
                "//article[contains(@class,'cart-item')][.//strong[normalize-space()="
                        + xpathLiteral(productName) + "]]"
        );
    }

    private String xpathLiteral(String value) {
        if (!value.contains("'")) {
            return "'" + value + "'";
        }

        if (!value.contains("\"")) {
            return "\"" + value + "\"";
        }

        StringBuilder literal = new StringBuilder("concat(");
        String[] parts = value.split("'");
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                literal.append(", \"'\", ");
            }
            literal.append("'").append(parts[i]).append("'");
        }
        literal.append(")");
        return literal.toString();
    }
}
