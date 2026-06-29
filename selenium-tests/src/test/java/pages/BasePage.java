package pages;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BasePage {
    protected static final Duration DEFAULT_WAIT = Duration.ofSeconds(25);
    protected static final long DEMO_PAUSE_MILLIS = Long.getLong("demoPauseMillis", 1500L);
    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, DEFAULT_WAIT);
    }

    protected void safeClick(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    protected WebElement waitForVisibleAndPause(By locator) {
        WebElement element = wait.until((webDriver) -> {
            WebElement visibleElement = webDriver.findElement(locator);
            String text = visibleElement.getText().trim();
            return visibleElement.isDisplayed() && !text.isEmpty() ? visibleElement : null;
        });
        pauseForDemo();
        return element;
    }

    protected void pauseForDemo() {
        if (DEMO_PAUSE_MILLIS <= 0) {
            return;
        }

        try {
            Thread.sleep(DEMO_PAUSE_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    protected String getLocalStorageItem(String key) {
        Object value = ((JavascriptExecutor) driver).executeScript(
                "return window.localStorage.getItem(arguments[0]);",
                key
        );
        return value == null ? null : value.toString();
    }
}
