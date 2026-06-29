package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.CartPage;
import pages.ProductDetailPage;
import pages.ProductsPage;
import utilities.LoginUtils;

public class AddToCartTest extends BaseTest {

    @Test
    public void validateUserCanAddProductToCartAndIncreaseQuantityToTwo() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();

        ProductDetailPage productDetailPage = productsPage.openFirstProductCard();
        String productName = productDetailPage.getProductName();

        productDetailPage.addToCart();

        CartPage cartPage = new CartPage(driver)
                .open(BASE_URL)
                .waitUntilVisible();

        Assert.assertTrue(cartPage.hasProduct(productName), "Added product should be visible in the cart.");

        cartPage.changeQuantityTo(productName, 1)
                .changeQuantityTo(productName, 2);

        Assert.assertEquals(
                cartPage.getQuantityForProduct(productName),
                2,
                "Cart product quantity should increase to 2 after clicking the cart quantity plus button."
        );
    }
}
