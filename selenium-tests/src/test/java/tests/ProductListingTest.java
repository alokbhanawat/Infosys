package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.AdminDashboardPage;
import pages.ProductDetailPage;
import pages.ProductsPage;
import utilities.LoginUtils;

public class ProductListingTest extends BaseTest {

    @Test
    public void validateUserCanViewProductListing() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();

        Assert.assertTrue(productsPage.isVisible(), "User product listing page should be visible.");
        Assert.assertTrue(driver.getCurrentUrl().contains("/products"), "User should remain on products route.");
        Assert.assertTrue(productsPage.getVisibleProductCount() > 0, "At least one product should be visible to the user.");
        Assert.assertTrue(productsPage.hasVisibleProductDetails(), "Visible products should show name and price.");
    }

    @Test
    public void validateUserCanOpenProductCardFromListing() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();

        Assert.assertTrue(productsPage.isVisible(), "Product page should be visible after user login.");

        ProductDetailPage productDetailPage = productsPage.openFirstProductCard();

        Assert.assertTrue(productDetailPage.isVisible(), "Product detail page should open after clicking product card.");
        Assert.assertTrue(driver.getCurrentUrl().contains("/products/"), "Product card should navigate to product detail route.");
        Assert.assertTrue(productDetailPage.hasProductDetails(), "Product detail page should show product id, name, and price.");
        Assert.assertTrue(productDetailPage.isProductActionVisible(), "Product detail action button should be visible.");
    }

    @Test
    public void validateAdminCanViewProductListing() {
        AdminDashboardPage adminDashboardPage = LoginUtils.loginAsAdmin(driver, BASE_URL)
                .waitForProductListingLoaded();

        Assert.assertTrue(adminDashboardPage.isVisible(), "Admin dashboard should be visible.");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin"), "Admin should remain on admin route.");
        Assert.assertTrue(adminDashboardPage.getVisibleProductCount() > 0, "At least one product should be visible to the admin.");
        Assert.assertTrue(adminDashboardPage.hasVisibleProductDetails(), "Visible admin products should show name, price, and stock.");
    }
}
