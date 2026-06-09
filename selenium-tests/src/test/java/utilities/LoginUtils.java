package utilities;

import org.openqa.selenium.WebDriver;
import pages.LoginPage;
import pages.ProductsPage;

public final class LoginUtils {
    public static final String VALID_EMAIL = System.getProperty("validEmail", "mansi@gmail.com");
    public static final String VALID_PASSWORD = System.getProperty("validPassword", "Mansi@1234");

    private LoginUtils() {
    }

    public static ProductsPage loginAsDefaultUser(WebDriver driver, String baseUrl) {
        LoginPage loginPage = new LoginPage(driver).open(baseUrl);
        loginPage.login(VALID_EMAIL, VALID_PASSWORD);
        return loginPage.waitForProductsPage();
    }
}
