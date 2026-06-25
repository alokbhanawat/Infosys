package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class HomePage extends BasePage {
    private final By appRootById = By.id("root");
    private final By loginHeadingByCss = By.cssSelector(".auth-card h2");
    private final By registerLinkByXpath = By.xpath("//a[@href='/register' and normalize-space()='Register']");
    private final By loginLinkByXpath = By.xpath("//a[@href='/login' and normalize-space()='Login']");

    public HomePage(WebDriver driver) {
        super(driver);
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
        String currentUrl = driver.getCurrentUrl();
        int pathStart = currentUrl.indexOf("/", currentUrl.indexOf("//") + 2);
        String baseUrl = pathStart == -1 ? currentUrl : currentUrl.substring(0, pathStart);
        driver.get(baseUrl + "/register");
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
}
