package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.HomePage;

public class SampleTest extends BaseTest {

    @Test(enabled = false)
    public void sampleLocalhostSmokeTest() {
        HomePage homePage = new HomePage(driver).open(BASE_URL);

        Assert.assertTrue(homePage.isAppLoaded(), "Application root should be visible.");
    }
}
