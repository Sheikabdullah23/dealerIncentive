global with sharing class JCBActualAchievementCalcController {

    public static Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>> prodTargetAndPayout;
    public static Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>> prodAddTargetAndPayout;
    public static Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>> growthTargetAndPayout;
    public static List<JCBDealerIncentiveWrapper.ProductPayoutInfo> productPayouts;
    public static List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements> kpiAchievements;
    public static List<JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement> subCategoryTarget;
    public static JCBDealerIncentiveWrapper.ProductTargetAndAchievement product;
    public static String zoneName;
    public static Decimal demoTarget;
    public static Map<String, List<Map<String, Object>>> subProdKPIPayout;
    public static Map<String, Object> addVolumeTarget = new Map<String, Object>();
    public static Map<String, Object> removeVolumeTarget = new Map<String, Object>();
    public static Integer count_2WDProducts;
    public static Integer count_4WDProducts;
    public static Boolean isActualMode = false;
    public static List<DI_Product_KPI__c> selectedProdAndKpis = new List<DI_Product_KPI__c>();
    public static JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerTargetAndPayoutInfo = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper();
    public static Boolean salesPersonConfigured = false;
    public static Map<String,List<DI_Product_KPI__c>> prodANDKPI = new Map<String,List<DI_Product_KPI__c>>();
    public static Map<String, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> prevDealerWrappers = new Map<String, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>();
    public static Boolean isTIVConfigured = false;
    public JCBActualAchievementCalcController() {}
    
    
    @InvocableMethod(label = 'Update Actual Retail Achieved')
    public static void updateActualRetail(List<DealerWrapper> dealerWrapper) {
        getTargetsAndPayouts(dealerWrapper[0].month, dealerWrapper[0].year, new List<Id>{dealerWrapper[0].dealerId}, true);
    }

    @AuraEnabled
    public static void getTargetsAndPayouts(String month, Integer year, List<Id> dealerIds, Boolean isActual) {
        isActualMode = isActual;
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> prodTargetAndPayoutInfo = new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        Map<String,Object> resultMap;
        try {
            prodANDKPI = JCBDealerIncentiveController.getProductsAndKPI();

            List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerInfoWrappers = new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>();
            List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
            List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();
            List<DI_KPI_Achievement__c> kpiTargets = new List<DI_KPI_Achievement__c>();

            if(dealerIds != null && dealerIds?.size() > 0) {
                dealerIncentives = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Payout_Achieved__c, Total_Additional_Payout_Predicted__c, Total_Additional_Payout_Achieved__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Month__c = :month AND Year__c = :year AND Dealer_Account__c = :dealerIds];
            } else {
                dealerIncentives = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Payout_Achieved__c, Total_Additional_Payout_Predicted__c, Total_Additional_Payout_Achieved__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Month__c = :month AND Year__c = :year];
            }

            if(dealerIncentives?.size() > 0) {
                productTargets = [Select Id, Product_Category__c, Product_Category__r.Name, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_4WD_Predicted__c, Total_Retail_2WD_Predicted__c, Total_Retail_4WD_Achieved__c, Total_Retail_2WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c,SubCategory_Retail_Predicted__c, SubCategory_Retail_Achieved__c, SubCategory_Predicted_Payout__c, SubCategory_Actual_Payout_Achieved__c, DI_Product_Target_and_Achivement__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :dealerIncentives];
                if(productTargets?.size() > 0) {
                    kpiTargets = [Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Actual_Potential_Amount__c, Predicted_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, Growth_Predicted_KPI_Payout__c, Growth_Achieved_KPI_Payout__c, CE_Ratio_Predicted_Payout__c, CE_Ratio_Actual_Payout__c, CE_Ratio_YTD_Predicted_Payout__c, CE_Ratio_YTD_Actual_Payout__c, Quarter_Predicted_Percentage__c, Quarter_Actual_Percentage__c from DI_KPI_Achievement__c where DI_Product_Target_and_Achivement__c = :productTargets ORDER BY Product_KPI__r.Order_No__c];
                }

                for(Integer d = 0; d < dealerIncentives?.size(); d++) {
                    JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerWrap = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(dealerIncentives[d]);
                    List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> productTargetWrappers = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
                    for(Integer p = 0; p < productTargets?.size(); p++) {
                        if(productTargets[p].Dealer_Incentive__c == dealerIncentives[d].Id) {
                            JCBDealerIncentiveWrapper.ProductTargetAndAchievement productWrap = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(productTargets[p]);
                            List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements> kpiAchievementWrappers = new List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements>();
                            for(Integer k = 0; k < kpiTargets?.size(); k++) {
                                if(kpiTargets[k].DI_Product_Target_and_Achivement__c == productTargets[p].Id) {
                                    JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements(kpiTargets[k]);
                                    List<DI_Product_KPI__c> productKpis = prodANDKPI.get(productTargets[p].Product_Category__r.Name);
                                    for(Integer s = 0; s < productKpis?.size(); s++) {
                                        if(productKpis[s].Id == kpiTargets[k].Product_KPI__c) {
                                            JCBDealerIncentiveWrapper.ProductKPI pdk = new JCBDealerIncentiveWrapper.ProductKPI(productKpis[s]);
                                            kpiWrap.productKPI = pdk;
                                            break;
                                        }
                                    }
                                    kpiAchievementWrappers.add(kpiWrap);
                                }
                            }
                            productWrap.productKPIAndAchievements = kpiAchievementWrappers;
                            productTargetWrappers.add(productWrap);
                        }
                    }
                    dealerWrap.productTargetsAndAchievements = productTargetWrappers;
                    dealerInfoWrappers.add(dealerWrap);
                }
            }

            // Get Previous year data for Growth Incentive
            Integer prevYear = year - 1;
            List<Dealer_Incentive__c> previousDealers = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c,Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :prevYear AND Dealer_Account__c = :dealerIds];
            Map<String, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerWrappers = new Map<String, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>();
            if(previousDealers?.size() > 0) {
                List<DI_Product_Target_and_Achievement__c> prevProdTargets = [Select Id, Product_Category__c, Product_Category__r.Name,Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                (Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Predicted_Potential_Amount__c, Actual_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, Growth_Predicted_KPI_Payout__c, Growth_Achieved_KPI_Payout__c, CE_Ratio_Predicted_Payout__c, CE_Ratio_Actual_Payout__c, CE_Ratio_YTD_Predicted_Payout__c, CE_Ratio_YTD_Actual_Payout__c, Quarter_Predicted_Percentage__c, Quarter_Actual_Percentage__c from DI_KPI_Achievement__r ORDER BY Product_KPI__r.Order_No__c) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :previousDealers ORDER BY Product_Category__r.Order_No__c];
                Map<Id, List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>> prevProdMap = new Map<Id, List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>>();
                for(Integer i = 0; i < prevProdTargets?.size(); i++) {
                    if(prevProdMap.containsKey(prevProdTargets[i].Dealer_Incentive__c)) {
                        List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> pList = prevProdMap.get(prevProdTargets[i].Dealer_Incentive__c);
                        pList.add(new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(prevProdTargets[i]));
                        prevProdMap.put(prevProdTargets[i].Dealer_Incentive__c, pList);
                    } else {
                        JCBDealerIncentiveWrapper.ProductTargetAndAchievement prodWrap = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(prevProdTargets[i]);
                        prevProdMap.put(prevProdTargets[i].Dealer_Incentive__c, new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>{prodWrap});
                    }
                }
                for(Integer j = 0; j < previousDealers?.size(); j++) {
                    JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerWrap = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(previousDealers[j]);
                    dealerWrap.productTargetsAndAchievements = prevProdMap.get(previousDealers[j].Id);
                    dealerWrappers.put(dealerWrap.month, dealerWrap);
                }
            }
            
            List<DI_KPI_Target_And_Payout_Info__c> pt = [SELECT Id, Month__c, Year__c, KPI_Target__c,Type__c, Has_Slabs__c, DI_Product_KPI__c, KPI_Payout_Amount__c,  DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, Machine_Target__c,Previous_Month__c,Previous_Year__c, Sales_Person_Incentive_Target__c, Is_Salesman_Incentive__c, Is_Total_Volume_Industry__c, Growth__c, All_Machine_Retail__c, (Select Id, Slab_Range__c,Payout_Mode__c,  Amount__c, Payout_Percentage__c,Growth_Range__c,Slab_Type__c, DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Month__c = :month AND Year__c = :year ORDER BY DI_Product_KPI__r.Order_No__c];
            List<DI_KPI_Sub_Product_Payout__c> kpiSubPayouts = [SELECT Id, DI_Product_Sub_Category__c, DI_Product_Sub_Category__r.Name, DI_KPI_Target_And_Payout__c, Payout_Amount__c, Payout_Varies_By_Region__c, Payout_Varies_By_4WD__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c, (SELECT Id, Name, Payout_Amount__c, Zone_Name__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c FROM DI_Region_Payouts__r ORDER BY Zone_Name__c ASC) FROM DI_KPI_Sub_Product_Payout__c WHERE DI_KPI_Target_And_Payout__c IN :pt ORDER BY DI_Product_Sub_Category__r.Name];
            Map<Id, List<JCBDealerIncentiveWrapper.ProductPayoutInfo>> kpiSubPayoutMap = new Map<Id, List<JCBDealerIncentiveWrapper.ProductPayoutInfo>>();
            for(DI_KPI_Sub_Product_Payout__c kpiPayout : kpiSubPayouts) {
                JCBDealerIncentiveWrapper.ProductPayoutInfo kpiPayoutInfo = new JCBDealerIncentiveWrapper.ProductPayoutInfo(kpiPayout);
                if(kpiSubPayoutMap.containsKey(kpiPayout.DI_KPI_Target_And_Payout__c)) {
                    List<JCBDealerIncentiveWrapper.ProductPayoutInfo> payoutList = kpiSubPayoutMap.get(kpiPayout.DI_KPI_Target_And_Payout__c);
                    payoutList.add(kpiPayoutInfo);
                    kpiSubPayoutMap.put(kpiPayout.DI_KPI_Target_And_Payout__c, payoutList);
                } else {
                    kpiSubPayoutMap.put(kpiPayout.DI_KPI_Target_And_Payout__c, new List<JCBDealerIncentiveWrapper.ProductPayoutInfo>{kpiPayoutInfo});
                }
            }
            if(pt?.size() > 0){
                for(DI_KPI_Target_And_Payout_Info__c ptp : pt) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(ptp);
                    kpiWrap.productPayouts = kpiSubPayoutMap.get(ptp.Id);
                    prodTargetAndPayoutInfo.add(kpiWrap);
                }
            }
            List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargetWrappers = JCBDealerIncentiveController.getMultiKPITargets(month, year);
            resultMap=new Map<String,Object>();
            resultMap.put('prodTargetAndPayoutInfo', prodTargetAndPayoutInfo);
            resultMap.put('dealerInfoWrappers', dealerInfoWrappers);
            resultMap.put('prevDealerWrappers',dealerWrappers);
            resultMap.put('multiKpitargetInfo',productTargetWrappers);
            calculateActualPayout(resultMap);
        } catch(Exception e) {
            throw e;
        }
    }

    public static void calculateActualPayout(Map<String, Object> resultMap) {

        List<DI_KPI_Achievement__c> updateKPIAchievements = new List<DI_KPI_Achievement__c>();
        List<DI_SubCategory_Target_and_Achievement__c> updateSubTarget = new List<DI_SubCategory_Target_and_Achievement__c>();
        List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();

        List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerInfoWrappers = (List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>) resultMap.get('dealerInfoWrappers');
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> prodTargetAndPayoutInfo = (List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>) resultMap.get('prodTargetAndPayoutInfo');
        prevDealerWrappers = (Map<String, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>) resultMap.get('prevDealerWrappers');
        List<JCBDealerIncentiveWrapper.ProductTargetWrapper> multiKpiTargetPayouts = (List<JCBDealerIncentiveWrapper.ProductTargetWrapper>)resultMap.get('multiKpitargetInfo');
        prodTargetAndPayout = new Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>>();
        prodAddTargetAndPayout = new Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>>();
        growthTargetAndPayout = new Map<String, List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>>();
        for(Integer k = 0; k < prodTargetAndPayoutInfo?.size(); k++) {
            String productName = prodTargetAndPayoutInfo[k] != null && prodTargetAndPayoutInfo[k].productKPI != null ? prodTargetAndPayoutInfo[k].productKPI.productName : '';
            if(prodTargetAndPayoutInfo[k].type == 'KPI Target') {
                if(prodTargetAndPayout.containsKey(productName)) {
                    prodTargetAndPayout.get(productName).add(prodTargetAndPayoutInfo[k]);
                } else {
                    prodTargetAndPayout.put(productName, new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>{prodTargetAndPayoutInfo[k]});
                }
            } else if(prodTargetAndPayoutInfo[k].type == 'Additional Incentive Target') {
                if(prodAddTargetAndPayout.containsKey(productName)) {
                    prodAddTargetAndPayout.get(productName).add(prodTargetAndPayoutInfo[k]);
                } else {
                    prodAddTargetAndPayout.put(productName, new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>{prodTargetAndPayoutInfo[k]});
                }
            } else if(prodTargetAndPayoutInfo[k].type == 'Growth Additional Incentive') {
                if(growthTargetAndPayout.containsKey(productName)) {
                    growthTargetAndPayout.get(productName).add(prodTargetAndPayoutInfo[k]);
                } else {
                    growthTargetAndPayout.put(productName, new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>{prodTargetAndPayoutInfo[k]});
                }
            }
        }

        if(dealerInfoWrappers != null && dealerInfoWrappers?.size() > 0) {
            List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
            for(Integer e = 0; e < dealerInfoWrappers?.size(); e++) {
                zoneName = dealerInfoWrappers[e].dealerRegion;
                dealerTargetAndPayoutInfo = dealerInfoWrappers[e];
                List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> productVolumeInfo = dealerInfoWrappers[e].productTargetsAndAchievements;
                Dealer_Incentive__c dealerInc = new Dealer_Incentive__c();
                if(productVolumeInfo != null && productVolumeInfo?.size() > 0) {
                    dealerInfoWrappers[e].totalProdPayoutAchieved = 0;
                    dealerInfoWrappers[e].totalAddPayoutAchieved = 0;
                    dealerInfoWrappers[e].totalPayoutReceived = 0;
                    dealerInfoWrappers[e].totalProdPayoutPredicted = 0;
                    dealerInfoWrappers[e].totalAddPayoutPredicted = 0;
                    dealerInfoWrappers[e].totalPayoutPredicted = 0;
                    dealerInfoWrappers[e].totalDealerPayoutAchieved = 0;
                    dealerInfoWrappers[e].totalSPersonPayoutAchieved = 0;
                    dealerInfoWrappers[e].additionalPayoutAchieved = 0;
                    dealerInfoWrappers[e].growthPayoutAchieved = 0;
                    dealerInfoWrappers[e].multiKpiPayoutAchieved = 0;
                    dealerInfoWrappers[e].totalTIVPayoutAchieved = 0;

                    for(Integer i = 0; i < productVolumeInfo?.size(); i++) {
                        subCategoryTarget = productVolumeInfo[i].subTargetAndAchievement;
                        demoTarget = productVolumeInfo[i].demoTarget;
                        String productName = productVolumeInfo[i].productName;
                        product = productVolumeInfo[i];
                        subProdKPIPayout = new Map<String, List<Map<String, Object>>>();
                        kpiAchievements = productVolumeInfo[i].productKPIAndAchievements;
                        List<DI_KPI_Achievement__c> updatedAchievements = new List<DI_KPI_Achievement__c>();
                        product.totalProductActualPayout = 0;
                        product.totalAddActualPayout = 0;
                        product.totalProductPredictedPayout = 0;
                        product.totalAddPredictedPayout = 0;
                        product.totalSPersonPredictedPayout = 0;
                        product.totalSPersonActualPayout = 0;
                        product.additionalActualPayout = 0;
                        product.growthActualPayout = 0;
                        product.multiKpiActualPayout = 0;

                        JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiTarget;
                        JCBDealerIncentiveWrapper.ProductKPIAndPayout addKpiTarget;
                        JCBDealerIncentiveWrapper.ProductKPIAndPayout growthKpiTarget;
                        salesPersonConfigured = false;
                        if(prodANDKPI.get(productName) != null && prodANDKPI.get(productName)?.size() > 0) {
                            selectedProdAndKpis = prodANDKPI.get(productName);
                            for(Integer a = 0; a < selectedProdAndKpis?.size(); a++) {
                                if(prodTargetAndPayout != null && prodTargetAndPayout.get(productName) != null && prodTargetAndPayout.get(productName)?.size() > 0) {
                                    for(Integer b = 0; b < prodTargetAndPayout.get(productName)?.size(); b++) {
                                        if(prodTargetAndPayout.get(productName)[b].productKPI.productKPIId == selectedProdAndKpis[a].Id) {
                                            kpiTarget = prodTargetAndPayout.get(productName)[b];
                                            break;
                                        }
                                    }
                                }
                                if(prodAddTargetAndPayout != null && prodAddTargetAndPayout.get(productName) != null && prodAddTargetAndPayout.get(productName)?.size() > 0) {
                                    for(Integer c = 0; c < prodAddTargetAndPayout.get(productName)?.size(); c++) {
                                        if(prodAddTargetAndPayout.get(productName)[c].productKPI.productKPIId == selectedProdAndKpis[a].Id) {
                                            addKpiTarget = prodAddTargetAndPayout.get(productName)[c];
                                            break;
                                        }
                                    }
                                }
                                if(growthTargetAndPayout != null && growthTargetAndPayout.get(productName) != null && growthTargetAndPayout.get(productName)?.size() > 0) {
                                    for(Integer c = 0; c < growthTargetAndPayout.get(productName)?.size(); c++) {
                                        if(growthTargetAndPayout.get(productName)[c].productKPI.productKPIId == selectedProdAndKpis[a].Id) {
                                            growthKpiTarget = growthTargetAndPayout.get(productName)[c];
                                            break;
                                        }
                                    }
                                }

                                System.debug('product KPI ---->    ' +selectedProdAndKpis[a].Id);
                                if(kpiTarget != null || addKpiTarget != null || growthKpiTarget != null) {
                                    System.debug('available target ---->   ' +selectedProdAndKpis[a].Id);
                                    JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAchievement;
                                    for(Integer j = 0; j < kpiAchievements?.size(); j++) {
                                        if(kpiAchievements[j] != null && kpiAchievements[j].productKPI != null && kpiAchievements[j].productKPI.productKPIId == selectedProdAndKpis[a].Id) {
                                            kpiAchievement = kpiAchievements[j];
                                        }
                                    }
                                    if(kpiAchievement == null) {
                                        kpiAchievement = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements();
                                        kpiAchievement.productKPI = new JCBDealerIncentiveWrapper.ProductKPI(selectedProdAndKpis[a]);
                                        System.debug('kpiAchievement ****    ' +kpiAchievement);
                                    }
                                    if(isActualMode) {
                                        if(kpiAchievement.productKPI != null && kpiAchievement.productKPI.kpiName.contains('Volume')) {
                                            kpiAchievement.achievedKPIPerncentage = product.totalRetailTarget > 0 && product.totalRetailAchieved > 0 ? (product.totalRetailAchieved / product.totalRetailTarget) * 100 : 0;
                                        }
                                        if(kpiAchievement.productKPI != null && kpiAchievement.productKPI.kpiName.contains('4WD')) {
                                            kpiAchievement.achievedKPIPerncentage = product.total4WDRetailAchieved > 0 && product.totalRetailAchieved > 0 ? (product.total4WDRetailAchieved / product.totalRetailAchieved) * 100 : 0;
                                        }
                                        if(kpiAchievement.productKPI != null && kpiAchievement.productKPI.kpiName.contains('Demo')) {
                                            kpiAchievement.achievedKPIPerncentage = product.demoTarget != null && product.demoTarget > 0 && product.demoConductedActual != null && product.demoConductedActual > 0 ? (product.demoConductedActual / product.demoTarget) * 100 : 0;
                                        }
                                    }
                                    DI_KPI_Achievement__c kpiAch = new DI_KPI_Achievement__c();
                                    kpiAch.Id = kpiAchievement.kpiAchievementId;
                                    if(isActualMode || !isActualMode) {
                                        kpiAchievement.achievedKPIPayout = calculateActualKPIPayout(kpiAchievement, productName).achievedKPIPayout;
                                        System.debug('kpiAchievement.achievedKPIPayout ---->    ' +kpiAchievement.achievedKPIPayout);
                                        kpiAchievement.addAchievedKPIPayout = calculateAddActualKPIPayout(kpiAchievement, productName).addAchievedKPIPayout;
                                        kpiAchievement.growthAchievedKPIPayout = calculateGrowthActualKPIPayout(kpiAchievement, productName, growthKpiTarget).growthAchievedKPIPayout;
                                        kpiAch.Achieved_KPI_Payout__c = kpiAchievement.achievedKPIPayout;
                                        kpiAch.Additional_Achieved_KPI_Payout__c = kpiAchievement.addAchievedKPIPayout;
                                        kpiAch.Growth_Achieved_KPI_Payout__c = kpiAchievement.growthAchievedKPIPayout;
                                        kpiAch.Achieved_KPI_Perncentage__c = kpiAchievement.achievedKPIPerncentage;
                                        kpiAch.Product_KPI__c = kpiAchievement.productKPI.productKPIId;
                                        kpiAch.DI_Product_Target_and_Achivement__c = productVolumeInfo[i].productTargetAndAchievementId;
                                        if(kpiAchievement.productKPI.isCalcPayout){
                                            product.totalProductActualPayout += kpiAchievement.achievedKPIPayout != null ? kpiAchievement.achievedKPIPayout : 0;
                                            product.additionalActualPayout += kpiAchievement.addAchievedKPIPayout != null ? kpiAchievement.addAchievedKPIPayout : 0;
                                            product.growthActualPayout += kpiAchievement.growthAchievedKPIPayout != null ? kpiAchievement.growthAchievedKPIPayout : 0;
                                        } else if(kpiAchievement.productKPI.kpiName.contains('Sales Person')) {
                                            product.totalSPersonActualPayout = kpiAchievement.achievedKPIPayout != null ? kpiAchievement.achievedKPIPayout : 0;
                                        }
                                    }
                                    System.debug('kpiAch ----    ' +kpiAch);
                                    updatedAchievements.add(kpiAch);
                                    updateKPIAchievements.add(kpiAch);
                                }
                            }
                        }
                        for(Integer k = 0; k < subCategoryTarget?.size(); k++) {
                            Decimal payoutAmount = 0;
                            for(String kpiId : subProdKPIPayout.keySet()) {
                                for(Integer l = 0; l < subProdKPIPayout.get(kpiId)?.size(); l++) {
                                    Map<String, Object> subPayout = subProdKPIPayout.get(kpiId)[l];
                                    if(subPayout.get('subProductId') == subCategoryTarget[k].subProductId) {
                                        payoutAmount += (Decimal) subPayout.get('payout');
                                        break;
                                    }
                                }
                            }
                            subCategoryTarget[k].subCategoryAchievedPayout = payoutAmount;
                            DI_SubCategory_Target_and_Achievement__c subTarget = new DI_SubCategory_Target_and_Achievement__c();
                            subTarget.Id = subCategoryTarget[k].subTargetAndAchievementId;
                            subTarget.SubCategory_Actual_Payout_Achieved__c = subCategoryTarget[k].subCategoryAchievedPayout;
                            updateSubTarget.add(subTarget);
                        }
                        DI_Product_Target_and_Achievement__c prod = new DI_Product_Target_and_Achievement__c();
                        prod.Id = product.productTargetAndAchievementId;
                        if(isActualMode || !isActualMode) {
                            JCBDealerIncentiveWrapper.ProductTargetWrapper prodMultiTarget;
                            for(Integer m = 0; m < multiKpiTargetPayouts?.size(); m++) {
                                if(multiKpiTargetPayouts[m].productCategory.name == product.productName) {
                                    prodMultiTarget = multiKpiTargetPayouts[m];
                                    break;
                                }
                            }

                            if(prodMultiTarget != null) {
                                List<JCBDealerIncentiveWrapper.DIMultiWrapper> multiKPITargets = prodMultiTarget.multiKpi;
                                if(multiKPITargets?.size() > 0) {
                                    prod = calculateMultiKpiPayout(prod, multiKPITargets, updatedAchievements);
                                }
                            }
                            prod.Total_Retail_Achieved__c = product.totalRetailAchieved;
                            prod.Total_Product_Actual_Payout__c = product.totalProductActualPayout;
                            prod.Additional_Actual_Payout__c = product.additionalActualPayout;
                            prod.Growth_Actual_Payout__c = product.growthActualPayout;
                            prod.Total_Additional_Actual_Payout__c = product.additionalActualPayout + product.growthActualPayout;
                            prod.Total_Additional_Actual_Payout__c += prod.Multi_KPI_Actual_Payout__c != null ? prod.Multi_KPI_Actual_Payout__c : 0;
                            prod.Total_Dealer_Actual_Payout__c = prod.Total_Product_Actual_Payout__c + prod.Total_Additional_Actual_Payout__c;
                            
                            isTIVConfigured = false;
                            prod.TIV_Actual_Payout__c = calculateTIVPayout(productName, updatedAchievements, prod.Total_Dealer_Actual_Payout__c);
                            prod.Total_Sales_Person_Actual_Payout__c = product.totalSPersonActualPayout;
                            if(isTIVConfigured) {
                                prod.Total_Actual_Payout__c = prod.TIV_Actual_Payout__c + prod.Total_Sales_Person_Actual_Payout__c;
                            } else {
                                prod.Total_Actual_Payout__c = prod.Total_Dealer_Actual_Payout__c + prod.Total_Sales_Person_Actual_Payout__c;
                            }
                            if(product.incentiveStatus == 'Eligible') {
                                dealerInfoWrappers[e].totalProdPayoutAchieved += product.totalProductActualPayout != null ? product.totalProductActualPayout : 0;
                                dealerInfoWrappers[e].additionalPayoutAchieved += product.additionalActualPayout;
                                dealerInfoWrappers[e].growthPayoutAchieved += product.growthActualPayout;
                                dealerInfoWrappers[e].multiKpiPayoutAchieved += prod.Multi_KPI_Actual_Payout__c != null ? prod.Multi_KPI_Actual_Payout__c : 0;
                                dealerInfoWrappers[e].totalAddPayoutAchieved = dealerInfoWrappers[e].additionalPayoutAchieved + dealerInfoWrappers[e].growthPayoutAchieved + dealerInfoWrappers[e].multiKpiPayoutAchieved;
                                dealerInfoWrappers[e].totalDealerPayoutAchieved += prod.Total_Dealer_Actual_Payout__c != null ? prod.Total_Dealer_Actual_Payout__c : 0;
                                dealerInfoWrappers[e].totalTIVPayoutAchieved += prod.TIV_Actual_Payout__c != null ? prod.TIV_Actual_Payout__c : 0;
                                if(isTIVConfigured) {
                                    dealerInfoWrappers[e].totalPayoutReceived += prod.TIV_Actual_Payout__c != null ? prod.TIV_Actual_Payout__c : 0;
                                } else {
                                    dealerInfoWrappers[e].totalPayoutReceived += prod.Total_Dealer_Actual_Payout__c != null ? prod.Total_Dealer_Actual_Payout__c : 0;
                                }
                            }
                            dealerInfoWrappers[e].totalSPersonPayoutAchieved += prod.Total_Sales_Person_Actual_Payout__c != null ? prod.Total_Sales_Person_Actual_Payout__c : 0;
                            dealerInfoWrappers[e].totalPayoutReceived += prod.Total_Sales_Person_Actual_Payout__c != null ? prod.Total_Sales_Person_Actual_Payout__c : 0;
                        }
                        productTargets.add(prod);
                    }
                    dealerInc.Id = dealerInfoWrappers[e].recordId;
                    if(isActualMode || !isActualMode) {
                        dealerInc.Total_Product_Payout_Achieved__c = dealerInfoWrappers[e].totalProdPayoutAchieved;
                        dealerInc.Additional_Payout_Achieved__c = dealerInfoWrappers[e].additionalPayoutAchieved;
                        dealerInc.Growth_Payout_Achieved__c = dealerInfoWrappers[e].growthPayoutAchieved;
                        dealerInc.Multi_KPI_Payout_Achieved__c = dealerInfoWrappers[e].multiKpiPayoutAchieved;
                        dealerInc.Total_Additional_Payout_Achieved__c = dealerInfoWrappers[e].totalAddPayoutAchieved;
                        dealerInc.Total_Dealer_Payout_Achieved__c = dealerInfoWrappers[e].totalDealerPayoutAchieved;
                        dealerInc.TIV_Payout_Achieved__c = dealerInfoWrappers[e].totalTIVPayoutAchieved;
                        dealerInc.Total_Sales_Person_Payout_Achieved__c = dealerInfoWrappers[e].totalSPersonPayoutAchieved;
                        dealerInc.Total_Payout_Achieved__c = dealerInfoWrappers[e].totalPayoutReceived;
                    }
                    dealerIncentives.add(dealerInc);
                }
            }
            if(updateKPIAchievements?.size() > 0) {
                System.debug('updateKPIAchievements ---   ' +updateKPIAchievements);
                upsert updateKPIAchievements;
            }
            if(updateSubTarget?.size() > 0) {
                update updateSubTarget;
            }
            if(productTargets?.size() > 0) {
                update productTargets;
            }
            if(dealerIncentives != null && dealerIncentives?.size() > 0) {
                update dealerIncentives;
            }
        }
    }

    public static DI_Product_Target_and_Achievement__c calculateMultiKpiPayout(DI_Product_Target_and_Achievement__c product, List<JCBDealerIncentiveWrapper.DIMultiWrapper> multiKpi, List<DI_KPI_Achievement__c> productKPIList) {
        product.Multi_KPI_Actual_Payout__c = 0 ;
        for (Integer i = 0; i < multiKpi?.size(); i++) {
            List<JCBDealerIncentiveWrapper.slabInfo> slabs = multiKpi[i].multiKpSlabs;
            List<Boolean> conditionList = new List<Boolean>();
            for (Integer j = 0; j < slabs?.size(); j++) {
                DI_KPI_Achievement__c kpi;
                for(Integer k = 0; k < productKPIList?.size(); k++) {
                    Id prodKPIId = slabs[j] != null && slabs[j].productKPI != null ? slabs[j].productKPI.productKPIId : '';
                    if(productKPIList[k].Product_KPI__c == prodKPIId) {
                        kpi = productKPIList[k];
                        break;
                    }
                }
                Decimal achieved = kpi != null ? kpi.Achieved_KPI_Perncentage__c != null && kpi.Achieved_KPI_Perncentage__c > 0 ? kpi.Achieved_KPI_Perncentage__c : 0 : 0;
                conditionList.add(validateTargetCondition(achieved, slabs[j].slabRange));
            }
            if(conditionList != null && conditionList?.size() > 0) {
                if (multiKpi[i].conditionLogic == 'AND') {
                    Boolean isAnd = true;
                    for (Integer k = 0; k < conditionList?.size(); k++) {
                        if (!conditionList[k]) {
                            product.Multi_KPI_Actual_Payout__c = product.Multi_KPI_Actual_Payout__c != null && product.Multi_KPI_Actual_Payout__c > 0 ? product.Multi_KPI_Actual_Payout__c : 0;
                            isAnd = false;
                            break;
                        }
                    }
                    if (isAnd) {
                        Decimal amt = dealerTargetAndPayoutInfo.totalRetailAchieved > 0 ? (dealerTargetAndPayoutInfo.totalRetailAchieved * multiKpi[i].incentiveAmount).setScale(2) : 0;
                        product.Multi_KPI_Actual_Payout__c = product.Multi_KPI_Actual_Payout__c != null && product.Multi_KPI_Actual_Payout__c > 0 ? product.Multi_KPI_Actual_Payout__c + amt : amt;
                    }
                } else if (multiKpi[i].conditionLogic == 'OR') {
                    Boolean isOr = true;
                    for (Integer k = 0; k < conditionList?.size(); k++) {
                        if (conditionList[k]) {
                            Decimal amt = dealerTargetAndPayoutInfo.totalRetailAchieved > 0 ? (dealerTargetAndPayoutInfo.totalRetailAchieved * multiKpi[i].incentiveAmount).setScale(2) : 0;
                            product.Multi_KPI_Actual_Payout__c = product.Multi_KPI_Actual_Payout__c != null && product.Multi_KPI_Actual_Payout__c > 0 ? product.Multi_KPI_Actual_Payout__c + amt : amt;
                            isOr = false;
                            break;
                        }
                    }
                    if (isOr) {
                        product.Multi_KPI_Actual_Payout__c = product.Multi_KPI_Actual_Payout__c != null && product.Multi_KPI_Actual_Payout__c > 0 ? product.Multi_KPI_Actual_Payout__c : 0;
                    }
                }
            }
        }
    
        return product;
    }

    public static JCBDealerIncentiveWrapper.ProductKPIAndAchievements calculateActualKPIPayout(JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAchievement, String productName) {
        Decimal payoutAmount = 0;
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> productKPIAndPayout = prodTargetAndPayout.get(productName);
        if(productKPIAndPayout != null && productKPIAndPayout?.size() > 0) {
            for(Integer i = 0; i < productKPIAndPayout?.size(); i++) {
                JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiTarget = productKPIAndPayout[i];
                productPayouts = kpiTarget.productPayouts;
                if(kpiAchievement.productKPI.kpiId == kpiTarget.productKPI.kpiId) {
                    System.debug('salesPersonConfigured ****    ' +salesPersonConfigured);
                    if(kpiAchievement.productKPI != null && !kpiAchievement.productKPI.kpiName.contains('Sales Person')) {
                        if(kpiTarget.hasSlabs && kpiTarget.slabInfo?.size() > 0) {
                            Boolean isEligibleActual = false;
                            // Boolean isEligiblePredicted = false;
                            for(Integer j = 0; j < kpiTarget.slabInfo?.size(); j++) {
                                if(isActualMode || !isActualMode) {
                                    System.debug('kpiAchievement ---  ' +kpiAchievement);
                                    if(validateTargetCondition(kpiAchievement.achievedKPIPerncentage, kpiTarget.slabInfo[j].slabRange)) {
                                        if (kpiTarget.slabInfo[j].payoutMode != 'Amt') {
                                            Decimal percentage;
                                            if(kpiTarget.slabInfo[j].payoutMode != 'proRata') {
                                                percentage = Decimal.valueOf(kpiTarget.slabInfo[j].payoutPercentage);
                                            } else {
                                                percentage = kpiAchievement.achievedKPIPerncentage;
                                            }
                                            kpiAchievement.achievedKPIPayout = (getPayoutAmount(kpiAchievement) * (percentage / 100)).setScale(2);
                                        } else {
                                            System.debug('is amount');
                                            System.debug('product.totalRetailAchieved ---->   ' +product.totalRetailAchieved);
                                            System.debug('kpiTarget.slabInfo[j].amount ---->    ' +kpiTarget.slabInfo[j].amount);
                                            kpiAchievement.achievedKPIPayout = product.totalRetailAchieved != null && kpiTarget.slabInfo[j].amount != null ? (product.totalRetailAchieved * kpiTarget.slabInfo[j].amount).setScale(2) : 0;
                                        }
                                        isEligibleActual = true;
                                        break;
                                    }
                                }
                                // if(isEligibleActual && isEligiblePredicted) {
                                //     break;
                                // }
                            }
                            if(!isEligibleActual) {
                                    kpiAchievement.achievedKPIPayout = 0;
                            }
                            // if(!isEligiblePredicted) {
                            //     kpiAchievement.predictedKPIPayout = 0;
                            // }
                        } else {
                            if(isActualMode || !isActualMode) {
                                if(kpiTarget.target != null && validateTargetCondition(kpiAchievement.achievedKPIPerncentage, kpiTarget.target) ) {
                                    kpiAchievement.achievedKPIPayout = (getPayoutAmount(kpiAchievement)).setScale(2);
                                }else{
                                    kpiAchievement.achievedKPIPayout = 0;
                                }
                            }
                        }
                        // Sales Person Incentive Configure
                        if (kpiTarget.isSalesmanIncentive && kpiTarget.salesPersonTarget != null) {
                            System.debug('--- sales person ---');
                            for (Integer l = 0; l < productKPIAndPayout?.size(); l++) {
                                if (productKPIAndPayout[l].productKPI.kpiName.contains('Sales Person')) {
                                    productPayouts = productKPIAndPayout[l].productPayouts;
                                    break;
                                }
                            }
                            Integer salesIndex;
                            JCBDealerIncentiveWrapper.ProductKPIAndAchievements salesAchievement;
                            if(kpiAchievements != null && kpiAchievements?.size() > 0) {
                                for (Integer p = 0; p < kpiAchievements?.size(); p++) {
                                    if (kpiAchievements[p] != null && kpiAchievements[p].productKPI != null && kpiAchievements[p].productKPI.kpiName.contains('Sales Person')) {
                                        salesAchievement = kpiAchievements[p];
                                        salesIndex = p;
                                        break;
                                    }
                                }
                            }
                            if(!(salesIndex >= 0 && salesAchievement !=null)) {
                                salesAchievement = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements();
                                for(Integer s = 0; s < selectedProdAndKpis?.size(); s++) {
                                    if(selectedProdAndKpis[s].KPI__r.Name.contains('Sales Person')) {
                                        salesAchievement.productKPI = new JCBDealerIncentiveWrapper.ProductKPI(selectedProdAndKpis[s]);
                                    }
                                }
                            }
                            salesPersonConfigured = true;
                            Decimal targetPercent = extractTargetNumValue(kpiTarget.salesPersonTarget);
                            Decimal salesAchievedPercent = kpiAchievement.achievedKPIPerncentage != null && targetPercent != null ? (kpiAchievement.achievedKPIPerncentage / targetPercent) * 100 : 0;
                            Decimal salesPredictedPercent = kpiAchievement.predictedKPIPercentage != null && targetPercent != null ? (kpiAchievement.predictedKPIPercentage / targetPercent) * 100 : 0;
                            System.debug('kpiTarget.slabInfo size ---->    ' +kpiTarget.slabInfo?.size());
                            if (kpiTarget.slabInfo?.size() > 0) {
                                List<JCBDealerIncentiveWrapper.SlabInfo> slabs = kpiTarget.slabInfo;
                                Boolean isEligibleActual = false;
                                // Boolean isEligiblePredicted = false;
                                for (Integer s = 0; s < slabs?.size(); s++) {
                                    if (slabs[s].slabType == 'Salesperson Incentive') {
                                        System.debug('slabs[s].slabRange ---->    ' +slabs[s].slabRange);
                                        System.debug('salesAchievedPercent ---->    ' +salesAchievedPercent);
                                        if(isActualMode || !isActualMode) {
                                            if (validateTargetCondition(salesAchievedPercent, slabs[s].slabRange)) {
                                                isEligibleActual = true;
                                                if (slabs[s].payoutMode != 'Amt') {
                                                    if (slabs[s].payoutMode != 'proRata') {
                                                        salesAchievement.achievedKPIPerncentage = salesAchievedPercent;
                                                        salesAchievement.achievedKPIPayout = getPayoutAmount(salesAchievement) * (slabs[s].payoutPercentage / 100);
                                                        System.debug('salesAchievement.achievedKPIPayout ---->   ' +salesAchievement.achievedKPIPayout);
                                                    } else {
                                                        Decimal proRataPercent = kpiAchievement.achievedKPIPerncentage / 100;
                                                        salesAchievement.achievedKPIPayout = getPayoutAmount(salesAchievement) * proRataPercent;
                                                    }
                                                } else {
                                                    salesAchievement.achievedKPIPayout = product.totalRetailAchieved * slabs[s].amount;
                                                }
                                                break;
                                            }
                                        }
                                        // if(isEligibleActual && isEligiblePredicted) {
                                        //     break;
                                        // }
                                    }
                                }
                                if (!isEligibleActual) {
                                    salesAchievement.achievedKPIPayout = 0;
                                }
                                // if (!isEligiblePredicted) {
                                //     salesAchievement.predictedKPIPayout = 0;
                                // }
                            }
                            if(!(salesIndex >= 0)) {
                                kpiAchievements.add(salesAchievement);
                            } else {
                                kpiAchievements[salesIndex] = salesAchievement;
                            }
                        }
                        // Sales Person Incentive Configure
                    } else if(kpiAchievement.productKPI.kpiName.contains('Sales Person') && !salesPersonConfigured) {
                        System.debug('not configure salesperson ****');
                        // // Sales Person Incentive Configure
                        // if (kpiTarget.isSalesmanIncentive && kpiTarget.salesPersonTarget != null) {
                        //     for (Integer l = 0; l < productKPIAndPayout?.size(); l++) {
                        //         if (productKPIAndPayout[l].productKPI.kpiName.contains('Sales Person')) {
                        //             productPayouts = productKPIAndPayout[l].productPayouts;
                        //             break;
                        //         }
                        //     }
                        //     Integer salesIndex;
                        //     JCBDealerIncentiveWrapper.ProductKPIAndAchievements salesAchievement;
                        //     if(kpiAchievements != null && kpiAchievements?.size() > 0) {
                        //         for (Integer p = 0; p < kpiAchievements?.size(); p++) {
                        //             if (kpiAchievements[p] != null && kpiAchievements[p].productKPI != null && kpiAchievements[p].productKPI.kpiName.contains('Sales Person')) {
                        //                 salesAchievement = kpiAchievements[p];
                        //                 salesIndex = p;
                        //                 break;
                        //             }
                        //         }
                        //     }
                        //     if(!(salesIndex >= 0 && salesAchievement !=null)) {
                        //         salesAchievement = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements();
                        //         for(Integer s = 0; s < selectedProdAndKpis?.size(); s++) {
                        //             if(selectedProdAndKpis[s].KPI__r.Name.contains('Sales Person')) {
                        //                 salesAchievement.productKPI = new JCBDealerIncentiveWrapper.ProductKPI(selectedProdAndKpis[s]);
                        //             }
                        //         }
                        //     }
                        //     salesPersonConfigured = true;
                        //     Decimal targetPercent = extractTargetNumValue(kpiTarget.salesPersonTarget);
                        //     Decimal salesAchievedPercent = kpiAchievement.achievedKPIPerncentage != null && targetPercent != null ? (kpiAchievement.achievedKPIPerncentage / targetPercent) * 100 : 0;
                        //     Decimal salesPredictedPercent = kpiAchievement.predictedKPIPercentage != null && targetPercent != null ? (kpiAchievement.predictedKPIPercentage / targetPercent) * 100 : 0;
                        //     if (kpiTarget.slabInfo?.size() > 0) {
                        //         List<JCBDealerIncentiveWrapper.SlabInfo> slabs = kpiTarget.slabInfo;
                        //         Boolean isEligibleActual = false;
                        //         Boolean isEligiblePredicted = false;
                        //         for (Integer s = 0; s < slabs?.size(); s++) {
                        //             if (slabs[s].slabType == 'Salesperson Incentive') {
                        //                 if(isActualMode || !isActualMode) {
                        //                     if (validateTargetCondition(salesAchievedPercent, slabs[s].slabRange)) {
                        //                         isEligibleActual = true;
                        //                         if (slabs[s].payoutMode != 'Amt') {
                        //                             if (slabs[s].payoutMode != 'proRata') {
                        //                                 salesAchievement.achievedKPIPerncentage = salesAchievedPercent;
                        //                                 salesAchievement.achievedKPIPayout = getPayoutAmount(salesAchievement) * (slabs[s].payoutPercentage / 100);
                        //                             } else {
                        //                                 Decimal proRataPercent = kpiAchievement.achievedKPIPerncentage / 100;
                        //                                 salesAchievement.achievedKPIPayout = getPayoutAmount(salesAchievement) * proRataPercent;
                        //                             }
                        //                         } else {
                        //                             salesAchievement.achievedKPIPayout = product.totalRetailAchieved * slabs[s].amount;
                        //                         }
                        //                     }
                        //                 }
                        //                 if(isEligibleActual && isEligiblePredicted) {
                        //                     break;
                        //                 }
                        //             }
                        //         }
                        //         if (!isEligibleActual) {
                        //             salesAchievement.achievedKPIPayout = 0;
                        //         }
                        //         if (!isEligiblePredicted) {
                        //             salesAchievement.predictedKPIPayout = 0;
                        //         }
                        //     }
                        //     if(!(salesIndex >= 0)) {
                        //         kpiAchievements.add(salesAchievement);
                        //     } else {
                        //         kpiAchievements[salesIndex] = salesAchievement;
                        //     }
                        // }
                        // // Sales Person Incentive Configure
                        if(isActualMode || !isActualMode) {
                            kpiAchievement.achievedKPIPayout = (getPayoutAmount(kpiAchievement)).setScale(2);
                            System.debug('sales incentive ---->    ' +kpiAchievement.achievedKPIPayout);
                        }
                    } else if(kpiAchievement.productKPI.kpiName.contains('Demo')) {
                        if(isActualMode || !isActualMode) {
                            if(product.demoConductedActual != null && demoTarget != null && product.demoConductedActual >= demoTarget) {
                                kpiAchievement.achievedKPIPayout = (getPayoutAmount(kpiAchievement)).setScale(2);
                            } else {
                                kpiAchievement.achievedKPIPayout = 0;
                            }
                        }
                    }
                    break;
                }
            }
        }
        return kpiAchievement;
    }

    public static Decimal calculateTIVPayout(String productName, List<DI_KPI_Achievement__c> updatedAchievements, Decimal dealerActualPayout) {
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> productKPIAndPayout = prodTargetAndPayout.get(productName);
        Decimal tivActualPayout = 0;
        if(productKPIAndPayout != null) {
            JCBDealerIncentiveWrapper.ProductKPIAndPayout tivTarget;
            for(Integer i = 0; i < productKPIAndPayout?.size(); i++) {
                if(productKPIAndPayout[i].isIndustryIncentive) {
                    tivTarget = productKPIAndPayout[i];
                    break;
                }
            }
            if(tivTarget != null && tivTarget.slabInfo != null && tivTarget.slabInfo?.size() > 0) {
                DI_KPI_Achievement__c kpiAch;
                if(updatedAchievements != null && updatedAchievements?.size() > 0) {
                    for(Integer m = 0; m < updatedAchievements?.size(); m++) {
                        if(updatedAchievements[m].Product_KPI__c == tivTarget.productKPI.productKPIId) {
                            kpiAch = updatedAchievements[m];
                            break;
                        }
                    }
                }
                if(kpiAch != null && kpiAch.Achieved_KPI_Perncentage__c > 0) {
                    List<JCBDealerIncentiveWrapper.SlabInfo> slabs = new List<JCBDealerIncentiveWrapper.SlabInfo>();
                    for(Integer j = 0; j < tivTarget.slabInfo?.size(); j++) {
                        if(tivTarget.slabInfo[j].slabType == 'Total Volume Industry Incentive') {
                            slabs.add(tivTarget.slabInfo[j]);
                        }
                    }
                    if(slabs?.size() > 0) {
                        isTIVConfigured = true;
                        for(Integer k = 0; k < slabs?.size(); k++) {
                            if(validateTargetCondition(kpiAch.Achieved_KPI_Perncentage__c, slabs[k].slabRange)) {
                                tivActualPayout = dealerActualPayout > 0 && slabs[k].payoutPercentage > 0 ? (dealerActualPayout * slabs[k].payoutPercentage).setScale(2) / 100 : 0;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return tivActualPayout;
    }

    public static JCBDealerIncentiveWrapper.ProductKPIAndAchievements calculateAddActualKPIPayout(JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAchievement, String productName) {
        Decimal payoutAmount = 0;
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> productKPIAndPayout = prodAddTargetAndPayout.get(productName) != null ? prodAddTargetAndPayout.get(productName) : new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        for(Integer i = 0; i < productKPIAndPayout?.size(); i++) {
            JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiTarget = productKPIAndPayout[i];
            productPayouts = kpiTarget.productPayouts;
            if(kpiAchievement.productKPI != null && !kpiAchievement.productKPI.kpiName.contains('Demo')) {
                if( kpiTarget != null && kpiAchievement.productKPI.kpiId == kpiTarget.productKPI.kpiId && (kpiTarget.target != null || kpiTarget.slabInfo?.size() > 0)) {
                    if(kpiTarget.hasSlabs && kpiTarget.slabInfo?.size() > 0) {
                        Boolean isEligibleActual = false;
                        // Boolean isEligiblePredicted = false;
                        for(Integer j = 0; j < kpiTarget.slabInfo?.size(); j++) {
                            if(isActualMode || !isActualMode) {
                                if(product.totalRetailAchieved != null && validateTargetCondition(kpiAchievement.achievedKPIPerncentage, kpiTarget.slabInfo[j].slabRange)) {
                                    isEligibleActual = true;
                                    kpiAchievement.addAchievedKPIPayout = (dealerTargetAndPayoutInfo.totalRetailAchieved * kpiTarget.slabInfo[j].amount).setScale(2);
                                    break;
                                }
                            }
                            // if(isEligibleActual == true && isEligiblePredicted == true) {
                            //     break;
                            // }
                        }
                        if(!isEligibleActual) {
                            kpiAchievement.addAchievedKPIPayout = 0;
                        }
                        // if(!isEligiblePredicted) {
                        //     kpiAchievement.addPredictedKPIPayout = 0;
                        // }
                    } else {
                        if(isActualMode || !isActualMode) {
                            if(validateTargetCondition(kpiAchievement.achievedKPIPerncentage, kpiTarget.target)) {
                                kpiAchievement.addAchievedKPIPayout = dealerTargetAndPayoutInfo.totalRetailAchieved != null && kpiTarget.incentiveAmount != null ? (dealerTargetAndPayoutInfo.totalRetailAchieved * kpiTarget.incentiveAmount).setScale(2) : 0;
                            } else if (kpiTarget.machineTarget?.size() > 0) {
                                Decimal actualDiff = product.totalRetailTarget != null && product.totalRetailAchieved != null ? (Integer) product.totalRetailAchieved - product.totalRetailTarget : 0.00;
                                for (Integer m = 0; m < kpiTarget.machineTarget?.size(); m++) {
                                    if (validateTargetCondition(actualDiff, kpiTarget.machineTarget[m].slabRange)) {
                                        kpiAchievement.addAchievedKPIPayout = (dealerTargetAndPayoutInfo.totalRetailAchieved * kpiTarget.machineTarget[m].amount).setScale(2);
                                        break;
                                    }
                                }
                            } 
                        }
                    }
                }
            }
        }
        return kpiAchievement;
    }

    public static JCBDealerIncentiveWrapper.ProductKPIAndAchievements calculateGrowthActualKPIPayout(JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAchievement, String productName, JCBDealerIncentiveWrapper.ProductKPIAndPayout growthKpiTarget) {
        Decimal payoutAmount = 0;
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> productKPIAndPayout = growthTargetAndPayout.get(productName) != null ? growthTargetAndPayout.get(productName) : new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper prevDealer = prevDealerWrappers != null ? prevDealerWrappers?.get(growthKpiTarget?.prevMonth) : new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper();
        List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> prevProdTargets = prevDealer != null ? prevDealer?.productTargetsAndAchievements : new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
        JCBDealerIncentiveWrapper.ProductTargetAndAchievement prodTarget = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement();
        for(Integer j = 0; j < prevProdTargets?.size(); j++) {
            if(prevProdTargets[j].productName == productName) {
                prodTarget = prevProdTargets[j];
                break;
            }
        }
        if(prodTarget != null) {
            List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements> kpiAchieves = prodTarget != null ? prodTarget.productKPIAndAchievements : new List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements>();
            JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAch = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements();
            if(kpiAchieves != null && kpiAchieves?.size() > 0) {
                for(Integer k = 0; k < kpiAchieves?.size(); k++) {
                    if(kpiAchieves[k]?.productKPI?.productKPIId == kpiAchievement?.productKPI?.productKPIId) {
                        kpiAch = kpiAchieves[k];
                        break;
                    }
                }
            }
            if(kpiAch != null) {
                Decimal currentPercent = kpiAchievement?.achievedKPIPerncentage != null && kpiAchievement?.achievedKPIPerncentage > 0 ? kpiAchievement?.achievedKPIPerncentage : 0;
                Decimal prevPercent = kpiAch?.achievedKPIPerncentage != null && kpiAch?.achievedKPIPerncentage > 0 ? kpiAch?.achievedKPIPerncentage : 0;
                Decimal growthDiff = currentPercent - prevPercent;
                if (growthKpiTarget != null && growthKpiTarget?.hasSlabs && growthKpiTarget?.slabInfo?.size() > 0) {
                    List<JCBDealerIncentiveWrapper.slabInfo> slabs = growthKpiTarget?.slabInfo;
                    Boolean isEligible = false;
                    for (Integer s = 0; s < slabs?.size(); s++) {
                        if (validateTargetCondition(kpiAch.achievedKPIPerncentage, slabs[s].slabRange) && validateTargetCondition(growthDiff, slabs[s].growthRange)) {
                            kpiAchievement.growthAchievedKPIPayout = dealerTargetAndPayoutInfo.totalRetailAchieved != null ? (dealerTargetAndPayoutInfo.totalRetailAchieved * slabs[s].amount).setScale(2) : 0;
                            isEligible = true;
                            break;
                        }
                    }
                    if (!isEligible) {
                        kpiAchievement.growthAchievedKPIPayout = 0;
                    }
                } else {
                    kpiAchievement.growthAchievedKPIPayout = 0;
                }
            }
        }
        return kpiAchievement;
    }

    public static Boolean validateTargetCondition(Decimal achievedPercent, String slabRange) {
        if(slabRange != null){
            Boolean hasRange = slabRange != null ? slabRange.contains('to') : false;
            List<String> inputs = slabRange != null ? slabRange.split(' ') : new List<String>();
            if(inputs?.size() > 0) {
                if(hasRange) {
                    Decimal leftOperand = achievedPercent;
                    String operator1 = inputs[0];
                    Decimal rightOperand1 = Decimal.valueOf(inputs[1]);
                    String operator2 = inputs[3];
                    Decimal rightOperand2 = Decimal.valueOf(inputs[4]);
                    Boolean range1 = checkOperator(leftOperand , operator1, rightOperand1);
                    Boolean range2 = checkOperator(leftOperand, operator2, rightOperand2);
                    if(range1 && range2) {
                        return true;
                    } else {
                        return false;
                    }
                } else{
                    Decimal leftOperand = achievedPercent;
                    String operator = inputs[0];
                    Decimal rightOperand = inputs[1] != null ? Decimal.valueOf(inputs[1]) : 0.00;
                    if(leftOperand != null && rightOperand != null && operator != null) {
                        return checkOperator(leftOperand, operator, rightOperand);
                    }else{
                        return false;
                    }
                }
            } else {
                return false;
            }
        }else{
            return false;
        }
    }

    public static Boolean checkOperator(Decimal leftOperand, String operator, Decimal rightOperand) {
        if(operator == '>') {
            return leftOperand > rightOperand;
        } else if(operator == '<') {
            return leftOperand < rightOperand;
        } else if(operator == '>=') {
            return leftOperand >= rightOperand;
        } else if(operator == '<=') {
            return leftOperand <= rightOperand;
        } else if(operator == '==') {
            return leftOperand == rightOperand;
        }
        return false;
    }

    public static Decimal getPayoutAmount(JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiAchievement) {
        Decimal totalPayout = 0;
        List<Map<String, Object>> subPayout = new List<Map<String, Object>>();
        if(productPayouts != null && productPayouts?.size() > 0) {
            for(Integer i = 0; i < productPayouts?.size(); i++) {
                if(subCategoryTarget != null && subCategoryTarget?.size() > 0) {
                    for(Integer j = 0; j < subCategoryTarget?.size(); j++) {
                        if(kpiAchievement.productKPI != null) {
                            if(subCategoryTarget[j].subProductId == productPayouts[i].subProductId) {
                                Decimal payoutAmount = 0;
                                Decimal twoWDPayoutAmount = 0;
                                Decimal fourWDPayoutAmount = 0;
                                Decimal subAmt = 0;
                                if(productPayouts[i].variesByRegion && productPayouts[i].regionPayout != null && productPayouts[i].regionPayout?.size() > 0) {
                                    for(Integer k = 0; k < productPayouts[i].regionPayout?.size(); k++) {
                                        if(productPayouts[i].regionPayout[k].region == zoneName) {
                                            payoutAmount = productPayouts[i].regionPayout[k].amount != null ? (Decimal) productPayouts[i].regionPayout[k].amount : 0;
                                            twoWDPayoutAmount = productPayouts[i].regionPayout[k].twoWDPayoutAmount != null ? (Decimal) productPayouts[i].regionPayout[k].twoWDPayoutAmount : 0;
                                            fourWDPayoutAmount = productPayouts[i].regionPayout[k].fourWDPayoutAmount != null ? (Decimal) productPayouts[i].regionPayout[k].fourWDPayoutAmount : 0;
                                        }
                                    }   
                                } else {
                                    payoutAmount = productPayouts[i].payoutAmount != null ? (Decimal) productPayouts[i].payoutAmount : 0;
                                    twoWDPayoutAmount = productPayouts[i].twoWDPayoutAmount != null ? (Decimal) productPayouts[i].twoWDPayoutAmount : 0;
                                    fourWDPayoutAmount = productPayouts[i].fourWDPayoutAmount != null ? (Decimal) productPayouts[i].fourWDPayoutAmount : 0;
                                }
                                if(subCategoryTarget[j].subCategoryRetailAchieved != null) {
                                    if(productPayouts[i].variesByRegion && productPayouts[j].variesBy4WD) {
                                        totalPayout += subCategoryTarget[j].twoWDRetailAchieved != null ? subCategoryTarget[j].twoWDRetailAchieved * twoWDPayoutAmount : 0;
                                        totalPayout += subCategoryTarget[j].fourWDRetailAchieved != null ? subCategoryTarget[j].fourWDRetailAchieved * fourWDPayoutAmount : 0;
                                        subAmt = subCategoryTarget[j].twoWDRetailAchieved != null ? subCategoryTarget[j].twoWDRetailAchieved * twoWDPayoutAmount : 0;
                                        subAmt += subCategoryTarget[j].fourWDRetailAchieved != null ? subCategoryTarget[j].fourWDRetailAchieved * fourWDPayoutAmount : 0;
                                    } else if(productPayouts[i].variesByRegion) {
                                        totalPayout += subCategoryTarget[j].subCategoryRetailAchieved != null ? subCategoryTarget[j].subCategoryRetailAchieved * payoutAmount : 0;
                                        subAmt = subCategoryTarget[j].subCategoryRetailAchieved != null ? subCategoryTarget[j].subCategoryRetailAchieved * payoutAmount : 0;
                                    } else if(productPayouts[i].variesBy4WD) {
                                        totalPayout += subCategoryTarget[j].twoWDRetailAchieved != null ? subCategoryTarget[j].twoWDRetailAchieved * twoWDPayoutAmount : 0;
                                        totalPayout += subCategoryTarget[j].fourWDRetailAchieved != null ? subCategoryTarget[j].fourWDRetailAchieved * fourWDPayoutAmount : 0;
                                        subAmt = subCategoryTarget[j].twoWDRetailAchieved != null ? subCategoryTarget[j].twoWDRetailAchieved * twoWDPayoutAmount : 0;
                                        subAmt += subCategoryTarget[j].fourWDRetailAchieved != null ? subCategoryTarget[j].fourWDRetailAchieved * fourWDPayoutAmount : 0;
                                    } else {
                                        totalPayout += subCategoryTarget[j].subCategoryRetailAchieved != null ? subCategoryTarget[j].subCategoryRetailAchieved * payoutAmount : 0;
                                        subAmt = subCategoryTarget[j].subCategoryRetailAchieved != null ? subCategoryTarget[j].subCategoryRetailAchieved * payoutAmount : 0;
                                    }
                                    Map<String, Object> payout = new Map<String, Object>();
                                    payout.put('subProductId', subCategoryTarget[j].subProductId);
                                    payout.put('payout', subAmt);
                                    subPayout.add(payout);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return totalPayout;
    }

    public static void calculateSubProdPayout(Decimal percentage, Id kpiId) {
        List<Map<String, Object>> subPayouts = subProdKPIPayout.get(kpiId);
        for(Integer i = 0; i < subPayouts?.size(); i++) {
            Decimal amt = (Decimal) subPayouts[i].get('payout') * (percentage / 100);
            subPayouts[i].put('payout', amt);
        }
        subProdKPIPayout.put(kpiId, subPayouts);
    }

    public static Decimal extractTargetNumValue(String targetPercentValue) {
        Boolean hasRange = targetPercentValue.contains('to');
        Decimal percentage = 0;
        String target = hasRange ? targetPercentValue.substring(0, targetPercentValue.indexOf('to')) : targetPercentValue;
        if (target.contains('<') && !target.contains('=')) {
            percentage = Decimal.valueOf(target.replaceAll('[^0-9]', '')) - 1;
        } else if (target.contains('>') && !target.contains('=')) {
            percentage = Decimal.valueOf(target.replaceAll('[^0-9]', '')) + 1;
        }
        else {
            percentage = Decimal.valueOf(target.replaceAll('[^0-9]', ''));
        }
        return percentage;
    }

    public class DealerWrapper {
        @InvocableVariable(required=true)
        public String month;

        @InvocableVariable(required=true)
        public Integer year;

        @InvocableVariable(required=true)
        public Id dealerId;

        @InvocableVariable
        public String productCategory;

        @InvocableVariable
        public String productSubCategory;
    }
}