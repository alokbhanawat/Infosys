package utilities;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import pages.AdminDashboardPage;
import pages.LoginPage;
import pages.ProductsPage;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class LoginUtils {
    public static final String VALID_EMAIL = System.getProperty("validEmail", "mansi@gmail.com");
    public static final String VALID_PASSWORD = System.getProperty("validPassword", "Mansi@1234");
    public static final String ADMIN_EMAIL = System.getProperty("adminEmail", "admin@gmail.com");
    public static final String ADMIN_PASSWORD = System.getProperty("adminPassword", "Admin@1234");
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    private LoginUtils() {
    }

    public static ProductsPage loginAsDefaultUser(WebDriver driver, String baseUrl) {
        Session session = loginThroughApi(baseUrl, VALID_EMAIL, VALID_PASSWORD);
        storeSession(driver, baseUrl, session);
        driver.get(baseUrl + "/products");
        return new ProductsPage(driver).waitUntilVisible();
    }

    public static AdminDashboardPage loginAsAdmin(WebDriver driver, String baseUrl) {
        Session session = loginThroughApi(baseUrl, ADMIN_EMAIL, ADMIN_PASSWORD);
        storeSession(driver, baseUrl, session);
        driver.get(baseUrl + "/admin");
        return new AdminDashboardPage(driver).waitUntilVisible();
    }

    private static Session loginThroughApi(String baseUrl, String email, String password) {
        try {
            String apiBaseUrl = System.getProperty("apiBaseUrl", baseUrl.replace(":5173", ":8080") + "/api");
            String body = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/users/login"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new IllegalStateException("Login API failed with status " + response.statusCode());
            }

            String responseBody = response.body();
            return new Session(
                    extractJsonString(responseBody, "token"),
                    extractJsonNumber(responseBody, "userId"),
                    extractJsonString(responseBody, "role")
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create authenticated test session.", exception);
        }
    }

    private static void storeSession(WebDriver driver, String baseUrl, Session session) {
        driver.get(baseUrl + "/login");
        ((JavascriptExecutor) driver).executeScript(
                "window.localStorage.setItem('token', arguments[0]);"
                        + "window.localStorage.setItem('userId', arguments[1]);"
                        + "window.localStorage.setItem('role', arguments[2]);",
                session.token(),
                session.userId(),
                session.role()
        );
    }

    private static String extractJsonString(String json, String fieldName) {
        Matcher matcher = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*\"([^\"]+)\"").matcher(json);

        if (!matcher.find()) {
            throw new IllegalStateException("Missing " + fieldName + " in login response.");
        }

        return matcher.group(1);
    }

    private static String extractJsonNumber(String json, String fieldName) {
        Matcher matcher = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*(\\d+)").matcher(json);

        if (!matcher.find()) {
            throw new IllegalStateException("Missing " + fieldName + " in login response.");
        }

        return matcher.group(1);
    }

    private record Session(String token, String userId, String role) {
    }
}
