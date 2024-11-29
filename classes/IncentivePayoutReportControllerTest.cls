@isTest
public class IncentivePayoutReportControllerTest {
    @testSetup
    static void setUpData(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured'; DI.Month__c = 'January'; DI.Year__c = 2024; DI.Stage__c = 'Configured'; DI.Total_Payout_Predicted__c = 500; DI.Total_Payout_Achieved__c = 400; DI.Total_Additional_Payout_Predicted__c = 600;
        DI.Total_Additional_Payout_Achieved__c = 500; DI.Total_Product_Payout_Predicted__c = 450; DI.Total_Product_Payout_Achieved__c = 500; DI.Total_Retail_Predicted__c = 500; DI.Total_Retail_Achieved__c = 500;
        insert DI;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL'; diProdcategory.Order_No__c = 1;
        insert diProdcategory;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIprodAndAcheive = new DI_Product_Target_and_Achievement__c();
        DIprodAndAcheive.Dealer_Incentive__c = DI.Id; DIprodAndAcheive.Product_Category__c = diProdcategory.Id; DIprodAndAcheive.Total_Product_Predicted_Payout__c = 500; DIprodAndAcheive.Total_Product_Actual_Payout__c = 450;  DIprodAndAcheive.Total_Retail_Predicted__c = 250;
        DIprodAndAcheive.Total_Retail_Achieved__c = 10;
        insert DIprodAndAcheive;
        
        //Create DI KPI Infos
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();
        kpiInfo.Name = 'Test'; kpiInfo.Data_Source__c = 'Salesforce';
        insert kpiInfo;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'test'; prodKPI.Product_Category__c = diProdcategory.Id; prodKPI.KPI__c = kpiInfo.Id; prodKPI.Order_No__c = 1;
        insert prodKPI;
        
        //Create DI KPI Achievement
        DI_KPI_Achievement__c kpiAcheive = new DI_KPI_Achievement__c();
        kpiAcheive.Product_KPI__c = prodKPI.Id; kpiAcheive.DI_Product_Target_and_Achivement__c = DIprodAndAcheive.Id; kpiAcheive.Predicted_KPI_Payout__c = 100; kpiAcheive.Predicted_KPI_Percentage__c = 10; kpiAcheive.Achieved_KPI_Payout__c = 50; kpiAcheive.Achieved_KPI_Perncentage__c = 10;
        insert kpiAcheive;
        
        //Create Content Version
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test';
        cv.PathOnClient = 'Test';
        cv.VersionData = Blob.valueOf('Test Content');
        insert cv;
    }
    
    @isTest
    static void IncentivePayoutReportControllerTest(){
        Account dealerAccount = [SELECT Id FROM Account WHERE Name = 'Dealer' LIMIT 1];
        Id dealerId = dealerAccount.Id;
        Test.startTest();
        Test.setCurrentPageReference(Page.Incentive_Calculation);
        ApexPages.currentPage().getParameters().put('id', dealerId); 
        ApexPages.currentPage().getParameters().put('month', 'January');
        ApexPages.currentPage().getParameters().put('year', '2024');
        IncentivePayoutReportController controller = new IncentivePayoutReportController();
        Test.stopTest();
    }
    
    @isTest
    static void getPdfcontentTest(){
        Account dealerAccount = [SELECT Id FROM Account LIMIT 1];
        String month = 'January';
        String year = '2024';
        String dealerId = dealerAccount.Id;
        //Testing
        Test.startTest();
        string getPdf = IncentivePayoutReportController.getPdfcontent(month, year, dealerId);
        Test.stopTest();
    }
    
    @isTest
    static void deleteContentDocumentsTest(){
        Id contDocId = [SELECT Id FROM ContentDocument LIMIT 1].Id;
        //Testing
        Test.startTest();
        String deleteContentDoc = IncentivePayoutReportController.deleteContentDocuments(contDocId);
        Test.stopTest();
    }
}