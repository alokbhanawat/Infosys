package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.RegisterPage;

import java.time.Duration;

public class RegisterTest extends BaseTest {
    private static final String VALID_PASSWORD = "Mansi@1234";

    @Test
    public void validateRegistrationRejectsEmptyRequiredFields() {
        RegisterPage registerPage = new RegisterPage(driver).open(BASE_URL);
        registerPage.register("", "", "", "", "");

        Assert.assertEquals(registerPage.getFirstFieldError(), "Name is required.");
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
