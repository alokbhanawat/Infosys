package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.Test;
import pages.ProductsPage;
import utilities.LoginUtils;

public class ProductSearchFilterTest extends BaseTest {

    @Test
    public void validateUserCanFindProductThroughNameAfterLogin() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();
        String productName = productsPage.getFirstVisibleProductName();

        productsPage.searchByName(productName);

        Assert.assertTrue(productsPage.getVisibleProductCount() > 0, "Search should return at least one user product.");
        Assert.assertTrue(productsPage.hasProductNamed(productName), "Search results should include the searched product name.");
        Assert.assertTrue(productsPage.allVisibleProductsMatchSearchTerm(productName), "Every visible user result should match the search term.");
    }

    @Test
    public void validateUserCanFilterProductsThroughCategoryAfterLogin() {
        ProductsPage productsPage = LoginUtils.loginAsDefaultUser(driver, BASE_URL)
                .waitForProductListingLoaded();
        String category = requireFilterableCategory(productsPage.getFirstFilterableCategory());

        productsPage.filterByCategory(category);

        Assert.assertTrue(productsPage.getVisibleProductCount() > 0, "Category filter should return at least one user product.");
        Assert.assertTrue(productsPage.allVisibleProductsHaveCategory(category), "Every visible user result should match the selected category.");
    }
    private String requireFilterableCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new SkipException("No categorized products are available for category filter validation.");
        }

        return category;
    }
}
