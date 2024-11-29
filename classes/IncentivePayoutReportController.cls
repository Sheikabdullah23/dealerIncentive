public without sharing class IncentivePayoutReportController {
    public JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerDetails { get; set; }
    public String reportDate { get; set; }
    public String reportDateChange { get; set; }
    public Decimal totalTargetPercent { get; set; }
    public IncentivePayoutReportController(){
        Id recordId = ApexPages.CurrentPage().getparameters().get('id');
        String month = ApexPages.CurrentPage().getparameters().get('month');
        Integer year = Integer.valueOf(ApexPages.CurrentPage().getparameters().get('year'));
        
        //Id recordId = '001S900000LxeyFIAR';
        //String month = 'January';
        //Integer year = 2024;
        
        DateTime currentDate = Datetime.now();
        reportDate = currentDate.format('dd-MM-yyyy');
        reportDateChange = month + ' ' + year;
        dealerDetails = IncentivePayoutReportController.getDealerAndProductTargetInfo(month, year, recordId);
    }
    
    @AuraEnabled 
    public static JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper  getDealerAndProductTargetInfo(String month, Integer year, Id dealerId) {
        JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper prodVolumeTargetInfo;
        try {
            List<Dealer_Incentive__c> dpt = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c,Stage__c, Total_Payout_Predicted__c, Total_Payout_Achieved__c, Total_Additional_Payout_Predicted__c, Total_Additional_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Product_Payout_Achieved__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c from Dealer_Incentive__c where Month__c = :month AND Year__c = :year AND Dealer_Account__c = :dealerId];
            List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();
            if(dpt.size() > 0) {
                productTargets = [Select Id, Product_Category__c, Product_Category__r.Name,Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                                  (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c,SubCategory_Retail_Predicted__c, SubCategory_Retail_Achieved__c, SubCategory_Predicted_Payout__c, SubCategory_Actual_Payout_Achieved__c, DI_Product_Target_and_Achivement__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :dpt[0].Id ORDER BY Product_Category__r.Order_No__c];
                prodVolumeTargetInfo = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(dpt[0]);
                prodVolumeTargetInfo.productTargetsAndAchievements = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
                for(DI_Product_Target_and_Achievement__c productTarget : productTargets) {
                    JCBDealerIncentiveWrapper.ProductTargetAndAchievement prodWrap = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(productTarget);
                    List<DI_KPI_Achievement__c> kpiTargets = [Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Actual_Potential_Amount__c, Predicted_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, Growth_Predicted_KPI_Payout__c, Growth_Achieved_KPI_Payout__c, CE_Ratio_Predicted_Payout__c, CE_Ratio_Actual_Payout__c, CE_Ratio_YTD_Predicted_Payout__c, CE_Ratio_YTD_Actual_Payout__c, Quarter_Predicted_Percentage__c, Quarter_Actual_Percentage__c from DI_KPI_Achievement__c where DI_Product_Target_and_Achivement__c = :productTarget.Id ORDER BY Product_KPI__r.Order_No__c];
                    prodWrap.productKPIAndAchievements = new List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements>();
                    for(DI_KPI_Achievement__c kpiTarget : kpiTargets) {
                        JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements(kpiTarget);
                        List<DI_Product_KPI__c> prodKPI = [select Id, KPI__c, KPI__r.Name, KPI__r.KPI_Visiblity__c, Product_Category__c, Product_Category__r.Name  from DI_Product_KPI__c where Id = :kpiTarget.Product_KPI__c];
                        if(prodKPI.size() > 0) {
                            JCBDealerIncentiveWrapper.ProductKPI pdk = new JCBDealerIncentiveWrapper.ProductKPI(prodKPI[0]);
                            kpiWrap.productKPI = pdk;
                        }
                        prodWrap.productKPIAndAchievements.add(kpiWrap);
                    }
                    
                    prodVolumeTargetInfo.productTargetsAndAchievements.add(prodWrap);
                }
            }
            
        } catch(Exception e) {
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
            throw new AuraHandledException(e.getMessage());
        }
        return prodVolumeTargetInfo;
    }
    
    @AuraEnabled
    public static string getPdfcontent(String month, String year, String dealerId){
        try {
            PageReference rprtPg=page.Incentive_Calculation;
            rprtPg.getParameters().put('id',dealerId);
            rprtPg.getParameters().put('month',month);
            rprtPg.getParameters().put('year',year);
            ContentVersion cv = new ContentVersion();
            cv.Title = 'IncentiveReport-' + month + '_' + year ;
            cv.PathOnClient =  'Incentive_report.pdf';
            if(Test.isRunningTest()){
                cv.VersionData = Blob.valueOf('testclass');
            }
            else{
                cv.VersionData = rprtPg.getContentAsPDF();   
            }
            insert cv;
            ContentDistribution cd = new ContentDistribution();
            cd.Name = cv.Title+'.pdf';
            cd.ContentVersionId = cv.Id;
            cd.PreferencesAllowViewInBrowser= true;
            cd.PreferencesNotifyOnVisit=false;
            insert cd;
            ContentDistribution c= [SELECT Id,name,DistributionPublicUrl,ContentDocumentId,PdfDownloadUrl FROM ContentDistribution WHERE Id=:cd.Id limit 1];
            return c.ContentDocumentId+'+++'+c.PdfDownloadUrl;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string deleteContentDocuments(String contentDocumentId){
        ContentDocument cd = [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId LIMIT 1];
        delete cd;
        return 'Success';
    }
}