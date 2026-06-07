package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.LoginPage;
import pages.RegisterPage;

public class NavigationTest extends BaseTest {

    @Test
    public void openHomePage() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);

        Assert.assertTrue(homePage.isAppLoaded(), "Application root should be visible.");
        Assert.assertTrue(driver.getCurrentUrl().startsWith(BASE_URL), "Home page should open on localhost.");
    }

    @Test
    public void verifyPageTitle() {
        new HomePage(driver).open(BASE_URL);

        Assert.assertEquals(driver.getTitle(), "frontend", "Page title should match frontend index title.");
    }

    @Test
    public void verifyCurrentUrl() {
        new HomePage(driver).open(BASE_URL);

        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/", "Home route should stay on the root URL.");
    }

    @Test
    public void navigateToLoginPage() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);

        Assert.assertTrue(loginPage.isLoginPageVisible(), "Login page should be visible.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/login");
    }

    @Test
    public void navigateToRegisterPage() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);
        RegisterPage registerPage = homePage.goToRegisterPage();

        Assert.assertTrue(registerPage.isRegisterPageVisible(), "Register page should be visible.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/register");
    }

    @Test
    public void navigateBackAndForward() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);
        RegisterPage registerPage = homePage.goToRegisterPage();
        Assert.assertTrue(registerPage.isRegisterPageVisible(), "Register page should be visible before browser navigation.");

        homePage.navigateBack();
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/", "Back should return to home page.");

        homePage.navigateForward();
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/register", "Forward should return to register page.");
    }
}
