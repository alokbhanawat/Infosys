package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

public class CartPage extends BasePage {
    private final By cartHeroByCss = By.cssSelector(".cart-hero");
    private final By loadingStateByXpath = By.xpath("//p[normalize-space()='Loading cart items...']");
    private final By checkoutButtonByCss = By.cssSelector(".cart-checkout-btn");
    private final By checkoutFormByCss = By.cssSelector(".checkout-form-grid");
    private final By checkoutMessageByCss = By.cssSelector(".form-message, .cart-payment-alert");
    private final By razorpayMockModalByCss = By.cssSelector(".mock-razorpay-modal");
    private final By razorpayCardNumberInputByCss = By.cssSelector(".mock-razorpay-card-number");
    private final By razorpayCvvInputByCss = By.cssSelector(".mock-razorpay-cvv");
    private final By razorpaySuccessButtonByCss = By.cssSelector(".mock-razorpay-success-button");
    private final By savedAddressSelectByCss = By.cssSelector(".saved-address-picker select");
    private final By fullNameInputByCss = By.cssSelector("input[name='fullName']");
    private final By phoneInputByCss = By.cssSelector("input[name='phone']");
    private final By addressLine1InputByCss = By.cssSelector("input[name='addressLine1']");
    private final By addressLine2InputByCss = By.cssSelector("input[name='addressLine2']");
    private final By cityInputByCss = By.cssSelector("input[name='city']");
    private final By stateInputByCss = By.cssSelector("input[name='state']");
    private final By postalCodeInputByCss = By.cssSelector("input[name='postalCode']");
    private final By countryInputByCss = By.cssSelector("input[name='country']");
    private final By paymentMethodSelectByCss = By.cssSelector("select[name='paymentMethod']");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public CartPage open(String baseUrl) {
        driver.get(baseUrl + "/cart");
        return this;
    }

    public CartPage waitUntilVisible() {
        wait.until(ExpectedConditions.urlContains("/cart"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(cartHeroByCss));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(loadingStateByXpath));
        wait.until(ExpectedConditions.visibilityOfElementLocated(checkoutFormByCss));
        pauseForDemo();
        return this;
    }

    public boolean hasProduct(String productName) {
        return wait.until((webDriver) -> findCartItemByProductName(productName).isDisplayed());
    }

    public boolean isProductAbsent(String productName) {
        return wait.until((webDriver) -> findCartItemsByProductName(productName).isEmpty());
    }

    public int getQuantityForProduct(String productName) {
        WebElement cartItem = wait.until((webDriver) -> findCartItemByProductName(productName));
        String quantity = cartItem.findElement(By.cssSelector(".cart-quantity-value")).getText().trim();
        return Integer.parseInt(quantity);
    }

    public CartPage changeQuantityTo(String productName, int targetQuantity) {
        wait.until((webDriver) -> {
            int currentQuantity = getQuantityForProduct(productName);
            if (currentQuantity == targetQuantity) {
                return true;
            }

            WebElement cartItem = findCartItemByProductName(productName);
            String actionLabel = currentQuantity < targetQuantity ? "Increase quantity" : "Decrease quantity";
            WebElement quantityButton = cartItem.findElement(By.xpath(".//button[contains(@aria-label,'"
                    + actionLabel + "')]"));
            safeClick(quantityButton);
            return false;
        });
        return this;
    }

    public CartPage removeProduct(String productName) {
        WebElement cartItem = wait.until((webDriver) -> findCartItemByProductName(productName));
        WebElement removeButton = cartItem.findElement(By.cssSelector(".cart-remove-btn"));
        safeClick(removeButton);
        wait.until((webDriver) -> findCartItemsByProductName(productName).isEmpty());
        return this;
    }

    public CartPage useNewCheckoutAddressIfAvailable() {
        List<WebElement> savedAddressSelects = driver.findElements(savedAddressSelectByCss);
        if (!savedAddressSelects.isEmpty()) {
            WebElement savedAddressSelect = savedAddressSelects.get(0);
            Select select = new Select(savedAddressSelect);
            select.selectByValue("");
            ((JavascriptExecutor) driver).executeScript("""
                    const select = arguments[0];
                    select.value = '';
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    """, savedAddressSelect);
            wait.until(ExpectedConditions.attributeToBe(savedAddressSelect, "value", ""));
        }
        return this;
    }

    public CartPage clearRequiredCheckoutFields() {
        useNewCheckoutAddressIfAvailable();
        clearField(fullNameInputByCss);
        clearField(phoneInputByCss);
        clearField(addressLine1InputByCss);
        clearField(cityInputByCss);
        clearField(stateInputByCss);
        clearField(postalCodeInputByCss);
        clearField(countryInputByCss);
        return this;
    }

    public CartPage fillCheckoutForm(
            String fullName,
            String phone,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String postalCode,
            String country,
            String paymentMethod) {
        useNewCheckoutAddressIfAvailable();
        setFieldValue(fullNameInputByCss, fullName);
        setFieldValue(phoneInputByCss, phone);
        setFieldValue(addressLine1InputByCss, addressLine1);
        setFieldValue(addressLine2InputByCss, addressLine2);
        setFieldValue(cityInputByCss, city);
        setFieldValue(stateInputByCss, state);
        setFieldValue(postalCodeInputByCss, postalCode);
        setFieldValue(countryInputByCss, country);
        new Select(wait.until(ExpectedConditions.elementToBeClickable(paymentMethodSelectByCss))).selectByValue(paymentMethod);
        return this;
    }

    public CartPage clickCheckout() {
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(checkoutButtonByCss)));
        pauseForDemo();
        return this;
    }

    public boolean isCheckoutButtonEnabled() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(checkoutButtonByCss)).isEnabled();
    }

    public boolean hasCheckoutMessage(String expectedMessage) {
        boolean messageVisible = wait.until((webDriver) -> driver.findElements(checkoutMessageByCss).stream()
                .anyMatch((message) -> message.isDisplayed()
                        && message.getText().trim().contains(expectedMessage)));
        pauseForDemo();
        return messageVisible;
    }

    public boolean hasFieldError(String fieldName, String expectedMessage) {
        By fieldErrorByXpath = By.xpath(
                "//input[@name=" + xpathLiteral(fieldName) + "]/following-sibling::small[contains(@class,'checkout-field-error')"
                        + " and contains(normalize-space()," + xpathLiteral(expectedMessage) + ")]"
        );
        return wait.until(ExpectedConditions.visibilityOfElementLocated(fieldErrorByXpath)).isDisplayed();
    }

    public CartPage installSuccessfulRazorpayMock(String productName) {
        String script = """
                const productName = arguments[0];
                const NativeXHR = window.XMLHttpRequest;

                window.Razorpay = function Razorpay(options) {
                  this.options = options;
                  this.events = {};
                  this.on = (eventName, handler) => {
                    this.events[eventName] = handler;
                  };
                  this.open = () => {
                    window.__checkoutRazorpayOpened = true;
                    const existingModal = document.querySelector('.mock-razorpay-modal');
                    if (existingModal) {
                      existingModal.remove();
                    }

                    const modal = document.createElement('section');
                    modal.className = 'mock-razorpay-modal';
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-label', 'Mock Razorpay card payment');
                    modal.innerHTML = `
                      <div class="mock-razorpay-box" style="position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.45);display:grid;place-items:center;">
                        <div style="width:min(420px, calc(100vw - 32px));background:#fff;color:#111827;border-radius:8px;padding:20px;box-shadow:0 24px 80px rgba(15,23,42,.28);">
                          <h2 style="margin:0 0 12px;font-size:20px;">Razorpay test card payment</h2>
                          <label style="display:grid;gap:6px;margin-bottom:12px;">
                            <span>Card number</span>
                            <input class="mock-razorpay-card-number" inputmode="numeric" autocomplete="cc-number" />
                          </label>
                          <label style="display:grid;gap:6px;margin-bottom:16px;">
                            <span>CVV</span>
                            <input class="mock-razorpay-cvv" inputmode="numeric" autocomplete="cc-csc" />
                          </label>
                          <button type="button" class="mock-razorpay-success-button">Success</button>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(modal);
                    modal.querySelector('.mock-razorpay-success-button').addEventListener('click', () => {
                      window.__checkoutRazorpayCardNumber = modal.querySelector('.mock-razorpay-card-number').value;
                      window.__checkoutRazorpayCvv = modal.querySelector('.mock-razorpay-cvv').value;
                      modal.remove();
                      options.handler({
                        razorpay_order_id: 'order_test_checkout',
                        razorpay_payment_id: 'pay_test_checkout',
                        razorpay_signature: 'test_signature'
                      });
                    });
                  };
                };

                window.XMLHttpRequest = function MockableXMLHttpRequest() {
                  const nativeRequest = new NativeXHR();
                  const request = this;
                  request.readyState = 0;
                  request.status = 0;
                  request.statusText = '';
                  request.responseText = '';
                  request.response = '';
                  request.onreadystatechange = null;
                  request.onloadend = null;
                  request.onload = null;
                  request.onerror = null;
                  request._listeners = {};

                  request.addEventListener = function(eventName, handler) {
                    request._listeners[eventName] = request._listeners[eventName] || [];
                    request._listeners[eventName].push(handler);
                    if (!request._mocked) {
                      nativeRequest.addEventListener(eventName, handler);
                    }
                  };
                  request.removeEventListener = function(eventName, handler) {
                    request._listeners[eventName] = (request._listeners[eventName] || []).filter((item) => item !== handler);
                    if (!request._mocked) {
                      nativeRequest.removeEventListener(eventName, handler);
                    }
                  };
                  const emit = function(eventName) {
                    (request._listeners[eventName] || []).forEach((handler) => handler.call(request));
                  };
                  request.open = function(method, url, async, user, password) {
                    request._method = method;
                    request._url = String(url);
                    request._mocked = request._url.includes('/api/orders/razorpay/create-order')
                      || request._url.includes('/api/orders/razorpay/verify');
                    if (!request._mocked) {
                      nativeRequest.open(method, url, async, user, password);
                    }
                  };
                  request.setRequestHeader = function(name, value) {
                    if (!request._mocked) {
                      nativeRequest.setRequestHeader(name, value);
                    }
                  };
                  request.getAllResponseHeaders = function() {
                    return request._mocked ? 'content-type: application/json\\r\\n' : nativeRequest.getAllResponseHeaders();
                  };
                  request.getResponseHeader = function(name) {
                    return request._mocked && name.toLowerCase() === 'content-type'
                      ? 'application/json'
                      : nativeRequest.getResponseHeader(name);
                  };
                  request.abort = function() {
                    if (!request._mocked) {
                      nativeRequest.abort();
                    }
                  };
                  request.send = function(body) {
                    if (!request._mocked) {
                      nativeRequest.onreadystatechange = function() {
                        request.readyState = nativeRequest.readyState;
                        request.status = nativeRequest.status;
                        request.statusText = nativeRequest.statusText;
                        request.responseText = nativeRequest.responseText;
                        request.response = nativeRequest.response;
                        if (request.onreadystatechange) {
                          request.onreadystatechange();
                        }
                      };
                      nativeRequest.onloadend = function() {
                        if (request.onloadend) {
                          request.onloadend();
                        }
                      };
                      nativeRequest.send(body);
                      return;
                    }

                    setTimeout(() => {
                      const payload = request._url.includes('/create-order')
                        ? {
                            keyId: 'rzp_test_mock',
                            razorpayOrderId: 'order_test_checkout',
                            amount: 10000,
                            currency: 'INR',
                            totalPrice: 100,
                            paymentMethod: 'CARD'
                          }
                        : {
                            orderId: 987654,
                            totalPrice: 100,
                            items: [{
                              orderItemId: 1,
                              productId: 1,
                              productName,
                              quantity: 1,
                              lineTotal: 100
                            }],
                            shippingAddress: {
                              fullName: 'Automation Checkout',
                              phone: '9876543210',
                              addressLine1: '123 Test Street',
                              city: 'Bengaluru',
                              state: 'Karnataka',
                              postalCode: '560001',
                              country: 'India'
                            },
                            paymentSummary: {
                              paymentMethod: 'CARD',
                              paymentReference: 'RAZORPAY-pay_test_checkout'
                            }
                          };

                      request.readyState = 4;
                      request.status = 200;
                      request.statusText = 'OK';
                      request.responseText = JSON.stringify(payload);
                      request.response = request.responseText;
                      if (request.onreadystatechange) {
                        request.onreadystatechange();
                      }
                      if (request.onload) {
                        request.onload();
                      }
                      if (request.onloadend) {
                        request.onloadend();
                      }
                      emit('load');
                      emit('loadend');
                    }, 25);
                  };
                };
                """;
        ((JavascriptExecutor) driver).executeScript(script, productName);
        return this;
    }

    public CartPage completeRazorpayCardPayment(String cardNumber, String cvv) {
        WebElement cardNumberInput = wait.until(ExpectedConditions.visibilityOfElementLocated(razorpayCardNumberInputByCss));
        cardNumberInput.sendKeys(cardNumber);
        WebElement cvvInput = wait.until(ExpectedConditions.visibilityOfElementLocated(razorpayCvvInputByCss));
        cvvInput.sendKeys(cvv);
        pauseForDemo();
        safeClick(wait.until(ExpectedConditions.elementToBeClickable(razorpaySuccessButtonByCss)));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(razorpayMockModalByCss));
        pauseForDemo();
        return this;
    }

    public boolean wasRazorpayOpened() {
        Object value = ((JavascriptExecutor) driver).executeScript("return Boolean(window.__checkoutRazorpayOpened);");
        return Boolean.TRUE.equals(value);
    }

    public boolean isOrderSuccessVisible() {
        return wait.until((webDriver) -> {
            String currentUrl = driver.getCurrentUrl();
            String pageText = driver.getPageSource().toLowerCase();

            return currentUrl.contains("/orders/success")
                    || (currentUrl.endsWith("/orders") && pageText.contains("placed successfully"));
        });
    }

    private void clearField(By locator) {
        WebElement field = wait.until(ExpectedConditions.elementToBeClickable(locator));
        field.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        field.sendKeys(Keys.BACK_SPACE);
    }

    private void setFieldValue(By locator, String value) {
        WebElement field = wait.until(ExpectedConditions.elementToBeClickable(locator));
        field.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        field.sendKeys(Keys.BACK_SPACE);
        field.sendKeys(value);
    }

    private WebElement findCartItemByProductName(String productName) {
        return driver.findElement(cartItemByProductName(productName));
    }

    private List<WebElement> findCartItemsByProductName(String productName) {
        return driver.findElements(cartItemByProductName(productName));
    }

    private By cartItemByProductName(String productName) {
        return By.xpath(
                "//article[contains(@class,'cart-item')][.//strong[normalize-space()="
                        + xpathLiteral(productName) + "]]"
        );
    }

    private String xpathLiteral(String value) {
        if (!value.contains("'")) {
            return "'" + value + "'";
        }

        if (!value.contains("\"")) {
            return "\"" + value + "\"";
        }

        StringBuilder literal = new StringBuilder("concat(");
        String[] parts = value.split("'");
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                literal.append(", \"'\", ");
            }
            literal.append("'").append(parts[i]).append("'");
        }
        literal.append(")");
        return literal.toString();
    }
}
