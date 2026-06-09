package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.LoginPage;
import pages.ProductsPage;
import utilities.LoginUtils;

public class SessionHandlingTest extends BaseTest {

    @Test
    public void validateSessionCreatedAfterLogin() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL);

        Assert.assertTrue(productsPage.isVisible(), "Products page should be visible after login.");
        Assert.assertTrue(productsPage.hasActiveSession(), "Login should store token, userId, and role in local storage.");
    }

    @Test
    public void validateSessionClearedAfterLogout() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL);
        LoginPage loginPage = productsPage.logout();

        Assert.assertTrue(loginPage.isLoginPageVisible(), "Login page should be visible after logout.");
        Assert.assertTrue(productsPage.isSessionCleared(), "Logout should clear token, userId, and role from local storage.");
    }

    @Test
    public void validateProtectedRouteRedirectsWhenSessionMissing() {
        ProductsPage productsPage = new ProductsPage(driver).open(BASE_URL);

        Assert.assertTrue(new LoginPage(driver).isLoginPageVisible(), "Missing session should redirect to login page.");
        Assert.assertTrue(productsPage.isSessionCleared(), "Protected route should keep storage cleared for anonymous users.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/login");
    }
}
