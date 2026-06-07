package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By emailInputByCss = By.cssSelector("input[name='email']");
    private final By passwordInputByXpath = By.xpath("//input[@name='password']");
    private final By loginButtonByXpath = By.xpath("//button[normalize-space()='Login']");
    private final By registerLinkByCss = By.cssSelector(".auth-switch a[href='/register']");
    private final By fieldErrorByCss = By.cssSelector(".field-error");
    private final By toastByCss = By.cssSelector(".toastify-fallback-toast, .app-toast, .toast, [role='alert']");
    private final By productsHeadingByXpath = By.xpath("//h1[normalize-space()='Shop Products']");
    private final By profileMenuButtonByCss = By.cssSelector(".profile-menu-trigger");
    private final By logoutButtonByXpath = By.xpath("//button[.//span[normalize-space()='Logout']]");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public LoginPage open(String baseUrl) {
        driver.get(baseUrl + "/login");
        return this;
    }

    public LoginPage enterEmail(String email) {
        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInputByCss));
        emailInput.clear();
        emailInput.sendKeys(email);
        return this;
    }

    public LoginPage enterPassword(String password) {
        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInputByXpath));
        passwordInput.clear();
        passwordInput.sendKeys(password);
        return this;
    }

    public LoginPage clickLogin() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(loginButtonByXpath)));
        return this;
    }

    public LoginPage login(String email, String password) {
        return enterEmail(email)
                .enterPassword(password)
                .clickLogin();
    }

    public RegisterPage goToRegisterPage() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(registerLinkByCss)));
        return new RegisterPage(driver);
    }

    public boolean isLoginPageVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(loginButtonByXpath)).isDisplayed();
    }

    public boolean isProductsPageVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(productsHeadingByXpath)).isDisplayed();
    }

    public String getFirstFieldError() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(fieldErrorByCss)).getText();
    }

    public String getToastMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(toastByCss)).getText();
    }

    public LoginPage logout() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(profileMenuButtonByCss)));
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(logoutButtonByXpath)));
        return this;
    }

    public String getPageTitle() {
        return driver.getTitle();
    }

    private void safeClick(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }
}
