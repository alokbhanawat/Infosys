package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.LoginPage;
import pages.ProductsPage;
import utilities.LoginUtils;

public class LoginTest extends BaseTest {

    @Test
    public void loginWithValidCredentials() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);
        ProductsPage productsPage = loginPage
                .login(LoginUtils.VALID_EMAIL, LoginUtils.VALID_PASSWORD)
                .waitForProductsPage();
        acceptAlertIfPresent();

        Assert.assertTrue(productsPage.isVisible(), "Valid login should navigate to products page.");
        Assert.assertTrue(driver.getCurrentUrl().contains("/products"), "Current URL should be products after login.");
    }

    @Test
    public void loginWithInvalidCredentials() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);
        loginPage.login("wrong@gmail.com", "Wrong@1234");

        Assert.assertTrue(
                loginPage.getToastMessage().toLowerCase().contains("invalid"),
                "Invalid login should show an invalid credentials message."
        );
    }

    @Test
    public void validateLoginErrorMessages() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);
        loginPage.clickLogin();

        Assert.assertEquals(loginPage.getFirstFieldError(), "Email is required.");
    }

    @Test
    public void automateLogoutFlow() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL);
        Assert.assertTrue(productsPage.isVisible(), "User should be logged in before logout.");

        LoginPage loginPage = productsPage.logout();

        Assert.assertTrue(loginPage.isLoginPageVisible(), "Login page should be visible after logout.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/login");
    }
}
