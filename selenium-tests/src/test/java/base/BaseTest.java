package base;

import org.openqa.selenium.Alert;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import utilities.DriverFactory;

import java.time.Duration;

public class BaseTest {
    protected static final String BASE_URL = System.getProperty("baseUrl", "http://localhost:5173");
    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        driver = DriverFactory.createChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(45));
        wait = new WebDriverWait(driver, Duration.ofSeconds(25));
    }

    protected void openHomePage() {
        driver.get(BASE_URL + "/");
    }

    protected void acceptAlertIfPresent() {
        try {
            WebDriverWait alertWait = new WebDriverWait(driver, Duration.ofSeconds(5));
            Alert alert = alertWait.until(ExpectedConditions.alertIsPresent());
            Thread.sleep(Long.getLong("demoPauseMillis", 1500L));
            alert.accept();
        } catch (NoAlertPresentException ignored) {
            // Some pages do not show browser alerts.
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
            // Continue when no alert or popup appears within the wait time.
        }
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
