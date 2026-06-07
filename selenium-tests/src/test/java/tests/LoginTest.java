package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.LoginPage;

public class LoginTest extends BaseTest {
    private static final String VALID_EMAIL = "mansi@gmail.com";
    private static final String VALID_PASSWORD = "Mansi@1234";

    @Test
    public void loginWithValidCredentials() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);
        loginPage.login(VALID_EMAIL, VALID_PASSWORD);
        acceptAlertIfPresent();

        Assert.assertTrue(loginPage.isProductsPageVisible(), "Valid login should navigate to products page.");
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
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);
        loginPage.login(VALID_EMAIL, VALID_PASSWORD);
        Assert.assertTrue(loginPage.isProductsPageVisible(), "User should be logged in before logout.");

        loginPage.logout();

        Assert.assertTrue(loginPage.isLoginPageVisible(), "Login page should be visible after logout.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/login");
    }
}
