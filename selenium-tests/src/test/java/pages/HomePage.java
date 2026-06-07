package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class HomePage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By appRootById = By.id("root");
    private final By loginHeadingByCss = By.cssSelector(".auth-card h2");
    private final By registerLinkByXpath = By.xpath("//a[@href='/register' and normalize-space()='Register']");
    private final By loginLinkByXpath = By.xpath("//a[@href='/login' and normalize-space()='Login']");

    public HomePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public HomePage open(String baseUrl) {
        driver.get(baseUrl + "/");
        return this;
    }

    public boolean isAppLoaded() {
        return wait.until(ExpectedConditions.presenceOfElementLocated(appRootById)).isDisplayed();
    }

    public String getLoginHeading() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(loginHeadingByCss)).getText();
    }

    public LoginPage goToLoginPage() {
        String loginUrl = driver.getCurrentUrl().replace("/register", "/login");
        driver.get(loginUrl.endsWith("/login") ? loginUrl : loginUrl + "login");
        return new LoginPage(driver);
    }

    public RegisterPage goToRegisterPage() {
        WebElement registerLink = wait.until(ExpectedConditions.elementToBeClickable(registerLinkByXpath));
        safeClick(registerLink);
        return new RegisterPage(driver);
    }

    public LoginPage clickLoginLinkFromRegisterPage() {
        WebElement loginLink = wait.until(ExpectedConditions.elementToBeClickable(loginLinkByXpath));
        safeClick(loginLink);
        return new LoginPage(driver);
    }

    public void navigateBack() {
        driver.navigate().back();
    }

    public void navigateForward() {
        driver.navigate().forward();
    }

    private void safeClick(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }
}
