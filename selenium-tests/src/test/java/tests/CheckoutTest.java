package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.CartPage;
import pages.ProductDetailPage;
import pages.ProductsPage;
import utilities.LoginUtils;

public class CheckoutTest extends BaseTest {

    @Test
    public void validateCheckoutInitiationWithSuccessfulPaymentFlow() {
        CartPage cartPage = addFirstProductToCart();
        String productName = driver.getTitle();

        cartPage.fillCheckoutForm(
                        "Automation Checkout",
                        "9876543210",
                        "123 Test Street",
                        "Near Test Landmark",
                        "Bengaluru",
                        "Karnataka",
                        "560001",
                        "India",
                        "CARD")
                .installSuccessfulRazorpayMock(productName)
                .clickCheckout();

        Assert.assertTrue(cartPage.isOrderSuccessVisible(), "Successful checkout should navigate to the order success page.");
        Assert.assertTrue(cartPage.wasRazorpayOpened(), "Checkout should initiate Razorpay before completing payment.");
        Assert.assertTrue(
                driver.getPageSource().contains("Order placed successfully"),
                "Order success page should confirm that checkout completed."
        );
    }

    @Test
    public void validateCheckoutShowsMandatoryFieldErrors() {
        CartPage cartPage = addFirstProductToCart();

        Assert.assertTrue(cartPage.isCheckoutButtonEnabled(), "Checkout should be available when the cart has products.");

        cartPage.clearRequiredCheckoutFields()
                .clickCheckout();

        Assert.assertTrue(
                cartPage.hasCheckoutMessage("Please fill this mandatory field."),
                "A mandatory-field checkout message should be shown."
        );
        Assert.assertTrue(
                cartPage.hasFieldError("fullName", "Please fill this mandatory field."),
                "Full name should show a mandatory-field validation error."
        );
        Assert.assertTrue(
                cartPage.hasFieldError("addressLine1", "Please fill this mandatory field."),
                "Address line 1 should show a mandatory-field validation error."
        );
    }

    @Test
    public void validateCheckoutRejectsInvalidPhoneNumber() {
        CartPage cartPage = addFirstProductToCart();

        cartPage.fillCheckoutForm(
                        "Automation Checkout",
                        "12345",
                        "123 Test Street",
                        "",
                        "Bengaluru",
                        "Karnataka",
                        "560001",
                        "India",
                        "UPI")
                .clickCheckout();

        Assert.assertTrue(
                cartPage.hasFieldError("phone", "Enter a correct 10-digit phone number."),
                "Checkout should reject phone numbers that are not exactly 10 digits."
        );
    }

    private CartPage addFirstProductToCart() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();

        ProductDetailPage productDetailPage = productsPage.openFirstProductCard();
        productDetailPage.addToCart();

        return new CartPage(driver)
                .open(BASE_URL)
                .waitUntilVisible();
    }
}
