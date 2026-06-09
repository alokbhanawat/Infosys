package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LoginPage extends BasePage {
    private final By emailInputByCss = By.cssSelector("input[name='email']");
    private final By passwordInputByXpath = By.xpath("//input[@name='password']");
    private final By loginButtonByXpath = By.xpath("//button[normalize-space()='Login']");
    private final By registerLinkByCss = By.cssSelector(".auth-switch a[href='/register']");
    private final By fieldErrorByCss = By.cssSelector(".field-error");
    private final By toastByCss = By.cssSelector(".toastify-fallback-toast, .app-toast, .toast, [role='alert']");

    public LoginPage(WebDriver driver) {
        super(driver);
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

    public ProductsPage waitForProductsPage() {
        return new ProductsPage(driver).waitUntilVisible();
    }

    public String getFirstFieldError() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(fieldErrorByCss)).getText();
    }

    public String getToastMessage() {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(toastByCss));
        String message = toast.getText();
        pauseForDemo();
        return message;
    }

    public String getPageTitle() {
        return driver.getTitle();
    }
}
