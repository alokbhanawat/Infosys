package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;
import pages.LoginPage;
import pages.RegisterPage;

public class NavigationTest extends BaseTest {

    @Test(priority = 1)
    public void openHomePage() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);

        Assert.assertTrue(homePage.isAppLoaded(), "Application root should be visible.");
        Assert.assertTrue(driver.getCurrentUrl().startsWith(BASE_URL), "Home page should open on localhost.");
    }

    @Test(priority = 2)
    public void verifyPageTitle() {
        new HomePage(driver).open(BASE_URL);

        Assert.assertEquals(driver.getTitle(), "frontend", "Page title should match frontend index title.");
    }

    @Test(priority = 3)
    public void verifyCurrentUrl() {
        new HomePage(driver).open(BASE_URL);

        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/", "Home route should stay on the root URL.");
    }

    @Test(priority = 4)
    public void navigateToLoginPage() {
        LoginPage loginPage = new LoginPage(driver).open(BASE_URL);

        Assert.assertTrue(loginPage.isLoginPageVisible(), "Login page should be visible.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/login");
    }

    @Test(priority = 5)
    public void navigateToRegisterPage() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);
        RegisterPage registerPage = homePage.goToRegisterPage();

        Assert.assertTrue(registerPage.isRegisterPageVisible(), "Register page should be visible.");
        Assert.assertEquals(driver.getCurrentUrl(), BASE_URL + "/register");
    }

    @Test(priority = 6)
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
