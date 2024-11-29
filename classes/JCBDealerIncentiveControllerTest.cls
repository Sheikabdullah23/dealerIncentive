@isTest
public class JCBDealerIncentiveControllerTest {
    @isTest
    static void getUserDetailsTest(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Testing
        Test.startTest();
        User account = JCBDealerIncentiveController.getUserDetails();
        Test.stopTest();
    }
    
    @isTest
    static void getDealerAndProductTargetInfoTest(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL';
        insert diProdcategory;
        
        //Create DI Product Target
        DI_Product_Target__c pd = new DI_Product_Target__c();
        pd.DI_Product_Category__c = diProdcategory.Id; pd.Year__c = 2023; pd.Stock_Policy__c = 5; pd.Month__c = 'January';
        insert pd;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured'; DI.Month__c = 'January'; DI.Year__c = 2023;DI.Total_Payout_Predicted__c = 100000; DI.Total_Retail_Achieved__c = 25000;
        insert DI;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIpta = new DI_Product_Target_and_Achievement__c();
        DIpta.Dealer_Incentive__c = DI.Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Product_Predicted_Payout__c = 1000; DIpta.Total_Product_Actual_Payout__c = 950;
        DIpta.Total_Retail_Predicted__c = 6000; DIpta.Total_Retail_Achieved__c = 5000; DIpta.Total_Retail_Target__c = 5500; DIpta.Demo_Target__c = 300;
        insert DIpta;
        
        //Create DI KPI Info
        DI_KPI_Info__c DIkpi = new DI_KPI_Info__c();
        DIkpi.Name = 'TestDIkpi'; DIkpi.Data_Source__c = 'Salesforce';
        insert DIkpi;
        
        //Create DI Product KPI
        DI_Product_KPI__c diPKPI = new DI_Product_KPI__c();
        diPKPI.Name = 'testDIKPI'; diPKPI.Product_Category__c = diProdcategory.Id; diPKPI.KPI__c = DIkpi.Id; diPKPI.Order_No__c = 1;
        insert diPKPI;
        
        //Create DI KPI Achievement
        DI_KPI_Achievement__c diKPIAcheive = new DI_KPI_Achievement__c();
        diKPIAcheive.Product_KPI__c = diPKPI.Id; diKPIAcheive.DI_Product_Target_and_Achivement__c = DIpta.Id; diKPIAcheive.Achieved_KPI_Payout__c = 200; diKPIAcheive.Achieved_KPI_Perncentage__c = 95;
        diKPIAcheive.Predicted_KPI_Payout__c = 250; diKPIAcheive.Predicted_KPI_Percentage__c = 90;
        insert diKPIAcheive;
        
        //Create DI Product Sub Category
        DI_Product_Sub_Category__c prodSub =new DI_Product_Sub_Category__c();
        prodSub.Name = 'TestName'; prodSub.Product_Category__c = diProdcategory.Id;
        insert prodSub;
        
        //Create DI KPI Target And Payout Info
        DI_KPI_Target_And_Payout_Info__c kpiTargetPayout = new DI_KPI_Target_And_Payout_Info__c();
        kpiTargetPayout.Month__c = 'January'; 
        kpiTargetPayout.Year__c = 2023; 
        kpiTargetPayout.KPI_Target__c = '100';
        kpiTargetPayout.KPI_Payout_Amount__c = 500; 
        kpiTargetPayout.Type__c = 'KPI Target';
        kpiTargetPayout.Has_Slabs__c = false; 
        kpiTargetPayout.DI_Product_KPI__c = diPKPI.Id;
        kpiTargetPayout.Machine_Target__c = '[{"slabRange":"== 1","amount":1100},{"slabRange":"== 2","amount":1200},{"slabRange":"== 3","amount":1300},{"slabRange":">= 4","amount":1500}]';
        kpiTargetPayout.Is_Salesman_Incentive__c = false;
        kpiTargetPayout.Sales_Person_Incentive_Target__c = '>50';
        kpiTargetPayout.Previous_Month__c = 'December';
        kpiTargetPayout.Previous_Year__c = 2023;
        insert kpiTargetPayout;
        
        //Create DI KPI Sub Product Payout
		DI_KPI_Sub_Product_Payout__c kpiSubProd = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProd.DI_Product_Sub_Category__c = prodSub.Id; kpiSubProd.DI_KPI_Target_And_Payout__c = kpiTargetPayout.Id;  kpiSubProd.Payout_Amount__c = 200; kpiSubProd.Payout_Varies_By_Region__c = false;       
        insert kpiSubProd;
        
        //Create DI Multi-KPI Target Config
        DI_Multi_KPI_Target_Config__c multiKpi = new DI_Multi_KPI_Target_Config__c();
        multiKpi.DI_Product_Target__c = pd.Id; multiKpi.Amount__c = 1000; multiKpi.Condition_Logic__c = 'OR'; multiKpi.Year__c = 2023; multiKpi.Month__c = 'January';
        insert multiKpi;
        
        //Create Slab Info
        Slab_Info__c si = new Slab_Info__c();
        si.DI_Multi_KPI_Target_Config__c = multiKpi.Id; si.Payout_Percentage__c = 50; si.Amount__c = 500; si.Payout_Mode__c = 'Test'; si.Slab_Range__c = '> 50 to <= 70';
        insert si;
        
        //Testing
        Test.startTest();
        Id dealerId = [SELECT Id FROM Account LIMIT 1].Id;
       	 	Map<string,Object> getDealAndProdInfo = JCBDealerIncentiveController.getDealerAndProductTargetInfo('January' , 2023 , dealerId);
        Test.stopTest();
        System.assert(getDealAndProdInfo != null, 'getDealAndProdInfo should not be null');
    }
    
    @isTest
    static void getProductAndSubProductsTest(){
        // Create DI Product Category
        List<DI_Product_Category__c> ProdCategory = new List<DI_Product_Category__c>();
        for(Integer i=0 ; i<3 ;i++){
            DI_Product_Category__c DI = new DI_Product_Category__c();
            DI.Name = 'BHL'+i;
            
            ProdCategory.add(DI);
        }
        insert ProdCategory;
        
        //Create DI Product Sub Category
        List<DI_Product_Sub_Category__c> diSubProd = new List<DI_Product_Sub_Category__c>();
        for(DI_Product_Category__c diPC : ProdCategory){
            for(Integer i=0 ; i<3 ; i++){
                DI_Product_Sub_Category__c prodSubCategory = new DI_Product_Sub_Category__c();
                prodSubCategory.Name = 'Test'+i; prodSubCategory.Product_Category__c = diPC.Id;
                
                diSubProd.add(prodSubCategory);
            }
        }
        insert diSubProd;
        
        //Testing
        Test.startTest();
        Map<String, Object> getProdAndSubProd = JCBDealerIncentiveController.getProductAndSubProducts();
        Test.stopTest();
        System.assert(getProdAndSubProd != null, 'getProdAndSubProd should not be null');
    }
    
    @isTest
    static void getProductsAndKPITest(){
        //Create Product Category
        DI_Product_Category__c pc = new DI_Product_Category__c();
        pc.Name = 'BHL';
        insert pc;
        
        //Create DI KPI Info
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();
        kpiInfo.Name = 'test kpi info'; kpiInfo.Data_Source__c = 'Salesforce';
        insert kpiInfo;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'test ProdKPI'; prodKPI.Product_Category__c = pc.Id; prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;
        
        //Testing
        Test.startTest();
        Map<String,List<DI_Product_KPI__c>> getProdAndKPI = JCBDealerIncentiveController.getProductsAndKPI();
        Test.stopTest();
        System.assert(getProdAndKPI != null, 'getProdAndKPI should not be null');
    }
    
    @isTest
    static void getMonthOptions(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Test Account'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured'; DI.Month__c = 'January'; DI.Year__c = 2023; DI.Total_Retail_Predicted__c = 1000; DI.Total_Retail_Achieved__c = 800;
        DI.Total_Payout_Predicted__c = 500; DI.Total_Payout_Achieved__c = 400;
        insert DI;
        
        Test.startTest();
        List<Map<String, String>> getMonths = JCBDealerIncentiveController.getMonthOptions();
        Test.stopTest();
        
    }
    
    @isTest
    static void saveIncentiveCalculationsTest(){
         //Create Product Category
        	DI_Product_Category__c pc = new DI_Product_Category__c();
        	pc.Name = 'BHL';
        	insert pc;
        
        //Create Account
        Account acc = new Account();
        acc.Name = 'Test Account'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured'; DI.Month__c = 'January'; DI.Year__c = 2023; DI.Total_Retail_Predicted__c = 1000; DI.Total_Retail_Achieved__c = 800;
        DI.Total_Payout_Predicted__c = 500; DI.Total_Payout_Achieved__c = 400;
        insert DI;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIpta = new DI_Product_Target_and_Achievement__c();
        DIpta.Dealer_Incentive__c = DI.Id; DIpta.Product_Category__c = pc.Id; DIpta.Total_Product_Predicted_Payout__c = 1000; DIpta.Total_Product_Actual_Payout__c = 950;
        DIpta.Total_Retail_Predicted__c = 6000; DIpta.Total_Retail_Achieved__c = 5000; DIpta.Total_Retail_Target__c = 5500; DIpta.Demo_Target__c = 300;
        insert DIpta;
        
        //Create DI SubCategory Target and Achievement
        DI_SubCategory_Target_and_Achievement__c subTAndA = new DI_SubCategory_Target_and_Achievement__c();
        subTAndA.DI_Product_Target_and_Achivement__c = DIpta.Id; subTAndA.Sub_Category__c = null;
        insert subTAndA;
        
        //TEsting
        Dealer_Incentive__c dealerIncentive = [SELECT Id FROM Dealer_Incentive__c LIMIT 1];
        List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> productInfos = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
        for (DI_Product_Target_and_Achievement__c pt : [SELECT Id, Product_Category__c, Total_Retail_Target__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c FROM DI_Product_Target_and_Achievement__c]) {
            JCBDealerIncentiveWrapper.ProductTargetAndAchievement productTargetInfo = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement();
            productTargetInfo.productTargetAndAchievementId = pt.Id;
            productTargetInfo.productId = pt.Product_Category__c;
            productTargetInfo.totalRetailTarget = pt.Total_Retail_Target__c;
            productTargetInfo.totalProductPredictedPayout = pt.Total_Product_Predicted_Payout__c;
            productTargetInfo.totalProductActualPayout = pt.Total_Product_Actual_Payout__c;
            productTargetInfo.totalRetailPredicted = pt.Total_Retail_Predicted__c;
            productTargetInfo.totalRetailAchieved = pt.Total_Retail_Achieved__c;
            List<JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement> wrapper = new List<JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement>();
            for(Integer i=0 ; i<2 ; i++){
                JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement staWrapper = new JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement();
            	staWrapper.subTargetAndAchievementId = null; staWrapper.subCategoryRetailPredicted = 500; staWrapper.subCategoryPredictedPayout = 400;
                
                wrapper.add(staWrapper);
            }
            List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements> kpiWraps = new List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements>();
            for(Integer i=0 ; i<2 ; i++){
                JCBDealerIncentiveWrapper.ProductKPIAndAchievements wrapper1 = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements();
                wrapper1.predictedKPIPayout = 600; wrapper1.predictedKPIPercentage = 500;
                
                JCBDealerIncentiveWrapper.ProductKPI kpiWrapper = new JCBDealerIncentiveWrapper.ProductKPI();
                kpiWrapper.productKPIId = null;
                wrapper1.productKPI = kpiWrapper;
                kpiWraps.add(wrapper1);
            }
            
            productTargetInfo.subTargetAndAchievement = wrapper;
            productTargetInfo.productKPIAndAchievements = kpiWraps;
            productInfos.add(productTargetInfo);
        }
       	
        JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper incentiveRec = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper();
        incentiveRec.recordId = dealerIncentive.Id;
        incentiveRec.totalPayoutPredicted = 500;
        incentiveRec.totalRetailPredicted = 600;
        
        Test.startTest();
        try{
            string saveMTD = JCBDealerIncentiveController.saveIncentiveCalculations(productInfos, incentiveRec);
            string deleteRecords = JCBDealerIncentiveController.deleteDealerIncRecords('January' , 2023);
			string saveMTD1 = JCBDealerIncentiveController.saveIncentiveCalculations(null, incentiveRec);
        }catch(Exception e){
            
        }
 		        
        Test.stopTest();
    }
    
    @isTest
    static void deleteDealerIncRecordsTest(){
        Test.startTest();
        try{
            string deleteRecords = JCBDealerIncentiveController.deleteDealerIncRecords('January' , 2023);
            string deleteRecords2 = JCBDealerIncentiveController.deleteDealerIncRecords('January' , null);
        }catch(Exception e){
            
        }
        Test.stopTest();
    }
}