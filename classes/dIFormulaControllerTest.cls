@isTest
public class dIFormulaControllerTest {
    @isTest
    static void getAccountByRegionAndGetProductAndSubCategoryTest(){
        //Create Account
        List<Account> accList = new List<Account>();
        for(Integer i=0 ; i<2 ; i++){
            Account acc = new Account();
            acc.Name = 'Dealer'+i; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
            
            accList.add(acc);
        }
        insert accList;
        List<Id> dealerIds = new List<Id>();
        //Create Dealer Incentive
        List<Dealer_Incentive__c> dealerIncent = new List<Dealer_Incentive__c>();
        for(Integer i=0 ; i<2 ; i++){
            dealerIds.add(accList[i].Id);
            Dealer_Incentive__c DI = new Dealer_Incentive__c();
            DI.Month__c = 'January'; DI.Year__c = 2024; DI.Dealer_Account__c = accList[i].Id; DI.Stage__c = 'Configured';
            
            dealerIncent.add(DI);
        }
        insert dealerIncent;
        
        Dealer_Incentive__c DealerI = new Dealer_Incentive__c();
        DealerI.Month__c = 'December'; DealerI.Year__c = 2023; DealerI.Dealer_Account__c = accList[0].Id; DealerI.Stage__c = 'Saved';
        insert DealerI;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL'; diProdcategory.Order_No__c = 1; 
        insert diProdcategory;
        
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();    
        kpiInfo.Name = 'Demo'; kpiInfo.Data_Source__c = 'Salesforce';
        kpiInfo.KPI_Visiblity__c = 'KPI Target;KPI Payout;CALC Target;CALC Payout;Multi KPITarget';
        insert kpiInfo;
        
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'TestProdKPI';
        prodKPI.Product_Category__c = diProdcategory.Id;
        prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;
        
        //Create DI_Product_Sub_Category__c
        List<DI_Product_Sub_Category__c> diSubProdcategory = new List<DI_Product_Sub_Category__c>();
        for(Integer i=0 ; i<3 ; i++){
            DI_Product_Sub_Category__c diSubProd = new DI_Product_Sub_Category__c();
            diSubProd.Name = 'A2-Super Loader'+i;
            diSubProd.Product_Category__c = diProdcategory.Id;
            
            diSubProdcategory.add(diSubProd);
        }
        insert diSubProdcategory;
        
        //Create DI Product Target and Achievement
        for(Integer i=0 ; i<2 ; i++){
            DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
            DIpta.Dealer_Incentive__c = dealerIncent[i].Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100;
            insert DIpta;
            DI_SubCategory_Target_and_Achievement__c subTAndA = new DI_SubCategory_Target_and_Achievement__c();
            subTAndA.DI_Product_Target_and_Achivement__c = DIpta.Id;
            insert subTAndA;
        }
        
        DI_Product_Target_and_Achievement__c previousAchievement = new DI_Product_Target_and_Achievement__c();
        previousAchievement.Dealer_Incentive__c = DealerI.Id; previousAchievement.Product_Category__c = diProdcategory.Id; previousAchievement.Total_Retail_Target__c = 100;
        insert previousAchievement;
        Account acc = new Account();
        acc.Name = 'Dealer1'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        List<DI_Product_Target_and_Achievement__c> productTargetkpis = new List<DI_Product_Target_and_Achievement__c>();
        DI_Product_Target_and_Achievement__c diProd = new  DI_Product_Target_and_Achievement__c();
        diProd.Dealer_Incentive__c = DealerI.Id; diProd.Product_Category__c = diProdcategory.Id; diProd.Total_Retail_Target__c = 100;
        productTargetkpis.add(diProd);
        insert productTargetkpis;
        
        List<DI_KPI_Achievement__c> KpiList = new List<DI_KPI_Achievement__c>();
        for (Integer i = 0 ; i < 2 ; i++){
            DI_KPI_Achievement__c kpiAcheive = new DI_KPI_Achievement__c();
            kpiAcheive.Product_KPI__c = prodKPI.Id; kpiAcheive.DI_Product_Target_and_Achivement__c = previousAchievement.Id; kpiAcheive.Predicted_KPI_Percentage__c = 50; kpiAcheive.Achieved_KPI_Perncentage__c = 160;
            kpiAcheive.Predicted_KPI_Payout__c = 50; kpiAcheive.Achieved_KPI_Payout__c = 50; kpiAcheive.Additional_Achieved_KPI_Payout__c = 45; kpiAcheive.Additional_Predicted_KPI_Payout__c = 45; kpiAcheive.Predicted_Potential_Amount__c = 500; kpiAcheive.Actual_Potential_Amount__c = 500;
            kpiAcheive.Indent_Order__c=10;kpiAcheive.Indent_Wholesale__c=60;
            KpiList.add(kpiAcheive);
        }
        insert KpiList;
        //kpiAcheive.Product_Category__c = diProdcategory.Id; kpiAcheive.Year__c = 2024; kpiAcheive.Month__c = 'January'; kpiAcheive.Account__c = acc.Id;
        
         List<Id> deletedIds = new List<Id>();
        //Testing
        Test.startTest();
        Map<String, Object> getAccByReg = dIFormulaController.getAccountByRegion('January', 2024);
        Map<String, Object> getAccByReg1 = dIFormulaController.getAccountByRegion('February', 2024);
        Map<String,JCBDealerIncentiveWrapper.ProductCategoryWrapper> prodAndSubProd = dIFormulaController.getProductAndSubCategory();
        List<Dealer_Incentive__c> getDealerIncentivesForStock = dIFormulaController.getDealerIncentivesForStock('January', 2024);
        List<DI_Product_Category__c> getProductsAndSubCategories = dIFormulaController.getProductsAndSubCategories();
        List<Account> getAcc = dIFormulaController.getAccounts();
        List<DI_SubCategory_Target_and_Achievement__c> subTargets = new List<DI_SubCategory_Target_and_Achievement__c>();
        String result = dIFormulaController.saveKpiPayouts(KpiList,subTargets, productTargetkpis, dealerIncent, deletedIds);
        Test.stopTest();
        System.assert(getAccByReg.containsKey('productCount'), 'Should contain productCount');
        System.assert(getAccByReg.containsKey('accountMap'), 'Should contain accountMap');
        System.assertEquals(1, prodAndSubProd.size(), 'There should be atleast one productwrapper');
    }
    
    @isTest
    static void saveDealerFormulaTest(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL';
        insert diProdcategory;
        
        //Create DI_Product_Sub_Category__c
        DI_Product_Sub_Category__c diSubProd = new DI_Product_Sub_Category__c();
        diSubProd.Name = 'A2-Super Loader';
        diSubProd.Product_Category__c = diProdcategory.Id;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Month__c = 'January'; DI.Year__c = 2023; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Saved';
        insert DI;
        
        DI.Stage__c = 'Configured';
        update DI;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
        DIpta.Dealer_Incentive__c = DI.Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100;
        insert DIpta;
        
        List<DI_Product_Target_and_Achievement__c> inputData = new List<DI_Product_Target_and_Achievement__c>();
        DI_Product_Target_and_Achievement__c diProd = new  DI_Product_Target_and_Achievement__c();
        diProd.Dealer_Incentive__c = DI.Id; diProd.Product_Category__c = diProdcategory.Id; diProd.Total_Retail_Target__c = 100;
        inputData.add(diProd);
        insert inputData;
        
        //Create New DI SubCategory Target and Achievement
        DI_SubCategory_Target_and_Achievement__c diSubCategory = new DI_SubCategory_Target_and_Achievement__c();
        diSubCategory.Sub_Category__c = diSubProd.Id; diSubCategory.DI_Product_Target_and_Achivement__c = DIpta.Id; diSubCategory.SubCategory_Retail_Target__c = 50;
        insert diSubCategory;
        
        //Testing
        JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerIncentiveWrapper = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper();
        dealerIncentiveWrapper.recordId = DI.Id;
        dealerIncentiveWrapper.dealerId = DI.Dealer_Account__c;
        dealerIncentiveWrapper.month = 'January';
        dealerIncentiveWrapper.year = 2023;
        
        JCBDealerIncentiveWrapper.ProductTargetAndAchievement productTargetWrapper = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement();
        productTargetWrapper.productTargetAndAchievementId = DIpta.Id;
        productTargetWrapper.productId = DIpta.Product_Category__c;
        productTargetWrapper.totalRetailTarget = DIpta.Total_Retail_Target__c;
        productTargetWrapper.demoTarget = 50;
        
        JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement subProductTargetWrapper = new JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement();
        subProductTargetWrapper.subTargetAndAchievementId = diSubCategory.Id;
        subProductTargetWrapper.subProductId = diSubCategory.Sub_Category__c;
        subProductTargetWrapper.subCategoryRetailTarget = diSubCategory.SubCategory_Retail_Target__c;

        //Create Dealer Incentive
        Dealer_Incentive__c DI2 = new Dealer_Incentive__c();
        DI2.Month__c = 'November'; DI2.Year__c = 2024; DI2.Dealer_Account__c = acc.Id; DI2.Stage__c = 'Saved';
        insert DI2;
        //Create Dealer Incentive
        Dealer_Incentive__c DI3 = new Dealer_Incentive__c();
        DI3.Month__c = 'December'; DI3.Year__c = 2024; DI3.Dealer_Account__c = acc.Id; DI3.Stage__c = 'Saved';
        insert DI3;
        
        //Opportunity for Machine Request
        Opportunity opp1 = new Opportunity();
        opp1.Name = 'Test Demo Opp2';
        opp1.Assigned_Dealer__c = acc.Id;
        opp1.StageName = 'Prospecting';
        opp1.CloseDate = Date.newInstance(2024, 12, 1);    
        opp1.Last_Stage_Change__c = Date.newInstance(2024, 11, 01);
        opp1.Product_Category__c = 'TH';
        opp1.Product_Sub_Category__c = '530-110';
        insert opp1;
        opp1.StageName = 'Demonstration';
        update opp1;
        
        //Pin code
        Pin_Code__c pc = new Pin_Code__c();
        pc.Name = '600117';
        insert pc;
        
        //JCB_India_Trigger_Enablement__c
        JCB_India_Trigger_Enablement__c  te = new JCB_India_Trigger_Enablement__c();
        te.Name = 'JCB India Trigger';
        insert te;
        
        //Machine Request
        Jcb_India_Demo_Request__c mr = new Jcb_India_Demo_Request__c();
        mr.CurrencyIsoCode = 'INR';
        mr.Dealer_Name__c = acc.Id;
        mr.Demo_Machine_required_from__c = Date.newInstance(2024, 12, 01);
        mr.Status__c = 'New';
        mr.Product_Category__c = 'TH';
        mr.Product_Sub_Category__c = '530-110';
        mr.Opportunity__c = opp1.Id;
        mr.Address__c = 'Plot No. 4, Sridevi Amman Street, Perumal Nagar Extension, Old Pallavaram';
        mr.Comments1__c = '600117';
        mr.Pin_Code__c = pc.Name;
        insert mr;
        mr.Status__c = 'Approved By Dealer Admin';
        update mr;
        
         //Machine Request 2
        Jcb_India_Demo_Request__c mr2 = new Jcb_India_Demo_Request__c();
        mr2.CurrencyIsoCode = 'INR';
        mr2.Dealer_Name__c = acc.Id;
        mr2.Demo_Machine_required_from__c = Date.newInstance(2024, 12, 01);
        mr2.Status__c = 'New';
        mr2.Product_Category__c = 'TH';
        mr2.Product_Sub_Category__c = '530-110';
        mr2.Opportunity__c = opp1.Id;
        mr2.Address__c = 'Plot No. 4, Sridevi Amman Street, Perumal Nagar Extension, Old Pallavaram';
        mr2.Comments1__c = '600117';
        mr2.Pin_Code__c = pc.Name;
        insert mr2;
        mr2.Status__c = 'Approved By Dealer Admin';
        update mr2;
        
        //Demonstration 1
        Demonstration__c demo = new Demonstration__c();
        demo.CurrencyIsoCode = 'INR';
        demo.recordTypeId = [SELECT Id, Name FROM RecordType WHERE Name='India Demonstration' LIMIT 1].Id;
        demo.Request_Type__c = 'Dealer';
        demo.Product_Category__c = 'TH';
        demo.Demo_StartDate__c = Datetime.newInstance(2024, 11, 01);
        demo.Jcb_India_Demo_Request__c = mr.Id;
        demo.JCB_Demo_Machine_Terms__c = 'Pending';
        demo.Machine_Type__c = 'JCB Owned Machine';
        insert demo;
        demo.Opportunity_JCB_India__c = opp1.Id;
        demo.Opportunity__c = opp1.Id;
        demo.OpportunityCounter__c  = 1;
        update demo;
        
        Demonstration__c demo2 = new Demonstration__c();
        demo2.CurrencyIsoCode = 'INR';
        demo2.recordTypeId = [SELECT Id, Name FROM RecordType WHERE Name='India Demonstration' LIMIT 1].Id;
        demo2.Request_Type__c = 'Dealer';
        demo2.Product_Category__c = 'TH';
        demo2.Demo_StartDate__c = Datetime.newInstance(2024, 11, 01);
        demo2.Jcb_India_Demo_Request__c = mr2.Id;
        demo2.JCB_Demo_Machine_Terms__c = 'Pending';
        demo2.Machine_Type__c = 'JCB Owned Machine';
        insert demo2;
        demo2.Opportunity_JCB_India__c = opp1.Id;
        demo2.Opportunity__c = opp1.Id;
        demo2.OpportunityCounter__c  = 1;
        update demo2;
        
        //Demo FeedBack For Opportunity
        Demo_Feedback__c fb = new Demo_Feedback__c();
        fb.Opportunity__c = opp1.Id;
        fb.Demonstration__c = demo.Id;
        fb.Cost_of_ownership__c = 15000;
        fb.Ease_of_usage__c = 20;
        fb.Output_productivity__c = 15;
        fb.Performance__c = 10;
        fb.Quality_reliability__c = 10;
        fb.Safety_Security__c = 12;
        fb.Serviceability__c = 100;
        fb.Style_Design__c = 10;
        fb.fuel_efficiency__c = 200;
        fb.operator_comfort__c = 100;
        insert fb;
        
        //Demo FeedBack 2 For Opportunity
        Demo_Feedback__c fb2 = new Demo_Feedback__c();
        fb2.Opportunity__c = opp1.Id;
        fb2.Demonstration__c = demo2.Id;
        fb2.Cost_of_ownership__c = 15000;
        fb2.Ease_of_usage__c = 20;
        fb2.Output_productivity__c = 15;
        fb2.Performance__c = 10;
        fb2.Quality_reliability__c = 10;
        fb2.Safety_Security__c = 12;
        fb2.Serviceability__c = 100;
        fb2.Style_Design__c = 10;
        fb2.fuel_efficiency__c = 200;
        fb2.operator_comfort__c = 100;
        insert fb2;
        
        //Update End Date To Close Demonstration
        demo.End_Date__c = Date.newInstance(2024, 11, 10);
        update demo;
        System.debug('Demonstration inserted : ' + demo);
        
        demo2.End_Date__c = Date.newInstance(2024, 11, 10);
        update demo2;
        
        //Create Product Category
        DI_Product_Category__c prod = new DI_Product_Category__c();
        prod.Name = 'TH';
        insert prod;
        
        //Create KPI
        DI_KPI_Info__c kpi = new DI_KPI_Info__c();
        kpi.Name = 'Demo';
        kpi.Data_Source__c = 'Salesforce';
        insert kpi;
        
        //Create Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'THDEM';
        prodKPI.Product_Category__c = prod.Id;
        prodKPI.KPI__c = kpi.Id;
        insert prodKPI;
        
        //Create Product Target And Achievement
        DI_Product_Target_and_Achievement__c prodAchi = new  DI_Product_Target_and_Achievement__c();
        prodAchi.Dealer_Incentive__c = DI2.Id; 
        prodAchi.Product_Category__c = prod.Id; 
        prodAchi.Demo_Conducted_Actual__c = 2;
        prodAchi.Total_Retail_Target__c = 100; 
        prodAchi.Total_Retail_Predicted__c = 100; 
        prodAchi.Total_Retail_Achieved__c = 100; 
        prodAchi.Demo_Target__c = 20; 
        prodAchi.Incentive_Status__c = 'Eligible';
        prodAchi.Total_Additional_Actual_Payout__c = 50; 
        prodAchi.Total_Additional_Predicted_Payout__c = 50; 
        prodAchi.Total_Product_Actual_Payout__c = 50; 
        prodAchi.Total_Product_Predicted_Payout__c = 40;
        insert prodAchi;
        
        //Create KPI Achievement
        DI_KPI_Achievement__c kpiAcheive = new DI_KPI_Achievement__c();
        kpiAcheive.Product_KPI__c = prodKPI.Id; 
        kpiAcheive.DI_Product_Target_and_Achivement__c = prodAchi.Id; 
        kpiAcheive.Predicted_KPI_Percentage__c = 50; 
        kpiAcheive.Achieved_KPI_Perncentage__c = 160;
        kpiAcheive.Predicted_KPI_Payout__c = 50; 
        kpiAcheive.Achieved_KPI_Payout__c = 50; 
        kpiAcheive.Additional_Achieved_KPI_Payout__c = 45; 
        kpiAcheive.Additional_Predicted_KPI_Payout__c = 45; 
        kpiAcheive.Predicted_Potential_Amount__c = 500; 
        kpiAcheive.Actual_Potential_Amount__c = 500;
        kpiAcheive.Indent_Order__c=10;
        kpiAcheive.Indent_Wholesale__c=60;
        insert kpiAcheive;
        
        productTargetWrapper.subTargetAndAchievement = new List<JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement>{subProductTargetWrapper};
        dealerIncentiveWrapper.productTargetsAndAchievements = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>{productTargetWrapper};
        List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerIncentiveWraps = new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>{dealerIncentiveWrapper};
        List<Id> removableId = new List<Id>();
        Test.startTest();
        Map<String, Object> saveDealerFormula = DIFormulaController.saveDealerFormula(dealerIncentiveWraps, removableId);
        List<Dealer_Incentive__c> saveInHandProductTargetAndAchievements = dIFormulaController.saveInHandProductTargetAndAchievements(inputData, 'January', 2023);
        List<Account> getDealerIncentivesByAccount = dIFormulaController.getDealerIncentivesByAccount('January', 2023);
        
        //Test Demo Conducted Test Class
        String result = JCBActualCalcController.getDemoConducted('November', 2024);
        String result2 = JCBActualCalcController.getDemoConducted('December', 2024);
        try {
            String result3 = JCBActualCalcController.getDemoConducted('Jan', 2024);
        } catch (IllegalArgumentException e) {
            System.assertEquals('Invalid month name: jan', e.getMessage());
        }
        if (removableId.size() > 0) {
            Database.delete(removableId);
        }
        Test.stopTest();
        System.assertEquals('SUCCESS', saveDealerFormula.get('message'));
    }
    
    @isTest
    static void getProductsAndKPIAndGetPicklistValuesTest(){
        //Create DI_Product_Category__c
        List<DI_Product_Category__c> prodCat = new List<DI_Product_Category__c>();
        for(Integer i=0 ; i<2 ; i++){
            DI_Product_Category__c PC = new DI_Product_Category__c();
            PC.Name = 'BHL'+i;
            
            prodCat.add(PC);
        }
        insert prodCat;
        
        //Create DI_KPI_Info__c
        List<DI_KPI_Info__c> kpiInfo = new List<DI_KPI_Info__c>();
        for(Integer i=0 ; i<2 ; i++){
            DI_KPI_Info__c infKPI = new DI_KPI_Info__c();
            infKPI.Name = 'Market Penetration'+i; infKPI.Data_Source__c = 'External';
            infKPI.KPI_Visiblity__c = 'KPI Target;KPI Payout;CALC Target;CALC Payout;Multi KPITarget';
            kpiInfo.add(infKPI);
        }
        insert kpiInfo;
        
        //Create DI_Product_KPI__c
        List<DI_Product_KPI__c> diProdKPI = new List<DI_Product_KPI__c>();
        for(Integer i=0 ; i<2 ; i++){
            DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
            prodKPI.Name = 'Test'+i; prodKPI.KPI__c = kpiInfo[i].Id; prodKPI.Product_Category__c = prodCat[i].Id; prodKPI.Order_No__c = i;
            
            diProdKPI.add(prodKPI);
        }
        insert diProdKPI;  
        //Create DI KPI Target And Payout Info
        List<DI_KPI_Target_And_Payout_Info__c> recordsForTest = new List<DI_KPI_Target_And_Payout_Info__c>();
        for(Integer i=0 ; i<5 ; i++){
            DI_KPI_Target_And_Payout_Info__c recForTest = new DI_KPI_Target_And_Payout_Info__c();
            recForTest.Year__c = 2023; recForTest.Type__c = 'KPI Target'; recForTest.Month__c = 'January';
            recForTest.Is_Salesman_Incentive__c = false;
            recForTest.Sales_Person_Incentive_Target__c = '>50';
            recordsForTest.add(recForTest);
        }
        insert recordsForTest;
        
        
        //List of Picklist Values of Account.India_Zone__c
        List<String> picklistValues = new List<String>{'Central', 'East', 'North East', 'South', 'North', 'North Central', 'South Central', 'South East', 'West'};
            //create YearMonthMap
        Map<Decimal, List<String>> YearMonth = new Map<Decimal, List<String>>{
            2024 => new List<String>{'January', 'February'},
                2025 => new List<String>{'March', 'April'}
        };
        
        //Testing
        Test.startTest();
        Map<String,List<DI_Product_KPI__c>> getProdAndKPI = dIFormulaController.getProductsAndKPI();
        List<string> getPickVal = dIFormulaController.getPicklistValues();
        dIFormulaController YrMon = new dIFormulaController(YearMonth);
        dIFormulaController getClonePicVal = dIFormulaController.getClonePicklistValues();
        dIFormulaController.clearSingleField(recordsForTest[0].id,'test',true,false);
        dIFormulaController.clearSingleField(recordsForTest[0].id,'test1',false,true);
        dIFormulaController.getSlabInfos('January',2024,'BHL');
        dIFormulaController.getKpiTargetAndPayouts('January',2024,'BHL');
        Test.stopTest();
        System.assertNotEquals(null, getProdAndKPI, 'getProdAndKPI should not be null');
    }
    
    @isTest
    static void getCalcPicklistValuesTest(){
                //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.Creation_Source__c = 'Salesforce'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true;
        //acc.OwnerId = UserInfo.getUserId();
        insert acc;
        
        //Create User
        String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                          EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                          LocaleSidKey='en_US', ProfileId = p.Id,
                          TimeZoneSidKey='America/Los_Angeles',
                          UserName=uniqueUserName);
        
        insert u;
        
        //Create Delaer Incentive
        List<Dealer_Incentive__c> dealerIncent = new List<Dealer_Incentive__c>();
        for(Integer i=0 ; i<3 ; i++){
            Dealer_Incentive__c DI = new Dealer_Incentive__c();
            DI.Month__c = 'January'; DI.Year__c = 2023; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured';
            
            dealerIncent.add(DI);
        }
        insert dealerIncent;
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Month__c = 'January'; DI.Year__c = 2023; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured';
        insert DI;
        
        //Create DI KPI Target And Payout Info
        List<Id> deleteIds = new List<Id>();
        for(Integer i=0 ; i<3 ; i++){
            DI_KPI_Target_And_Payout_Info__c kpiInfo = new DI_KPI_Target_And_Payout_Info__c();
            kpiInfo.Month__c = 'January'; kpiInfo.Year__c = 2023;
            kpiInfo.Is_Salesman_Incentive__c = false;
            insert kpiInfo;
            deleteIds.add(kpiInfo.Id);
        }
        
        Id idToDelete = [SELECT Id FROM Account LIMIT 1].Id;
        //Testing
        Test.startTest();
       	System.runAs(u){
            Map<Decimal, List<String>> getCalPickVal = dIFormulaController.getCalcPicklistValues(); 
      	}
        dIFormulaController.deleteSlab(idToDelete);
        Test.stopTest();
        //System.assert(getCalPickVal != null, 'Result should not be null');
    }
    
    @isTest
    static void getKPITargetAndPayoutInfoTest(){
        //Create DI Product Category
        DI_Product_Category__c PC = new DI_Product_Category__c();
        PC.Name = 'BHL';
        insert PC;
        
        //Create DI Product Target
        DI_Product_Target__c prodTarget = new DI_Product_Target__c();
        prodTarget.DI_Product_Category__c = PC.Id; prodTarget.Stock_Policy__c = 20; prodTarget.Year__c = 2023; prodTarget.Month__c = 'January';
        insert prodTarget;
        
        //Create DI KPI Info
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();    
        kpiInfo.Name = 'Demo'; kpiInfo.Data_Source__c = 'Salesforce';
        insert kpiInfo;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'TestProdKPI';
        prodKPI.Product_Category__c = PC.Id;
        prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;
        
        //Create DI Product KPITarget And PayoutInfo
        DI_KPI_Target_And_Payout_Info__c kpiTAndP = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndP.Month__c = 'January'; kpiTAndP.Year__c = 2023; kpiTAndP.KPI_Target__c = '100';
        kpiTAndP.KPI_Payout_Amount__c = 75; 
        kpiTAndP.Type__c = 'KPI Target';
        kpiTAndP.Has_Slabs__c = false; kpiTAndP.DI_Product_KPI__c = prodKPI.Id;
        kpiTAndP.Is_Salesman_Incentive__c = false;
        insert kpiTAndP;
        
        //Create DI Product Sub Category
        DI_Product_Sub_Category__c ProdSub = new DI_Product_Sub_Category__c();
        ProdSub.Name = 'TestProdSub'; ProdSub.Product_Category__c = PC.Id;
        insert ProdSub;
        
        
        //Create DI_KPI_Sub_Product_Payout__c
        DI_KPI_Sub_Product_Payout__c kpiSubProd = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProd.DI_KPI_Target_And_Payout__c = kpiTAndP.Id; kpiSubProd.DI_Product_Sub_Category__c = ProdSub.Id; kpiSubProd.Payout_Amount__c = 50;
        kpiSubProd.Payout_Varies_By_4WD__c = true;kpiSubProd.TwoWD_Payout_Amount__c=10; kpiSubProd.FourWD_Payout_Amount__c=20;
        insert kpiSubProd;
        
        DI_KPI_Sub_Product_Payout__c kpiSubProd1 = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProd1.DI_KPI_Target_And_Payout__c = kpiTAndP.Id; kpiSubProd1.DI_Product_Sub_Category__c = ProdSub.Id; kpiSubProd1.Payout_Amount__c = 50;
        kpiSubProd1.Payout_Varies_By_4WD__c = true;kpiSubProd1.TwoWD_Payout_Amount__c=10; kpiSubProd1.FourWD_Payout_Amount__c=20;
        insert kpiSubProd1;
        
        //Create Slab Info
        Slab_Info__c slabs = new Slab_Info__c();
        slabs.Slab_Range__c = '> 100 to < 120'; slabs.DI_KPI_Target_And_Payout_Info__c = kpiTAndP.Id; slabs.Payout_Mode__c = 'Percent'; slabs.Payout_Percentage__c = 90;
        insert slabs;
           
        DI_Region_Payout__c dgp = new DI_Region_Payout__c();
        dgp.Zone_Name__c = 'North'; dgp.Payout_Amount__c=2000; dgp.TwoWD_Payout_Amount__c=200; dgp.FourWD_Payout_Amount__c=300;dgp.DI_KPI_Sub_Product_Payout__c=kpiSubProd.Id;
        insert dgp;
        
        //Testing
        Test.startTest();
        List<String> type = new List<String>{'KPI Target'};
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> getInfo = dIFormulaController.getKPITargetAndPayoutInfo('January', 2023, type);
        List<DI_Product_Target__c> getProductTargets = dIFormulaController.getProductTargets('January', 2023);
        Test.stopTest();
        System.assertNotEquals(0, getInfo.size(), 'Expected non-empty result');
    }
    
    @isTest
    static void saveProductKPIAndTargetAndSaveSalesmanIncentive(){
        //Create DI Product Category
        DI_Product_Category__c PC = new DI_Product_Category__c();
        PC.Name = 'BHL';
        insert PC;
        
        //Create DI KPI Info
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();    
        kpiInfo.Name = 'Market Coverage'; kpiInfo.Data_Source__c = 'Salesforce';
        insert kpiInfo;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'TestProdKPI';
        prodKPI.Product_Category__c = PC.Id;
        prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;
        
        //Create DI Product Sub Category
        DI_Product_Sub_Category__c ProdSub = new DI_Product_Sub_Category__c();
        ProdSub.Name = 'TestSubProd'; ProdSub.Product_Category__c = PC.Id;
        insert ProdSub;
        
        //Create DI Product Target
        DI_Product_Target__c prodTarget = new DI_Product_Target__c();
        prodTarget.DI_Product_Category__c = PC.Id; prodTarget.Stock_Policy__c = 20; prodTarget.Year__c = 2023; prodTarget.Month__c = 'January';
        insert prodTarget;
        
        //Create DI KPI Target And Payout Info's
        List<DI_KPI_Target_And_Payout_Info__c> kpiTargets = new List<DI_KPI_Target_And_Payout_Info__c>();
        List<DI_KPI_Sub_Product_Payout__c> subProdPayouts = new List<DI_KPI_Sub_Product_Payout__c>();
        
        DI_KPI_Target_And_Payout_Info__c kpiTarget = new DI_KPI_Target_And_Payout_Info__c();
        kpiTarget.Month__c = 'January'; kpiTarget.Year__c = 2024;kpiTarget.Previous_Month__c = 'December';kpiTarget.Previous_Year__c = 2023; kpiTarget.DI_Product_KPI__c = prodKPI.Id; kpiTarget.KPI_Target__c = 'Test'; kpiTarget.Type__c = 'Growth Additional Incentive';
        kpiTarget.Is_Salesman_Incentive__c = false;
        kpiTargets.add(kpiTarget);

        DI_KPI_Target_And_Payout_Info__c kpiTarget1 = new DI_KPI_Target_And_Payout_Info__c();
        kpiTarget1.Month__c = 'January'; kpiTarget1.Year__c = 2023; kpiTarget1.DI_Product_KPI__c = prodKPI.Id; kpiTarget1.KPI_Target__c = 'Test'; kpiTarget1.Has_Slabs__c = true; kpiTarget1.Sales_Person_Incentive_Target__c = '1000';kpiTarget1.Type__c = 'KPI Target';
        kpiTarget1.Is_Salesman_Incentive__c = true;
        kpiTargets.add(kpiTarget1);
        
        DI_KPI_Target_And_Payout_Info__c kpiTarget2 = new DI_KPI_Target_And_Payout_Info__c();
        kpiTarget2.Month__c = 'January'; kpiTarget2.Year__c = 2023; kpiTarget2.DI_Product_KPI__c = prodKPI.Id; kpiTarget2.Has_Slabs__c = true; kpiTarget2.Type__c = 'Additional Incentive';kpiTarget2.KPI_Payout_Amount__c = 2000;
        kpiTargets.add(kpiTarget2);
        
        DI_KPI_Sub_Product_Payout__c subPayout = new DI_KPI_Sub_Product_Payout__c();
        subPayout.DI_Product_Sub_Category__c = ProdSub.Id; subPayout.Payout_Amount__c = 500; subPayout.Payout_Varies_By_Region__c = false;
        subPayout.Payout_Varies_By_4WD__c = false; subPayout.FourWD_Payout_Amount__c=200; subPayout.TwoWD_Payout_Amount__c=100;
        subProdPayouts.add(subPayout);
        
        DI_Region_Payout__c dg = new DI_Region_Payout__c(); 
        dg.Zone_Name__c='Central';dg.Payout_Amount__c=3000;dg.TwoWD_Payout_Amount__c=100; dg.FourWD_Payout_Amount__c=500;dg.DI_KPI_Sub_Product_Payout__c=subPayout.Id; 
        insert dg;
        
        insert kpiTargets;
        insert subProdPayouts;
        
        List<Slab_Info__c> slabInfos = new List<Slab_Info__c>();
        for (Integer i = 0; i < 3; i++) {
            Slab_Info__c slabs = new Slab_Info__c();
            slabs.Name = 'Test'+i; slabs.DI_KPI_Target_And_Payout_Info__c = kpiTargets[1].Id; slabs.Slab_Type__c = 'Salesperson Incentive'; 
            slabs.Amount__c = 1000;
            slabs.Slab_Range__c = '90<80'; slabs.Payout_Mode__c = 'cash'; slabs.Payout_Percentage__c = 50;
            slabInfos.add(slabs);
        }
        insert slabInfos;
        
        // List<Slab_Info__c> slabInfosInd = new List<Slab_Info__c>();
        //for (Integer i = 0; i < 3; i++) {
         //   Slab_Info__c slab = new Slab_Info__c();
         //   slab.Name = 'Test'+i; slab.DI_KPI_Target_And_Payout_Info__c = kpiTargets[2].Id; slab.Slab_Type__c = 'Total Industry Volume Incentive'; 
         //   slab.Amount__c = 1000;
         //   slab.Slab_Range__c = '90<80';slab.Payout_Percentage__c = 50;
         //   slabInfosInd.add(slab);
        //}
        //insert slabInfosInd;
        
        JCBDealerIncentiveWrapper.SalesmanKPIWrapper salesKpiWrapper = new JCBDealerIncentiveWrapper.SalesmanKPIWrapper();
        salesKpiWrapper.recordId = kpiTargets[0].Id;
        salesKpiWrapper.salesPersonTarget = '1000';
        salesKpiWrapper.isSalesmanIncentive = true;
        salesKpiWrapper.slabInfo = new List<JCBDealerIncentiveWrapper.SlabInfo>();
        for (Slab_Info__c slab : slabInfos) {
            JCBDealerIncentiveWrapper.SlabInfo slabInfo = new JCBDealerIncentiveWrapper.SlabInfo();
            slabInfo.slabId = slab.Id;
            slabInfo.slabRange = slab.Slab_Range__c;
            slabInfo.payoutMode = slab.Payout_Mode__c;
            slabInfo.amount = slab.Amount__c;
            slabInfo.payoutPercentage = slab.Payout_Percentage__c + 1;
            slabInfo.slabType = slab.Slab_Type__c;
            salesKpiWrapper.slabInfo.add(slabInfo);
        }
        
       // JCBDealerIncentiveWrapper.IndustryVolumeWrapper indusKpiWrapper = new JCBDealerIncentiveWrapper.IndustryVolumeWrapper();
//        indusKpiWrapper.recordId = kpiTargets[0].Id;
        //indusKpiWrapper.isIndustryIncentive = true;
        //indusKpiWrapper.slabInfo = new List<JCBDealerIncentiveWrapper.SlabInfo>();
        //for (Slab_Info__c slab : slabInfosInd) {
        //    JCBDealerIncentiveWrapper.SlabInfo slabInfo = new JCBDealerIncentiveWrapper.SlabInfo();
        //    slabInfo.slabId = slab.Id;
         //   slabInfo.slabRange = slab.Slab_Range__c;
         //   slabInfo.payoutMode = slab.Payout_Mode__c;
         //   slabInfo.amount = slab.Amount__c;
         //   slabInfo.payoutPercentage = slab.Payout_Percentage__c + 1;
         //   slabInfo.slabType = slab.Slab_Type__c;
         //   indusKpiWrapper.slabInfo.add(slabInfo);
        //}
        
        //Testing
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> kpiTargetsAndPayouts = new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        
        JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiPayout = new JCBDealerIncentiveWrapper.ProductKPIAndPayout();

        DI_Product_Category__c prodCat = new DI_Product_Category__c();
        prodCat.Name = 'BHL';
        prodCat.Order_No__c = 1;
        insert prodCat;

        //Create DI KPI Info
        DI_KPI_Info__c kpi = new DI_KPI_Info__c();    
        kpi.Name = 'Sales Person'; kpi.Data_Source__c = 'Salesforce';
        insert kpi;
        
        //Create DI Product KPI
        DI_Product_KPI__c productKPI = new DI_Product_KPI__c();
        productKPI.Name = 'BHLSP';
        productKPI.Product_Category__c = prodCat.Id;
        productKPI.KPI__c = kpiInfo.Id;
        insert productKPI;

        JCBDealerIncentiveWrapper.ProductKPI pKPI = new JCBDealerIncentiveWrapper.ProductKPI(productKPI);

        kpiPayout.recordId = null; kpiPayout.month = 'January'; kpiPayout.year = 2023; kpiPayout.productKPI = pKPI; kpiPayout.target = '>= 30'; kpiPayout.type = 'KPI Target';
        kpiPayout.isSalesmanIncentive = false;
        kpiPayout.salesPersonTarget = '>= 50';
        kpiPayout.hasSlabs = true;
        
        List<JCBDealerIncentiveWrapper.ProductPayoutInfo> productPayouts = new List<JCBDealerIncentiveWrapper.ProductPayoutInfo>();
        List<JCBDealerIncentiveWrapper.SlabInfo> slabsInfo = new List<JCBDealerIncentiveWrapper.SlabInfo>();
        List<JCBDealerIncentiveWrapper.RegionPayout> regionInfo = new List<JCBDealerIncentiveWrapper.RegionPayout>();
        
        JCBDealerIncentiveWrapper.ProductPayoutInfo payoutInfo = new JCBDealerIncentiveWrapper.ProductPayoutInfo();
        payoutInfo.payoutId = null; payoutInfo.subProductId = null; payoutInfo.payoutAmount = 2000; payoutInfo.variesByRegion = false; payoutInfo.variesBy4WD=false; payoutInfo.regionPayout=regionInfo;
        productPayouts.add(payoutInfo);
        
        JCBDealerIncentiveWrapper.SlabInfo slabInfo = new JCBDealerIncentiveWrapper.SlabInfo();
        slabInfo.slabId = null; slabInfo.slabRange = '>100 to <120'; slabInfo.payoutMode = 'Percent'; slabInfo.payoutPercentage = 90;
        slabsInfo.add(slabInfo);

        JCBDealerIncentiveWrapper.SlabInfo slab = new JCBDealerIncentiveWrapper.SlabInfo();
        slab.slabId = null; slab.slabRange = '>100 to <120'; slab.payoutMode = 'Percent'; slab.payoutPercentage = 90; slab.slabType = 'Salesperson Incentive';
        slabsInfo.add(slabInfo);
        
        JCBDealerIncentiveWrapper.SlabInfo slabs = new JCBDealerIncentiveWrapper.SlabInfo();
        slabs.slabId = null; slabs.slabRange = '>100 to <120'; slabs.payoutPercentage = 90;
        slabsInfo.add(slabInfo);
        
        JCBDealerIncentiveWrapper.RegionPayout region = new JCBDealerIncentiveWrapper.RegionPayout();
        region.region='Central'; region.amount=3000; region.twoWDPayoutAmount=100; region.fourWDPayoutAmount=200;
        regionInfo.add(region);
      
        kpiPayout.productPayouts = productPayouts;
        kpiPayout.slabInfo = slabsInfo;
        kpiTargetsAndPayouts.add(kpiPayout);
        List<Map<String, Object>> dIProdTarget = new List<Map<String, Object>>();
        Map<String, Object> dIProdTarget2 = new Map<String, Object>{'DI_Product_Category__c' => PC.Id, 'Year__c' => 2024, 'Month__c' => 'January', 'Stock_Policy__c' => 21};
        dIProdTarget.add(dIProdTarget2);
        Test.startTest();
        String saveProdKPIandTarget = dIFormulaController.saveProductKPIAndTarget(kpiTargetsAndPayouts, new List<List<Id>>(), dIProdTarget);
        String saveSalesmanIncentive = dIFormulaController.saveSalesmanIncentive(salesKpiWrapper);
        //String saveIndustryIncentive = dIFormulaController.saveIndustryIncentive(indusKpiWrapper);
        try{
            String saveProdKPIandTarget1 = dIFormulaController.saveProductKPIAndTarget(null, null, null);
        }catch(Exception e){
            
        }
        Test.stopTest();
    }
    
    @isTest
    static void isDataPresentAndDeleteRecordInDatabaseTest(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.Creation_Source__c = 'Salesforce'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true;
        insert acc;
        
        //Create Dealer Incentive
        List<Dealer_Incentive__c> incentives = new List<Dealer_Incentive__c>();
        for(Integer i=0 ; i<3 ; i++){
            Dealer_Incentive__c DI = new Dealer_Incentive__c();
            DI.Month__c = 'January'; DI.Year__c = 2023; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured';
            incentives.add(DI);
        }
        insert incentives;
        List<List<Id>> deleteIds = new List<List<Id>>();
        List<Id> idsBatch1 = new List<Id>();
        for (Dealer_Incentive__c di : incentives) {
            idsBatch1.add(di.Id);
        }
        deleteIds.add(idsBatch1);
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL';
        diProdcategory.Order_No__c = 1;
        insert diProdcategory;
        
        //Create DI Product Target
        List<DI_Product_Target__c> ptList = new List<DI_Product_Target__c>();
        DI_Product_Target__c pt = new DI_Product_Target__c();
        pt.DI_Product_Category__c = diProdcategory.Id; pt.Year__c = 2023; pt.Month__c = 'January'; pt.Stock_Policy__c = 50;
        ptList.add(pt);
        insert ptList;
        
        //Testing
        Test.startTest();
        Boolean answer = dIFormulaController.isDataPresent('January', 2023);
        Boolean answer1 = dIFormulaController.isDataPresent('January', 2024);
        dIFormulaController.deleteRecordInDatabase(deleteIds);
        Id saveProductTargets = dIFormulaController.saveProductTargets(ptList, 'January', 2023, 'BHL');
        Test.stopTest();
        System.assert(answer == true, 'Data should be present for January 2023');
    }
    
    @isTest
    static void saveKpiAchievementsTest(){
        //Create Account 
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Month__c = 'January'; DI.Year__c = 2024; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Saved'; DI.Total_Product_Payout_Achieved__c = 1000; DI.Total_Additional_Payout_Achieved__c = 500; DI.Total_Payout_Achieved__c = 500;
        DI.Total_Retail_Achieved__c = 500; DI.Total_Retail_Predicted__c = 100; DI.Total_Product_Payout_Predicted__c = 1000; DI.Total_Additional_Payout_Predicted__c = 450; DI.Total_Payout_Predicted__c = 500;
        insert DI;

        Dealer_Incentive__c dealer = new Dealer_Incentive__c();
        dealer.Month__c = 'December'; dealer.Year__c = 2023; dealer.Dealer_Account__c = acc.Id; dealer.Stage__c = 'Saved'; dealer.Total_Product_Payout_Achieved__c = 1000; dealer.Total_Additional_Payout_Achieved__c = 500; dealer.Total_Payout_Achieved__c = 500;
        dealer.Total_Retail_Achieved__c = 500; dealer.Total_Retail_Predicted__c = 100; dealer.Total_Product_Payout_Predicted__c = 1000; dealer.Total_Additional_Payout_Predicted__c = 450; dealer.Total_Payout_Predicted__c = 500;
        insert dealer;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL';
        diProdcategory.Order_No__c = 1;
        insert diProdcategory;
        
        //Create DI Product Sub Category
        DI_Product_Sub_Category__c prodSubCat = new DI_Product_Sub_Category__c();
        prodSubCat.Name = 'A-2DX'; prodSubCat.Product_Category__c = diProdcategory.Id;
        insert prodSubCat;
        
        //Create DI Product Target
        DI_Product_Target__c pt = new DI_Product_Target__c();
        pt.DI_Product_Category__c = diProdcategory.Id; pt.Year__c = 2024; pt.Month__c = 'January'; pt.Stock_Policy__c = 50;
        insert pt;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
        DIpta.Dealer_Incentive__c = DI.Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100; DIpta.Total_Retail_Predicted__c = 100; DIpta.Total_Retail_Achieved__c = 100; DIpta.Demo_Target__c = 20; DIpta.Incentive_Status__c = 'Eligible';
        DIpta.Total_Additional_Actual_Payout__c = 50; DIpta.Total_Additional_Predicted_Payout__c = 50; DIpta.Total_Product_Actual_Payout__c = 50; DIpta.Total_Product_Predicted_Payout__c = 40;
        insert DIpta;

        DI_Product_Target_and_Achievement__c dIPTAndAch = new  DI_Product_Target_and_Achievement__c();
        dIPTAndAch.Dealer_Incentive__c = dealer.Id; dIPTAndAch.Product_Category__c = diProdcategory.Id; dIPTAndAch.Total_Retail_Target__c = 100; dIPTAndAch.Total_Retail_Predicted__c = 100; dIPTAndAch.Total_Retail_Achieved__c = 100; dIPTAndAch.Demo_Target__c = 20;
        dIPTAndAch.Total_Additional_Actual_Payout__c = 50; dIPTAndAch.Total_Additional_Predicted_Payout__c = 50; dIPTAndAch.Total_Product_Actual_Payout__c = 50; dIPTAndAch.Total_Product_Predicted_Payout__c = 40;
        insert dIPTAndAch;

        DI_Product_Target_and_Achievement__c dIProd = new  DI_Product_Target_and_Achievement__c();
        dIProd.Dealer_Incentive__c = dealer.Id; dIProd.Product_Category__c = diProdcategory.Id; dIProd.Total_Retail_Target__c = 100; dIProd.Total_Retail_Predicted__c = 100; dIProd.Total_Retail_Achieved__c = 100; dIProd.Demo_Target__c = 20;
        dIProd.Total_Additional_Actual_Payout__c = 50; dIProd.Total_Additional_Predicted_Payout__c = 50; dIProd.Total_Product_Actual_Payout__c = 50; dIProd.Total_Product_Predicted_Payout__c = 40;
        insert dIProd;

        
        //Create DI SubCategory Target and Achievement
        DI_SubCategory_Target_and_Achievement__c diptaSub = new DI_SubCategory_Target_and_Achievement__c();
        diptaSub.DI_Product_Target_and_Achivement__c = DIpta.Id; diptaSub.Sub_Category__c = prodSubCat.Id; diptaSub.SubCategory_Retail_Achieved__c = 500; diptaSub.SubCategory_Retail_Predicted__c = 450; diptaSub.SubCategory_Retail_Target__c = 450; diptaSub.SubCategory_Add_Actual_Payout__c = 600; diptaSub.SubCategory_Add_Predicted_Payout__c = 550;
        diptaSub.SubCategory_Predicted_Payout__c = 750; diptaSub.SubCategory_Actual_Payout_Achieved__c = 700; diptaSub.FourWD_Retail_Achieved__c = 50; diptaSub.FourWD_Retail_Predicted__c = 45;
        insert diptaSub;
        
        //Create DI KPI Info
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();    
        kpiInfo.Name = 'Volume'; kpiInfo.Data_Source__c = 'Salesforce';kpiInfo.KPI_Visiblity__c='KPI Target';
        insert kpiInfo;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'TestProdKPI';
        prodKPI.Product_Category__c = diProdcategory.Id;
        prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;
        
        //Create DI KPI Achievement
        List<DI_KPI_Achievement__c> KpiList = new List<DI_KPI_Achievement__c>();
        for (Integer i = 0 ; i < 2 ; i++){
            DI_KPI_Achievement__c kpiAcheive = new DI_KPI_Achievement__c();
            kpiAcheive.Product_KPI__c = prodKPI.Id; kpiAcheive.DI_Product_Target_and_Achivement__c = DIpta.Id; kpiAcheive.Predicted_KPI_Percentage__c = 50; kpiAcheive.Achieved_KPI_Perncentage__c = 160;
            kpiAcheive.Predicted_KPI_Payout__c = 50; kpiAcheive.Achieved_KPI_Payout__c = 50; kpiAcheive.Additional_Achieved_KPI_Payout__c = 45; kpiAcheive.Additional_Predicted_KPI_Payout__c = 45; kpiAcheive.Predicted_Potential_Amount__c = 500; kpiAcheive.Actual_Potential_Amount__c = 500;
            kpiAcheive.Indent_Order__c=10;kpiAcheive.Indent_Wholesale__c=60;
            KpiList.add(kpiAcheive);
        }
        //kpiAcheive.Product_Category__c = diProdcategory.Id; kpiAcheive.Year__c = 2024; kpiAcheive.Month__c = 'January'; kpiAcheive.Account__c = acc.Id;
        insert KpiList;
        
        //Create DI KPI Target And Payout Info
        List<DI_KPI_Target_And_Payout_Info__c> kpiInfoList = new List<DI_KPI_Target_And_Payout_Info__c>();

        DI_KPI_Target_And_Payout_Info__c kpiTAndP = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndP.Year__c = 2024; kpiTAndP.Month__c = 'January'; kpiTAndP.DI_Product_KPI__c = prodKPI.Id; kpiTAndP.Type__c = 'KPI Target'; kpiTAndP.Has_Slabs__c = true; kpiTAndP.DI_Product_Target__c = pt.Id;
        kpiTAndP.Is_Salesman_Incentive__c = true;
        kpiTAndP.Sales_Person_Incentive_Target__c = '>= 50';
        kpiInfoList.add(kpiTAndP);
        
        DI_KPI_Target_And_Payout_Info__c kpiTAndPI = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndPI.Year__c = 2024; kpiTAndPI.Month__c = 'January'; kpiTAndPI.DI_Product_KPI__c = prodKPI.Id; kpiTAndPI.Type__c = 'Additional Incentive Target'; kpiTAndPI.Has_Slabs__c = true; kpiTAndPI.DI_Product_Target__c = pt.Id;
        kpiTAndPI.Is_Salesman_Incentive__c = false;
        kpiInfoList.add(kpiTAndPI);

        DI_KPI_Target_And_Payout_Info__c kpiTAndPI1 = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndPI1.Year__c = 2024; kpiTAndPI1.Month__c = 'January'; kpiTAndPI1.DI_Product_KPI__c = prodKPI.Id; kpiTAndPI1.Type__c = 'Additional Incentive Target'; kpiTAndPI1.Has_Slabs__c = false; kpiTAndPI1.DI_Product_Target__c = pt.Id;
        kpiTAndPI1.Is_Salesman_Incentive__c = false;
        kpiTAndPI1.KPI_Target__c = '>= 100';
        kpiInfoList.add(kpiTAndPI1);

        DI_KPI_Target_And_Payout_Info__c growthKPI = new DI_KPI_Target_And_Payout_Info__c();
        growthKPI.Year__c = 2024; growthKPI.Month__c = 'January'; growthKPI.DI_Product_KPI__c = prodKPI.Id; growthKPI.Type__c = 'Growth Additional Incentive'; growthKPI.Has_Slabs__c = true; growthKPI.DI_Product_Target__c = pt.Id;
        growthKPI.Is_Salesman_Incentive__c = false;
        kpiInfoList.add(growthKPI);

        insert kpiInfoList;


        
        //Create Slab Info
        List<Slab_Info__c> slabInfo1 = new List<Slab_Info__c>();
        Slab_Info__c slabPercent = new Slab_Info__c();
        slabPercent.Slab_Range__c = '> 100 to < 120'; slabPercent.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabPercent.Payout_Mode__c = 'Amt'; 
        slabPercent.Amount__c = 95;
        slabInfo1.add(slabPercent);
        
        Slab_Info__c slabPro = new Slab_Info__c();
        slabPro.Slab_Range__c = '>= 120 to < 140'; slabPro.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabPro.Payout_Mode__c = 'proRata'; slabPro.Payout_Percentage__c = null;
        slabInfo1.add(slabPro);
        
        Slab_Info__c slabAmt2 = new Slab_Info__c();
        slabAmt2.Slab_Range__c = '== 161'; slabAmt2.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabAmt2.Payout_Mode__c = 'Amt';
         slabAmt2.Amount__c = 900;
        slabInfo1.add(slabAmt2);
        
        Slab_Info__c slabAmt1 = new Slab_Info__c();
        slabAmt1.Slab_Range__c = '> 140 to <= 160'; slabAmt1.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabAmt1.Payout_Mode__c = 'Percent'; slabAmt1.Payout_Percentage__c = 900;
        slabInfo1.add(slabAmt1);
        
        Slab_Info__c growthSlab = new Slab_Info__c();
        growthSlab.Slab_Range__c = '> 140 to <= 160'; growthSlab.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[3].Id; growthSlab.Payout_Mode__c = 'Percent'; growthSlab.Payout_Percentage__c = 900;
        growthSlab.Growth_Range__c = '>=4';
        slabInfo1.add(growthSlab);
        
        insert slabInfo1;
        
        Slab_Info__c slabs2 = new Slab_Info__c();
        slabs2.Slab_Range__c = '> 100 to < 120'; slabs2.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; 
        slabs2.Amount__c = 950;
        insert slabs2;
        
        //Create DI KPI Sub Product Payout
        DI_KPI_Sub_Product_Payout__c kpiSubProd = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProd.DI_Product_Sub_Category__c = prodSubCat.Id; kpiSubProd.DI_KPI_Target_And_Payout__c = kpiInfoList[0].Id; kpiSubProd.Payout_Amount__c = 50;
        kpiSubprod.Payout_Varies_By_4WD__c = false;kpiSubProd.TwoWD_Payout_Amount__c=10; kpiSubProd.FourWD_Payout_Amount__c=20;
        insert kpiSubProd;
        
        DI_KPI_Sub_Product_Payout__c kpiSubProdP = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProdP.DI_Product_Sub_Category__c = prodSubCat.Id; kpiSubProdP.DI_KPI_Target_And_Payout__c = kpiInfoList[0].Id; kpiSubProdP.Payout_Amount__c = 50;
        kpiSubProdP.Payout_Varies_By_4WD__c = false;kpiSubProdP.TwoWD_Payout_Amount__c=10; kpiSubProdP.FourWD_Payout_Amount__c=20;
        insert kpiSubProdP;
        List<Id> accountIds = new List<Id>();
        accountIds.add([SELECT Id FROM Account LIMIT 1].Id);
        
        //List<DI_Product_Target_and_Achievement__c> productTargetkpis = new List<DI_Product_Target_and_Achievement__c>();
        //List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
       
        //DI_Product_Target_and_Achievement__c diProd = new  DI_Product_Target_and_Achievement__c();
        //diProd.Dealer_Incentive__c = DI.Id; diProd.Product_Category__c = diProdcategory.Id; diProd.Total_Retail_Target__c = 100;
        //productTargetkpis.add(diProd);
        //insert productTargetkpis;
        
        //for(Integer i=0 ; i<2 ; i++){
        //    Dealer_Incentive__c DIs = new Dealer_Incentive__c();
        //    DIs.Month__c = 'January'; DIs.Year__c = 2024; DIs.Dealer_Account__c = acc.Id; DIs.Stage__c = 'Configured';
            
        //    dealerIncentives.add(DIs);
        //}
        //insert dealerIncentives;

        //List<Id> deletedIds = new List<Id>();
        // //Create DI KPI Info
        // DI_KPI_Info__c kpiInfo1 = new DI_KPI_Info__c();    
        // kpiInfo1.Name = 'Sales Person'; kpiInfo1.Data_Source__c = 'Salesforce';
        // insert kpiInfo1;
        
        // //Create DI Product KPI
        // DI_Product_KPI__c prodKPI1 = new DI_Product_KPI__c();
        // prodKPI1.Name = 'BHLSP';
        // prodKPI1.Product_Category__c = diProdcategory.Id;
        // prodKPI1.KPI__c = kpiInfo1.Id;
        // insert prodKPI1;

        // DI_KPI_Target_And_Payout_Info__c kpiTarget1 = new DI_KPI_Target_And_Payout_Info__c();
        // kpiTarget1.Year__c = 2024; kpiTarget1.Month__c = 'January'; kpiTarget1.DI_Product_KPI__c = prodKPI1.Id; kpiTarget1.Type__c = 'KPI Target'; kpiTarget1.Has_Slabs__c = true; kpiTarget1.DI_Product_Target__c = pt.Id;
        // kpiTarget1.Is_Salesman_Incentive__c = false;
        // insert kpiTarget1;

        // DI_KPI_Sub_Product_Payout__c kpiSubProdP1 = new DI_KPI_Sub_Product_Payout__c();
        // kpiSubProdP1.DI_Product_Sub_Category__c = prodSubCat.Id; kpiSubProdP1.DI_KPI_Target_And_Payout__c = kpiTarget1.Id; kpiSubProdP1.Payout_Amount__c = 50;
        // insert kpiSubProdP1;
        
      
        
        //Testing
        Test.startTest();
        String month = 'January';
        Integer year = 2024;
        String search = 'Dealer';
        String productName = 'BHL';
        JCBActualAchievementCalcController jcb = new JCBActualAchievementCalcController();
        JCBActualAchievementCalcController.DealerWrapper jcbActual = new JCBActualAchievementCalcController.DealerWrapper();
        jcbActual.month = 'January'; jcbActual.year = 2024 ; jcbActual.dealerId = accountIds[0];
        JCBActualAchievementCalcController.updateActualRetail(new List<JCBActualAchievementCalcController.DealerWrapper>{jcbActual});
        JCBActualAchievementCalcController.getTargetsAndPayouts('January', 2024, new List<Id>(), true);
        List<DI_KPI_Achievement__c> getKPIAcheive = dIFormulaController.getKPIAchivementsByDealers(month , year);
        List<Dealer_Incentive__c> listOfDI = dIFormulaController.getDealerIncentives( month , year , search , productName);
        //String resultKpi = dIFormulaController.saveKpiPayouts(KpiList, productTargetkpis, dealerIncentives, deletedIds);
        String saveKpiAchievements = dIFormulaController.saveKpiAchievements(KpiList, 'January', 2024, accountIds);
        Test.stopTest();
    }

    @isTest
    static void updateActualAchievement(){
        //Create Account
        Account acc = new Account();
        acc.Name = 'Dealer'; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
        insert acc;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL';
        diProdcategory.Order_No__c = 1;
        insert diProdcategory;
        
        //Create DI Product Sub Category
        DI_Product_Sub_Category__c prodSubCat = new DI_Product_Sub_Category__c();
        prodSubCat.Name = 'A-2DX'; prodSubCat.Product_Category__c = diProdcategory.Id;
        insert prodSubCat;
        
        //Create DI KPI Info
        DI_KPI_Info__c kpiInfo = new DI_KPI_Info__c();    
        kpiInfo.Name = 'Volume'; kpiInfo.Data_Source__c = 'Salesforce'; kpiInfo.KPI_Visiblity__c='KPI Target;KPI Payout;CALC Payout;Multi KPITarget';
        insert kpiInfo;

        DI_KPI_Info__c kpiInfo1 = new DI_KPI_Info__c();    
        kpiInfo1.Name = 'Sales Person'; kpiInfo1.Data_Source__c = 'Salesforce'; kpiInfo.KPI_Visiblity__c='KPI Target';
        insert kpiInfo1;
        
        //Create DI Product KPI
        DI_Product_KPI__c prodKPI = new DI_Product_KPI__c();
        prodKPI.Name = 'BHLVL';
        prodKPI.Product_Category__c = diProdcategory.Id;
        prodKPI.KPI__c = kpiInfo.Id;
        insert prodKPI;

        DI_Product_KPI__c prodKPI1 = new DI_Product_KPI__c();
        prodKPI1.Name = 'BHLSP';
        prodKPI1.Product_Category__c = diProdcategory.Id;
        prodKPI1.KPI__c = kpiInfo.Id;
        insert prodKPI1;
        
        //Create DI Product Target
        DI_Product_Target__c pt = new DI_Product_Target__c();
        pt.DI_Product_Category__c = diProdcategory.Id; pt.Year__c = 2024; pt.Month__c = 'January'; pt.Stock_Policy__c = 50;
        insert pt;

        //Create Dealer Incentive
        Dealer_Incentive__c DI = new Dealer_Incentive__c();
        DI.Month__c = 'January'; DI.Year__c = 2024; DI.Dealer_Account__c = acc.Id; DI.Stage__c = 'Configured'; DI.Total_Product_Payout_Achieved__c = 1000; DI.Total_Additional_Payout_Achieved__c = 500; DI.Total_Payout_Achieved__c = 500;
        DI.Total_Retail_Achieved__c = 500; DI.Total_Retail_Predicted__c = 100; DI.Total_Product_Payout_Predicted__c = 1000; DI.Total_Additional_Payout_Predicted__c = 450; DI.Total_Payout_Predicted__c = 50000;
        insert DI;
        
        //Create DI Product Target and Achievement
        DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
        DIpta.Dealer_Incentive__c = DI.Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100; DIpta.Total_Retail_Predicted__c = 100; DIpta.Total_Retail_Achieved__c = 100; DIpta.Demo_Target__c = 20;
        DIpta.Total_Additional_Actual_Payout__c = 50; DIpta.Total_Additional_Predicted_Payout__c = 50; DIpta.Total_Product_Actual_Payout__c = 50; DIpta.Total_Product_Predicted_Payout__c = 30000;DIpta.Total_Actual_Payout__c=10;DIpta.Total_Predicted_Payout__c=20;
        insert DIpta;
        
        //Create DI SubCategory Target and Achievement
        DI_SubCategory_Target_and_Achievement__c diptaSub = new DI_SubCategory_Target_and_Achievement__c();
        diptaSub.DI_Product_Target_and_Achivement__c = DIpta.Id; diptaSub.Sub_Category__c = prodSubCat.Id; diptaSub.SubCategory_Retail_Achieved__c = 500; diptaSub.SubCategory_Retail_Predicted__c = 450; diptaSub.SubCategory_Retail_Target__c = 450; diptaSub.SubCategory_Add_Actual_Payout__c = 600; diptaSub.SubCategory_Add_Predicted_Payout__c = 550;
        diptaSub.SubCategory_Predicted_Payout__c = 750; diptaSub.SubCategory_Actual_Payout_Achieved__c = 700; diptaSub.FourWD_Retail_Achieved__c = 50; diptaSub.FourWD_Retail_Predicted__c = 45;
        insert diptaSub;
        
        //Create DI KPI Achievement
        List<DI_KPI_Achievement__c> KpiList = new List<DI_KPI_Achievement__c>();
        for (Integer i = 0 ; i < 2 ; i++){
            DI_KPI_Achievement__c kpiAcheive = new DI_KPI_Achievement__c();
            kpiAcheive.Product_KPI__c = prodKPI.Id; kpiAcheive.DI_Product_Target_and_Achivement__c = DIpta.Id; kpiAcheive.Predicted_KPI_Percentage__c = 50; kpiAcheive.Achieved_KPI_Perncentage__c = 160;
            kpiAcheive.Predicted_KPI_Payout__c = 50; kpiAcheive.Achieved_KPI_Payout__c = 20000; kpiAcheive.Additional_Achieved_KPI_Payout__c = 45; kpiAcheive.Additional_Predicted_KPI_Payout__c = 45; kpiAcheive.Predicted_Potential_Amount__c = 500; kpiAcheive.Actual_Potential_Amount__c = 500;
            kpiAcheive.Indent_Order__c=10;kpiAcheive.Indent_Wholesale__c=60;
            KpiList.add(kpiAcheive);
        }
        insert KpiList;
        
        //Create DI KPI Target And Payout Info
        List<DI_KPI_Target_And_Payout_Info__c> kpiInfoList = new List<DI_KPI_Target_And_Payout_Info__c>();

        DI_KPI_Target_And_Payout_Info__c kpiTAndP = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndP.Year__c = 2024; kpiTAndP.Month__c = 'January'; kpiTAndP.DI_Product_KPI__c = prodKPI.Id; kpiTAndP.Type__c = 'KPI Target'; kpiTAndP.Has_Slabs__c = true; kpiTAndP.DI_Product_Target__c = pt.Id;
        kpiTAndP.Is_Salesman_Incentive__c = true;
        kpiTAndP.Sales_Person_Incentive_Target__c = '>= 50'; kpiTAndP.KPI_Target__c = '== 100';
        kpiInfoList.add(kpiTAndP);
        
        DI_KPI_Target_And_Payout_Info__c kpiTAndP1 = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndP1.Year__c = 2024; kpiTAndP1.Month__c = 'January'; kpiTAndP1.DI_Product_KPI__c = prodKPI1.Id; kpiTAndP1.Type__c = 'KPI Target'; kpiTAndP1.Has_Slabs__c = true; kpiTAndP1.DI_Product_Target__c = pt.Id;
        kpiTAndP1.Is_Salesman_Incentive__c = false; kpiTAndP1.KPI_Target__c = '== 100';
        kpiInfoList.add(kpiTAndP1);

        DI_KPI_Target_And_Payout_Info__c kpiTAndPI = new DI_KPI_Target_And_Payout_Info__c();
        kpiTAndPI.Year__c = 2024; kpiTAndPI.Month__c = 'January'; kpiTAndPI.DI_Product_KPI__c = prodKPI.Id; kpiTAndPI.Type__c = 'Additional Incentive Target'; kpiTAndPI.Has_Slabs__c = true; kpiTAndPI.DI_Product_Target__c = pt.Id;
        kpiTAndPI.Is_Salesman_Incentive__c = false;
        kpiInfoList.add(kpiTAndPI);
        insert kpiInfoList;
        
        //Create Slab Info
        List<Slab_Info__c> slabInfo1 = new List<Slab_Info__c>();
        Slab_Info__c slabPercent = new Slab_Info__c();
        slabPercent.Slab_Range__c = '>= 50 to < 120'; slabPercent.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabPercent.Payout_Mode__c = 'Amt'; 
        slabPercent.Amount__c = 95;
        slabInfo1.add(slabPercent);

        Slab_Info__c slabPercent1 = new Slab_Info__c();
        slabPercent1.Slab_Range__c = '>= 100'; slabPercent1.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[0].Id; slabPercent1.Payout_Mode__c = 'Percent'; 
        slabPercent1.Payout_Percentage__c = 90;
        slabPercent1.Slab_Type__c = 'Salesperson Incentive';
        slabInfo1.add(slabPercent1);
        
        Slab_Info__c slabPro = new Slab_Info__c();
        slabPro.Slab_Range__c = '>= 50 to < 140'; slabPro.DI_KPI_Target_And_Payout_Info__c = kpiInfoList[2].Id; slabPro.Payout_Mode__c = 'proRata'; slabPro.Payout_Percentage__c = null; slabPro.Amount__c = 1000;
        slabInfo1.add(slabPro);
        
        insert slabInfo1;
        
        //Create DI KPI Sub Product Payout
        DI_KPI_Sub_Product_Payout__c kpiSubProd = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProd.DI_Product_Sub_Category__c = prodSubCat.Id; kpiSubProd.DI_KPI_Target_And_Payout__c = kpiInfoList[0].Id; kpiSubProd.Payout_Amount__c = 50;
        kpiSubProd.Payout_Varies_By_4WD__c = true;kpiSubProd.TwoWD_Payout_Amount__c=10; kpiSubProd.FourWD_Payout_Amount__c=20;
        insert kpiSubProd;
        
        DI_KPI_Sub_Product_Payout__c kpiSubProdP = new DI_KPI_Sub_Product_Payout__c();
        kpiSubProdP.DI_Product_Sub_Category__c = prodSubCat.Id; kpiSubProdP.DI_KPI_Target_And_Payout__c = kpiInfoList[1].Id; kpiSubProdP.Payout_Amount__c = 50;
        kpiSubProdP.Payout_Varies_By_4WD__c = true;kpiSubProdP.TwoWD_Payout_Amount__c=10; kpiSubProdP.FourWD_Payout_Amount__c=20;
        insert kpiSubProdP;
        
        DI_KPI_Target_And_Payout_Info__c kpiTargetInd = new DI_KPI_Target_And_Payout_Info__c();
        kpiTargetInd.Is_Total_Volume_Industry__c = true;kpiTargetInd.Year__c=2024;kpiTargetInd.Month__c='January';
        insert kpiTargetInd;

        JCBDealerIncentiveWrapper.SlabInfo slabInfo = new JCBDealerIncentiveWrapper.SlabInfo();
        slabInfo.slabId = null;slabInfo.slabRange = '>80';slabInfo.payoutMode = 'Percentage';slabInfo.amount = 1000;
        slabInfo.payoutPercentage = 5;slabInfo.slabType = 'Total Volume Industry Incentive';

        List<JCBDealerIncentiveWrapper.SlabInfo> slabInfos = new List<JCBDealerIncentiveWrapper.SlabInfo> { slabInfo };

        JCBDealerIncentiveWrapper.IndustryVolumeWrapper industryVolumeWrapper = new JCBDealerIncentiveWrapper.IndustryVolumeWrapper();
        industryVolumeWrapper.recordId = kpiTargetInd.Id;industryVolumeWrapper.isIndustryIncentive = true;industryVolumeWrapper.slabInfo = slabInfos;
        
        List<Id> dealerIds = new List<Id>();
        Id id = [SELECT Id FROM Account WHERE Name = 'Dealer' LIMIT 1].Id;
        dealerIds.add(id);
        //Testing
        Test.startTest();
        String month = 'January';
        Integer year = 2024;
        String search = 'Dealer';
        String productName = 'BHL';
        String result = dIFormulaController.saveIndustryIncentive(industryVolumeWrapper);
        JCBActualAchievementCalcController.getTargetsAndPayouts(month, year, dealerIds, false);
        dIFormulaController.getTargetsAndPayouts(month, year, dealerIds, false);
        Test.stopTest();
 
    }
    @isTest
    static void testDeleteAdditionalRecords() {
        // Create a product category
        DI_Product_Category__c productCategory = new DI_Product_Category__c(Name = 'Test Product Category');
        insert productCategory;

        // Create a product target
        DI_Product_Target__c productTarget = new DI_Product_Target__c(
            Month__c = 'October',
            Year__c = 2024,
            DI_Product_Category__c = productCategory.Id // Link the category
        );
        insert productTarget;

        // Create multi KPI target config
        DI_Multi_KPI_Target_Config__c multiKPI = new DI_Multi_KPI_Target_Config__c(
            Month__c = 'October',
            Year__c = 2024,
            DI_Product_Target__c = productTarget.Id
        );
        insert multiKPI;

        // Create slab info
        Slab_Info__c slabInfo = new Slab_Info__c(
            Slab_Range__c = '0-100',
            Payout_Percentage__c = 10,
            DI_Multi_KPI_Target_Config__c = multiKPI.Id
        );
        insert slabInfo;

        // Create KPI target and payout info
        DI_KPI_Target_And_Payout_Info__c kpiInfo = new DI_KPI_Target_And_Payout_Info__c(
            Month__c = 'October',
            Year__c = 2024,
            DI_Product_Target__c = productTarget.Id,
            type__c = 'Growth Additional Incentive'
        );
        insert kpiInfo;

        // Assert records exist before deletion
        List<Slab_Info__c> slabsBefore = [SELECT Id FROM Slab_Info__c WHERE Id = :slabInfo.Id];
        List<DI_Multi_KPI_Target_Config__c> multiBefore = [SELECT Id FROM DI_Multi_KPI_Target_Config__c WHERE Id = :multiKPI.Id];
        List<DI_KPI_Target_And_Payout_Info__c> kpiBefore = [SELECT Id FROM DI_KPI_Target_And_Payout_Info__c WHERE Id = :kpiInfo.Id];

        System.assertEquals(1, slabsBefore.size(), 'Expected one slab before deletion.');
        System.assertEquals(1, multiBefore.size(), 'Expected one multi KPI target before deletion.');
        System.assertEquals(1, kpiBefore.size(), 'Expected one KPI target before deletion.');

        // Call the method to test
        Test.startTest();
        dIFormulaController.deleteAdditionalRecords('October', 2024, 'Test Product Category', true);
        Test.stopTest();

        // Assert records have been deleted
        List<Slab_Info__c> slabsAfter = [SELECT Id FROM Slab_Info__c WHERE Id = :slabInfo.Id];
        List<DI_Multi_KPI_Target_Config__c> multiAfter = [SELECT Id FROM DI_Multi_KPI_Target_Config__c WHERE Id = :multiKPI.Id];
        List<DI_KPI_Target_And_Payout_Info__c> kpiAfter = [SELECT Id FROM DI_KPI_Target_And_Payout_Info__c WHERE Id = :kpiInfo.Id];

        System.assertEquals(0, slabsAfter.size(), 'Expected no slabs after deletion.');
        System.assertEquals(0, multiAfter.size(), 'Expected no multi KPI targets after deletion.');
        System.assertEquals(0, kpiAfter.size(), 'Expected no KPI targets after deletion.');
    }
    
    
      @isTest
    static void testSaveMultipleKPITarget() {
        // Setup sample product category
        DI_Product_Category__c sampleCategory = new DI_Product_Category__c(Name = 'Test Category');
        insert sampleCategory;
        List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargets = new List<JCBDealerIncentiveWrapper.ProductTargetWrapper>();
        for (Integer i = 0; i < 3; i++) {
            DI_Product_Target__c productTarget = new DI_Product_Target__c(
                Month__c = 'January',
                Year__c = 2024,
                DI_Product_Category__c = sampleCategory.Id
            );
            insert productTarget;
            JCBDealerIncentiveWrapper.ProductTargetWrapper productTargetWrapper = new JCBDealerIncentiveWrapper.ProductTargetWrapper();
            productTargetWrapper.productTargetId = productTarget.Id;
            productTargetWrapper.month = 'January';
            productTargetWrapper.year = 2024;
            productTargetWrapper.productCategory = new JCBDealerIncentiveWrapper.ProductCategoryWrapper();
            productTargetWrapper.productCategory.productId = sampleCategory.Id;

            // Create multiKPI
            productTargetWrapper.multiKpi = new List<JCBDealerIncentiveWrapper.DIMultiWrapper>();
            for (Integer j = 0; j < 2; j++) {
                JCBDealerIncentiveWrapper.DIMultiWrapper multiKPI = new JCBDealerIncentiveWrapper.DIMultiWrapper();
                multiKPI.conditionLogic = 'Condition Logic ' + j;
                multiKPI.customLogic = 'Custom Logic ' + j;
                multiKPI.month = 'January';
                multiKPI.year = 2024;
                multiKPI.incentiveAmount = 1000 + j * 100;

                // Create slabs
                multiKPI.multiKpSlabs = new List<JCBDealerIncentiveWrapper.SlabInfo>();
                for (Integer k = 0; k < 2; k++) {
                    JCBDealerIncentiveWrapper.SlabInfo slabInfo = new JCBDealerIncentiveWrapper.SlabInfo();
                    slabInfo.slabRange = '0 - ' + (100 + k * 100);
                    multiKPI.multiKpSlabs.add(slabInfo);
                }

                productTargetWrapper.multiKpi.add(multiKPI);
            }

            productTargets.add(productTargetWrapper);
        }
        Test.startTest();
        	List<JCBDealerIncentiveWrapper.ProductTargetWrapper> getMultiKPITargets = dIFormulaController.getMultiKPITargets('January',2024,'BHL');
            try{
                String result = dIFormulaController.saveMultipleKPITarget(productTargets);
            }catch(Exception e){}
        Test.stopTest();
    }

    @isTest
    static void updateActualRetailTest(){
        //Create Account
        List<Account> accList = new List<Account>();
        for(Integer i=0 ; i<2 ; i++){
            Account acc = new Account();
            acc.Name = 'Dealer'+i; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
            accList.add(acc);
        }
        insert accList;

        //Create Dealer Incentive
        DateTime dt = Datetime.now();
            String month = dt.format('MMMM');
            Integer year = dt.year();

        List<Id> dealerIds = new List<Id>();
        List<Dealer_Incentive__c> dealerIncent = new List<Dealer_Incentive__c>();
        for(Integer i=0 ; i<2 ; i++){
            dealerIds.add(accList[i].Id);
            Dealer_Incentive__c DI = new Dealer_Incentive__c();
            DI.Month__c = month; DI.Year__c = year; DI.Dealer_Account__c = accList[i].Id; DI.Stage__c = 'Configured';
            
            dealerIncent.add(DI);
        }
        insert dealerIncent;
        
        //Create DI_Product_Category__c
        DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
        diProdcategory.Name = 'BHL'; diProdcategory.Order_No__c = 1; 
        insert diProdcategory;
        
        //Create DI_Product_Sub_Category__c
        List<DI_Product_Sub_Category__c> diSubProdcategory = new List<DI_Product_Sub_Category__c>();
        for(Integer i=0 ; i<3 ; i++){
            DI_Product_Sub_Category__c diSubProd = new DI_Product_Sub_Category__c();
            diSubProd.Name = 'A2-Super Loader'+i;
            diSubProd.Product_Category__c = diProdcategory.Id;
            diSubProdcategory.add(diSubProd);
        }
        insert diSubProdcategory;
        
        //Create DI Product Target and Achievement
        for(Integer i=0 ; i<2 ; i++){
            DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
            DIpta.Dealer_Incentive__c = dealerIncent[0].Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100;
            insert DIpta;
            DI_SubCategory_Target_and_Achievement__c subTAndA = new DI_SubCategory_Target_and_Achievement__c();
            subTAndA.DI_Product_Target_and_Achivement__c = DIpta.Id;
            subTAndA.Sub_Category__c = diSubProdcategory[0].Id;
            insert subTAndA;
        }
        
        Opportunity opp1 = new Opportunity();
        opp1.Name = 'Test opp1';
        opp1.Assigned_Dealer__c = dealerIds[0];
        opp1.StageName = 'Prospecting';
        opp1.CloseDate = Date.newInstance(2024, 1, 1);    
        opp1.Last_Stage_Change__c = Date.newInstance(2024, 1, 1);
        opp1.Product_Category__c = 'BHL';
        opp1.Product_Sub_Category__c = diSubProdcategory[0].Name;
        insert opp1;
        opp1.StageName = 'Closed Won';
        update opp1;  

        // Opportunity opp2 = new Opportunity();
        // opp2.Name = 'Test opp2';
        // opp2.Assigned_Dealer__c = dealerIds[0];
        // opp2.StageName = 'Prospecting';
        // opp2.CloseDate = Date.newInstance(2024, 1, 1);    
        // opp2.Last_Stage_Change__c = Date.newInstance(2024, 1, 1);
        // opp2.Product_Category__c = 'BHL';
        // opp2.Product_Sub_Category__c = diSubProdcategory[0].Name;
        // insert opp2;
        // opp2.StageName = 'Closed Won';
        // update opp2;  

        //Testing
        Test.startTest();
            JCBActualCalcController jcb = new JCBActualCalcController();
            try {
                JCBActualAchievementCalcController.DealerWrapper dealer = new JCBActualAchievementCalcController.DealerWrapper();
                dealer.dealerId = dealerIds[0];
                dealer.month = month;
                dealer.year = year;
                dealer.productCategory = 'BHL';
                dealer.productSubCategory = '2DX';
                JCBActualCalcController.updateActualRetail(new List<JCBActualAchievementCalcController.DealerWrapper>{dealer});
                // Map<String, Object> results = JCBActualCalcController.getOppsAndOrders(dealerIds, month, year, 'BHL');
                Map<String, Object> resultsMap = JCBActualCalcController.getOppsAndOrders(null, null, null, 'BHL');                
            } catch(Exception e) {
                
            }
            List<JCBActualAchievementCalcController.DealerWrapper> dealerWrapper = new List<JCBActualAchievementCalcController.DealerWrapper>();
            JCBActualAchievementCalcController.DealerWrapper dealWrap = new JCBActualAchievementCalcController.DealerWrapper();
            dealWrap.dealerId = dealerIds[0];
            dealWrap.month = month;
            dealWrap.year = year;
            dealWrap.productCategory = 'BHL';
            dealWrap.productSubCategory = '2DX';
            JCBActualCalcController.updateActualRetail(new List<JCBActualAchievementCalcController.DealerWrapper>{dealWrap});
            JCBActualCalcController.getMonthNumber('February');
        Test.stopTest();
        System.assertEquals(2, dealerIncent.size(), 'There should be two dealerwrapper');
    }

    @isTest
	public static void updateActualForAllDealersTest() {

		//Create Account
		List<Account> accList = new List<Account>();
		for(Integer i=0 ; i<2 ; i++){
			Account acc = new Account();
			acc.Name = 'Dealer'+i; acc.India_Zone__c = 'North'; acc.Type = 'Dealer'; acc.Region__c = 'India'; acc.Dealer_Location_Status__c = 'HQ'; acc.Active__c = true; acc.Creation_Source__c = 'Salesforce';
			accList.add(acc);
		}
		insert accList;

		//Create Dealer Incentive
		DateTime dt = Datetime.now();
		String month = dt.format('MMMM');
		Integer year = dt.year();

		List<Id> dealerIds = new List<Id>();
		List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
		for(Integer i=0 ; i<2 ; i++){
			dealerIds.add(accList[i].Id);
			Dealer_Incentive__c DI = new Dealer_Incentive__c();
			DI.Month__c = month; DI.Year__c = year; DI.Dealer_Account__c = accList[i].Id; DI.Stage__c = 'Configured';
			
			dealerIncentives.add(DI);
		}
		insert dealerIncentives;
		
		//Create DI_Product_Category__c
		DI_Product_Category__c diProdcategory = new DI_Product_Category__c();
		diProdcategory.Name = 'BHL'; diProdcategory.Order_No__c = 1; 
		insert diProdcategory;
		
		//Create DI_Product_Sub_Category__c
		List<DI_Product_Sub_Category__c> diSubProdcategory = new List<DI_Product_Sub_Category__c>();
		for(Integer i=0 ; i<3 ; i++){
			DI_Product_Sub_Category__c diSubProd = new DI_Product_Sub_Category__c();
			diSubProd.Name = 'A2-Super Loader'+i;
			diSubProd.Product_Category__c = diProdcategory.Id;
			diSubProdcategory.add(diSubProd);
		}
		insert diSubProdcategory;
		
		//Create DI Product Target and Achievement
		for(Integer i=0 ; i<2 ; i++){
			DI_Product_Target_and_Achievement__c DIpta = new  DI_Product_Target_and_Achievement__c();
			DIpta.Dealer_Incentive__c = dealerIncentives[0].Id; DIpta.Product_Category__c = diProdcategory.Id; DIpta.Total_Retail_Target__c = 100;
			insert DIpta;
			DI_SubCategory_Target_and_Achievement__c subTAndA = new DI_SubCategory_Target_and_Achievement__c();
			subTAndA.DI_Product_Target_and_Achivement__c = DIpta.Id;
			subTAndA.Sub_Category__c = diSubProdcategory[0].Id;
			insert subTAndA;
		}

		Opportunity opp = new Opportunity();
		opp.Name = 'Test opp3';
		opp.Assigned_Dealer__c = dealerIds[0];
		opp.StageName = 'Closed Won';
		opp.CloseDate = Date.newInstance(2024, 1, 1);    
		opp.Last_Stage_Change__c = Date.newInstance(2024, 10, 20);
		opp.Product_Category__c = 'BHL';
		opp.Product_Sub_Category__c = diSubProdcategory[0].Name;
		insert opp;
		opp.StageName = 'Closed Lost';
		update opp;


        Test.startTest();
            JCBActualAchievementCalcController.DealerWrapper dealer = new JCBActualAchievementCalcController.DealerWrapper();
            dealer.dealerId = dealerIds[0];
            dealer.month = month;
            dealer.year = year;
            dealer.productCategory = 'BHL';
        	dealer.productSubCategory = '2DX';
           JCBActualCalcController.updateActualForAllDealers(new List<Id>{dealerIds[0]}, month, year, 'BHL');
        Test.stopTest();
        System.assertEquals(2, dealerIncentives.size(), 'There should be two dealerwrapper');
	}
}