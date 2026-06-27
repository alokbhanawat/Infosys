package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.RegisterPage;

import java.time.Duration;

public class RegisterTest extends BaseTest {
    private static final String VALID_PASSWORD = "Mansi@1234";

    @Test
    public void validateEmptyName() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("", "newuser@gmail.com", "9876543210", VALID_PASSWORD, VALID_PASSWORD);

        Assert.assertEquals(registerPage.getFirstFieldError(), "Name is required.");
    }

    @Test
    public void validateEmptyEmail() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("New User", "", "9876543210", VALID_PASSWORD, VALID_PASSWORD);

        Assert.assertEquals(registerPage.getFirstFieldError(), "Email is required.");
    }

    @Test
    public void validateInvalidEmail() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("New User", "invalid@gmail", "9876543210", VALID_PASSWORD, VALID_PASSWORD);

        Assert.assertEquals(registerPage.getFirstFieldError(), "Enter a valid email with @ and .com and no spaces.");
    }

    @Test
    public void validateEmptyPassword() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("New User", "newuser@gmail.com", "9876543210", "", "");

        Assert.assertEquals(registerPage.getFirstFieldError(), "Password is required.");
    }

    @Test
    public void validateConfirmPasswordMismatch() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("New User", "newuser@gmail.com", "9876543210", VALID_PASSWORD, "Wrong@1234");

        Assert.assertEquals(registerPage.getFirstFieldError(), "Passwords do not match.");
    }

    @Test
    public void automateUserRegistrationFlow() {
        String uniqueEmail = "selenium" + System.currentTimeMillis() + "@gmail.com";
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("Selenium User", uniqueEmail, "9876543210", VALID_PASSWORD, VALID_PASSWORD);
        acceptAlertIfPresent();

        wait.withTimeout(Duration.ofSeconds(30)).until(driver ->
                driver.getCurrentUrl().contains("/login")
                        || registerPage.hasSuccessfulFeedback()
        );

        Assert.assertTrue(
                driver.getCurrentUrl().contains("/login") || registerPage.hasSuccessfulFeedback(),
                "Valid registration should show success feedback or redirect to login."
        );
    }
}
