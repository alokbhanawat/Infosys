package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class RegisterPage extends BasePage {
    private final By nameInputByCss = By.cssSelector("input[name='name']");
    private final By emailInputByXpath = By.xpath("//input[@name='email']");
    private final By phoneInputByCss = By.cssSelector("input[name='phone']");
    private final By passwordInputByCss = By.cssSelector("input[name='password']");
    private final By confirmPasswordInputByXpath = By.xpath("//input[@name='confirmPassword']");
    private final By createAccountButtonByXpath = By.xpath("//button[normalize-space()='Create account']");
    private final By loginLinkByCss = By.cssSelector(".auth-switch a[href='/login']");
    private final By fieldErrorByCss = By.cssSelector(".field-error");
    private final By toastByCss = By.cssSelector(".toastify-fallback-toast, .app-toast, .toast, [role='alert']");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public RegisterPage open(String baseUrl) {
        driver.get(baseUrl + "/register");
        return this;
    }

    public RegisterPage enterName(String name) {
        type(nameInputByCss, name);
        return this;
    }

    public RegisterPage enterEmail(String email) {
        type(emailInputByXpath, email);
        return this;
    }

    public RegisterPage enterPhone(String phone) {
        type(phoneInputByCss, phone);
        return this;
    }

    public RegisterPage enterPassword(String password) {
        type(passwordInputByCss, password);
        return this;
    }

    public RegisterPage enterConfirmPassword(String confirmPassword) {
        type(confirmPasswordInputByXpath, confirmPassword);
        return this;
    }

    public RegisterPage clickCreateAccount() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(createAccountButtonByXpath)));
        return this;
    }

    public RegisterPage register(String name, String email, String phone, String password, String confirmPassword) {
        return enterName(name)
                .enterEmail(email)
                .enterPhone(phone)
                .enterPassword(password)
                .enterConfirmPassword(confirmPassword)
                .clickCreateAccount();
    }

    public LoginPage goToLoginPage() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(loginLinkByCss)));
        return new LoginPage(driver);
    }

    public boolean isRegisterPageVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(createAccountButtonByXpath)).isDisplayed();
    }

    public String getFirstFieldError() {
        return waitForVisibleAndPause(fieldErrorByCss).getText();
    }

    public String getToastMessage() {
        return waitForVisibleAndPause(toastByCss).getText();
    }

    public boolean hasSuccessfulFeedback() {
        try {
            boolean successfulFeedbackVisible = driver.findElements(toastByCss).stream()
                    .filter(WebElement::isDisplayed)
                    .anyMatch(toast -> toast.getText().toLowerCase().contains("successful"));
            if (successfulFeedbackVisible) {
                pauseForDemo();
            }
            return successfulFeedbackVisible;
        } catch (NoSuchElementException ignored) {
            return false;
        }
    }

    private void type(By locator, String value) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        input.clear();
        input.sendKeys(value);
    }
}
