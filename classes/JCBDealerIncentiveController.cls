public without sharing class JCBDealerIncentiveController {
    
    @AuraEnabled
    public static User getUserDetails() {
        try {
            User user = [SELECT Id, Name, Account.Id, Account.Name, Account.JCB_India_Zone__c FROM User WHERE Id = :UserInfo.getUserId()];
            return user;
        } catch (Exception e) {
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
           throw new AuraHandledException(e.getMessage());
        }
    }
    
   @AuraEnabled
    public static Map<string,Object>  getDealerAndProductTargetInfo(String month, Integer year, Id dealerId) {
        JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper prodVolumeTargetInfo;
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> prodTargetAndPayoutInfo = new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        //List<JCBtempDIWrapper.ProductKPIAndPayout>  prodTargAndPayiut = new List<CBtempDIWrapper.ProductKPIAndPayout>();

        Map<String,Object> resultMap;
        try {
            Map<Id, Dealer_Incentive__c> dealerIncMap = getDealerIncentives(month, year, new List<Id>{dealerId});
            List<Dealer_Incentive__c> dpt = dealerIncMap.values();
            List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();
            if(dpt.size() > 0) {
                productTargets = [Select Id, Product_Category__c, Product_Category__r.Name,Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c,SubCategory_Retail_Predicted__c, SubCategory_Retail_Achieved__c, SubCategory_Predicted_Payout__c, SubCategory_Actual_Payout_Achieved__c, DI_Product_Target_and_Achivement__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :dpt[0].Id ORDER BY Product_Category__r.Order_No__c];
                //productTargets = [Select Id, Product_Category__c, Product_Category__r.Name,Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :dpt[0].Id ORDER BY Product_Category__r.Order_No__c];
                prodVolumeTargetInfo = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(dpt[0]);
                prodVolumeTargetInfo.productTargetsAndAchievements = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
                for(DI_Product_Target_and_Achievement__c productTarget : productTargets) {
                    JCBDealerIncentiveWrapper.ProductTargetAndAchievement prodWrap = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(productTarget);
                    List<DI_KPI_Achievement__c> kpiTargets = [Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Predicted_Potential_Amount__c, Actual_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, Growth_Predicted_KPI_Payout__c, Growth_Achieved_KPI_Payout__c, CE_Ratio_Predicted_Payout__c, CE_Ratio_Actual_Payout__c, CE_Ratio_YTD_Predicted_Payout__c, CE_Ratio_YTD_Actual_Payout__c, Quarter_Predicted_Percentage__c, Quarter_Actual_Percentage__c from DI_KPI_Achievement__c where DI_Product_Target_and_Achivement__c = :productTarget.Id ORDER BY Product_KPI__r.Order_No__c];
                    prodWrap.productKPIAndAchievements = new List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements>();
                    for(DI_KPI_Achievement__c kpiTarget : kpiTargets) {
                        JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndAchievements(kpiTarget);
                        List<DI_Product_KPI__c> prodKPI = [select Id, KPI__c, KPI__r.Name, Product_Category__c, Product_Category__r.Name, KPI__r.KPI_Visiblity__c from DI_Product_KPI__c where Id = :kpiTarget.Product_KPI__c];
                        if(prodKPI.size() > 0) {
                            JCBDealerIncentiveWrapper.ProductKPI pdk = new JCBDealerIncentiveWrapper.ProductKPI(prodKPI[0]);
                            kpiWrap.productKPI = pdk;
                        }
                        prodWrap.productKPIAndAchievements.add(kpiWrap);
                    }
                    prodVolumeTargetInfo.productTargetsAndAchievements.add(prodWrap);
                }
            }
            // List<DI_KPI_Target_And_Payout_Info__c> pt = [SELECT Id, Month__c, Year__c, Previous_Month__c, Previous_Year__c, KPI_Target__c,  Type__c, Has_Slabs__c,  KPI_Payout_Amount__c, DI_Product_KPI__c, Is_Salesman_Incentive__c, DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, Machine_Target__c, Sales_Person_Incentive_Target__c, Is_Total_Volume_Industry__c, Growth__c, (Select Id, Slab_Range__c,Payout_Mode__c, Payout_Percentage__c,Amount__c,Growth_Range__c,Slab_Type__c, DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.Product_Category__c, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Month__c = :month AND Year__c = :year ORDER BY DI_Product_KPI__r.Order_No__c]; 
            List<DI_KPI_Target_And_Payout_Info__c> pt = getKPITargetandPayouts(month, year, null, null);
            List<DI_KPI_Sub_Product_Payout__c> kpiSubPayouts = [SELECT Id, DI_Product_Sub_Category__c, DI_Product_Sub_Category__r.Name, DI_KPI_Target_And_Payout__c, Payout_Amount__c, Payout_Varies_By_Region__c, Payout_Varies_By_4WD__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c, (SELECT Id, Name, Payout_Amount__c, Zone_Name__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c FROM DI_Region_Payouts__r) FROM DI_KPI_Sub_Product_Payout__c WHERE DI_KPI_Target_And_Payout__c IN :pt ORDER BY DI_Product_Sub_Category__r.Name];

            List<DI_KPI_Target_And_Payout_Info__c> ceRatioTargets = getKPITargetandPayouts(null, year, 'Product To CE Ratio', null);

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
            
            //==============MULTIKPI TARGET INFO CALCULATION PART===========================
            List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargetWrappers = getMultiKPITargets(month, year);
			//==============================================COMMENT BEFORE UAT============================

            // Get Previous year data for Growth Incentive
            List<Integer> prevYear = new List<Integer>{year, year-1};
            List<Id> dealerIds = new List<Id>{dealerId};
            List<Dealer_Incentive__c> prevDealers = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c,Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :prevYear AND Dealer_Account__c = :dealerIds];
            List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerWrappers = new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>();
            if(prevDealers.size() > 0) {
                List<DI_Product_Target_and_Achievement__c> prevProdTargets = [Select Id, Product_Category__c, Product_Category__r.Name,Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                (Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Predicted_Potential_Amount__c, Actual_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, Growth_Predicted_KPI_Payout__c, Growth_Achieved_KPI_Payout__c, CE_Ratio_Predicted_Payout__c, CE_Ratio_Actual_Payout__c, CE_Ratio_YTD_Predicted_Payout__c, CE_Ratio_YTD_Actual_Payout__c, Quarter_Predicted_Percentage__c, Quarter_Actual_Percentage__c from DI_KPI_Achievement__r ORDER BY Product_KPI__r.Order_No__c) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :prevDealers ORDER BY Product_Category__r.Order_No__c];
                Map<Id, List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>> prevProdMap = new Map<Id, List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>>();
                for(Integer i = 0; i < prevProdTargets.size(); i++) {
                    if(prevProdMap.containsKey(prevProdTargets[i].Dealer_Incentive__c)) {
                        List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> pList = prevProdMap.get(prevProdTargets[i].Dealer_Incentive__c);
                        pList.add(new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(prevProdTargets[i]));
                        prevProdMap.put(prevProdTargets[i].Dealer_Incentive__c, pList);
                    } else {
                        JCBDealerIncentiveWrapper.ProductTargetAndAchievement prodWrap = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(prevProdTargets[i]);
                        prevProdMap.put(prevProdTargets[i].Dealer_Incentive__c, new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>{prodWrap});
                    }
                }
                for(Integer j = 0; j < prevDealers.size(); j++) {
                    JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerWrap = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(prevDealers[j]);
                    dealerWrap.productTargetsAndAchievements = prevProdMap.get(prevDealers[j].Id);
                    dealerWrappers.add(dealerWrap);
                }
            }
            
            if(pt.size() > 0){
                for(DI_KPI_Target_And_Payout_Info__c ptp : pt) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(ptp);
                    kpiWrap.productPayouts = kpiSubPayoutMap.get(ptp.Id);
                    prodTargetAndPayoutInfo.add(kpiWrap);
                }
            }

            if(ceRatioTargets.size() > 0) {
                for(DI_KPI_Target_And_Payout_Info__c ptp : ceRatioTargets) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(ptp);
                    kpiWrap.productPayouts = kpiSubPayoutMap.get(ptp.Id);
                    prodTargetAndPayoutInfo.add(kpiWrap);
                }
            }
            resultMap=new Map<String,Object>();
            resultMap.put('dealerTargetInfo',prodVolumeTargetInfo);
            resultMap.put('productTargetInfo',prodTargetAndPayoutInfo);
            resultMap.put('prevDealerWrappers',dealerWrappers);
            resultMap.put('multiKpitargetInfo',productTargetWrappers);
            
        } catch(Exception e) {
           System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
           throw new AuraHandledException(e.getMessage());
        }

        return resultMap;
    }

    public static List<JCBDealerIncentiveWrapper.ProductTargetWrapper> getMultiKPITargets(String month, Integer year) {
        List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargetWrappers = new List<JCBDealerIncentiveWrapper.ProductTargetWrapper>();
        try {
            List<DI_Multi_KPI_Target_Config__c> multiKpiConfigs = [ SELECT Id, Amount__c, Custom_Logic__c, Condition_Logic__c, Month__c, Year__c, DI_Product_Target__c FROM DI_Multi_KPI_Target_Config__c WHERE DI_Product_Target__c != null AND Month__c = :month AND Year__c = :year ];
            List<Slab_Info__c> slabs = [ SELECT Id, Slab_Range__c, Payout_Mode__c, Amount__c, Payout_Percentage__c, Growth_Range__c, Slab_Type__c, DI_Product_KPI__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, DI_Multi_KPI_Target_Config__c, All_Machine_Retail__c FROM Slab_Info__c WHERE DI_Multi_KPI_Target_Config__c = :multiKpiConfigs];
            Map<Id, List<DI_Multi_KPI_Target_Config__c>> multiKpiConfigMap = new Map<Id, List<DI_Multi_KPI_Target_Config__c>>();
            Map<Id, List<Slab_Info__c>> slabMap = new Map<Id, List<Slab_Info__c>>();
            
            for (DI_Multi_KPI_Target_Config__c config : multiKpiConfigs) {
                if (!multiKpiConfigMap.containsKey(config.DI_Product_Target__c)) {
                    multiKpiConfigMap.put(config.DI_Product_Target__c, new List<DI_Multi_KPI_Target_Config__c>());
                }
                multiKpiConfigMap.get(config.DI_Product_Target__c).add(config);
            }
            for (Slab_Info__c slab : slabs) {
                if (!slabMap.containsKey(slab.DI_Multi_KPI_Target_Config__c)) {
                    slabMap.put(slab.DI_Multi_KPI_Target_Config__c, new List<Slab_Info__c>());
                }
                slabMap.get(slab.DI_Multi_KPI_Target_Config__c).add(slab);
            }
            for (DI_Product_Target__c productTarget : [SELECT Id, Month__c, Year__c, DI_Product_Category__c, DI_Product_Category__r.Name, DI_Product_Category__r.Order_No__c FROM DI_Product_Target__c WHERE Month__c = :month AND Year__c = :year ]) {
                List<DI_Multi_KPI_Target_Config__c> associatedMultiKpis = multiKpiConfigMap.get(productTarget.Id);
                if (associatedMultiKpis != null) {
                    JCBDealerIncentiveWrapper.ProductTargetWrapper productWrapper = new JCBDealerIncentiveWrapper.ProductTargetWrapper(productTarget);
                    for (DI_Multi_KPI_Target_Config__c kpiConfig : associatedMultiKpis) {
                        JCBDealerIncentiveWrapper.DIMultiWrapper multiKpiWrapper = new JCBDealerIncentiveWrapper.DIMultiWrapper(kpiConfig);
                        List<Slab_Info__c> associatedSlabs = slabMap.get(kpiConfig.Id);
                        if (associatedSlabs != null) {
                            for (Slab_Info__c slab : associatedSlabs) {
                                JCBDealerIncentiveWrapper.SlabInfo slabWrapper = new JCBDealerIncentiveWrapper.SlabInfo(slab);
                                if (multiKpiWrapper.multiKpSlabs == null) {
                                    multiKpiWrapper.multiKpSlabs = new List<JCBDealerIncentiveWrapper.SlabInfo>();
                                }
                                multiKpiWrapper.multiKpSlabs.add(slabWrapper);
                            }
                        }
                        if (productWrapper.multiKpi == null) {
                            productWrapper.multiKpi = new List<JCBDealerIncentiveWrapper.DIMultiWrapper>();
                        }
                        productWrapper.multiKpi.add(multiKpiWrapper);
                    }
                    productTargetWrappers.add(productWrapper);
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
        return productTargetWrappers;
    }

    public static Map<Id, Dealer_Incentive__c> getDealerIncentives(String month, Integer year, List<Id> dealerIds) {
        Map<Id, Dealer_Incentive__c> dealerIncMap = new Map<Id, Dealer_Incentive__c>([Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c,Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Month__c = :month AND Year__c = :year AND Dealer_Account__c = :dealerIds]);
        return dealerIncMap;
    }

    public static List<DI_KPI_Target_And_Payout_Info__c> getKPITargetandPayouts(String month, Integer year, String targetType, String productName) {
        String qry = 'SELECT Id, Month__c, Year__c, Previous_Month__c, Previous_Year__c, KPI_Target__c,  Type__c, Has_Slabs__c,  KPI_Payout_Amount__c, DI_Product_KPI__c, Is_Salesman_Incentive__c, DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, Machine_Target__c, Sales_Person_Incentive_Target__c, Is_Total_Volume_Industry__c, Growth__c, All_Machine_Retail__c, (Select Id, Slab_Range__c,Payout_Mode__c, Payout_Percentage__c,Amount__c,Growth_Range__c,Slab_Type__c, DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.Product_Category__c, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Year__c = ' + year;
        if(month != null) {
            qry += ' AND Month__c = \'' + month + '\'';
        }
        if(targetType != null) {
            qry += ' AND Type__c = \'' + targetType + '\'';             
        }
        if(productName != null) {
            qry += ' AND DI_Product_KPI__r.Product_Category__r.Name = \'' + productName + '\'';
        }
        qry += ' ORDER BY DI_Product_KPI__r.Order_No__c';
        System.debug('query ---->     ' +qry);
        List<DI_KPI_Target_And_Payout_Info__c> targetAndPayouts = new List<DI_KPI_Target_And_Payout_Info__c>();
        try {
            targetAndPayouts = Database.query(qry);
        } catch(Exception e) {
            throw e;
        }
        return targetAndPayouts;
    }

  
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProductAndSubProducts() {
        Map<String, Object> productMap = new Map<String, Object>();
        try {
            List<DI_Product_Category__c> productCategory = [Select Id, Name, Order_No__c, (Select Id, Name from DI_Product_Sub_Categories__r ORDER BY Name) from DI_Product_Category__c ORDER BY Order_No__c ASC];
            if(productCategory.size() > 0) {
                List<JCBDealerIncentiveWrapper.ProductCategoryWrapper> prodWraps = new List<JCBDealerIncentiveWrapper.ProductCategoryWrapper>();
                for(DI_Product_Category__c prod : productCategory) {
                    JCBDealerIncentiveWrapper.ProductCategoryWrapper prodWrap = new JCBDealerIncentiveWrapper.ProductCategoryWrapper(prod);
                    prodWraps.add(prodWrap);
                    productMap.put(prod.Name,prodWrap);
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

        return productMap;
    }
    
  @AuraEnabled(cacheable=true)
    public static Map<String,List<DI_Product_KPI__c>> getProductsAndKPI(){
        Map<String,List<DI_Product_KPI__c>> prodAndKpi;
        try {
            List<DI_Product_KPI__c> pdKpi=[Select Id,Name,Product_Category__r.Name,KPI__r.Name,Order_No__c, KPI__r.Data_Source__c, KPI__r.KPI_Visiblity__c From DI_Product_KPI__c ORDER BY Order_No__c];
            prodAndKpi=new Map<String,List<DI_Product_KPI__c>>();
            for(DI_Product_KPI__c pdk:pdKpi){
                if(!prodAndKpi.containsKey(pdk.Product_Category__r.Name)){
                    prodAndKpi.put(pdk.Product_Category__r.Name,new List<DI_Product_KPI__c>{pdk});
                }else{
                    prodAndKpi.get(pdk.Product_Category__r.Name).add(pdk);
                }
            }
        } catch (Exception e) {
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
           throw new AuraHandledException(e.getMessage());
        }

        return prodAndKpi;
    }

    @AuraEnabled
    public static String saveIncentiveCalculations(List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> productInfos, JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper incentiveRec) {
        String message = 'SUCCESS';
        try {
            List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();
            List<DI_SubCategory_Target_and_Achievement__c> subTargets = new List<DI_SubCategory_Target_and_Achievement__c>();
            List<DI_KPI_Achievement__c> kpiAchievements = new List<DI_KPI_Achievement__c>();
            Dealer_Incentive__c dealerIncRec=[Select Id,Stage__c,Total_Retail_Predicted__c,Total_Retail_Achieved__c,Total_Payout_Predicted__c,Total_Payout_Achieved__c FROM Dealer_Incentive__c Where Id=:incentiveRec.recordId];
            for(JCBDealerIncentiveWrapper.ProductTargetAndAchievement productTargetInfo : productInfos) {
                DI_Product_Target_and_Achievement__c prodTarget = new DI_Product_Target_and_Achievement__c();
                prodTarget.Id = productTargetInfo.productTargetAndAchievementId;
                prodTarget.Product_Category__c = productTargetInfo.productId;
                prodTarget.Total_Retail_Target__c = productTargetInfo.totalRetailTarget;
                prodTarget.Total_Product_Predicted_Payout__c = productTargetInfo.totalProductPredictedPayout;
                prodTarget.Total_Retail_Predicted__c = productTargetInfo.totalRetailPredicted;
                prodTarget.Dealer_Incentive__c = productTargetInfo.dealerIncentiveId;
                prodTarget.Total_Additional_Predicted_Payout__c = productTargetInfo.totalAddPredictedPayout;
                prodTarget.Total_Retail_4WD_Predicted__c = productTargetInfo.total4WDRetailPredicted;
                prodTarget.Total_Retail_2WD_Predicted__c = productTargetInfo.total2WDRetailPredicted;
                prodTarget.Incentive_Status_Predicted__c = productTargetInfo.incentiveStatusPredicted;
                prodTarget.Total_Predicted_Payout__c = productTargetInfo.totalPredictedPayout;
                prodTarget.Total_Sales_Person_Predicted_Payout__c = productTargetInfo.totalSPersonPredictedPayout;
                prodTarget.Total_Dealer_Predicted_Payout__c = productTargetInfo.totalDealerPredictedPayout;
                prodTarget.Growth_Predicted_Payout__c = productTargetInfo.growthPredictedPayout;
                prodTarget.Multi_KPI_Predicted_Payout__c = productTargetInfo.multiKpiPredictedPayout;
                prodTarget.TIV_Predicted_Payout__c = productTargetInfo.totalTIVPredictedPayout;
                prodTarget.Demo_Conducted_Predicted__c = productTargetInfo.demoConductedPredicted;
                productTargets.add(prodTarget);
                List<JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement> subTargetsInfo = productTargetInfo.subTargetAndAchievement;
                for(JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement subWrap : subTargetsInfo) {
                    DI_SubCategory_Target_and_Achievement__c subTarget = new DI_SubCategory_Target_and_Achievement__c();
                    subTarget.Id = subWrap.subTargetAndAchievementId;
                    subTarget.SubCategory_Retail_Predicted__c = subWrap.subCategoryRetailPredicted;
                    subTarget.SubCategory_Predicted_Payout__c = subWrap.subCategoryPredictedPayout;
                    subTarget.SubCategory_Add_Predicted_Payout__c = subWrap.subCategoryAddPredictedPayout;
                    subTarget.FourWD_Retail_Predicted__c = subWrap.fourWDRetailPredicted;
                    subTarget.TwoWD_Retail_Predicted__c = subWrap.twoWDRetailPredicted;
                    subTargets.add(subTarget);
                }
                List<JCBDealerIncentiveWrapper.ProductKPIAndAchievements> kpiWraps = productTargetInfo.productKPIAndAchievements;
                for(JCBDealerIncentiveWrapper.ProductKPIAndAchievements kpi : kpiWraps) {
                    DI_KPI_Achievement__c kpiAch = new DI_KPI_Achievement__c();
                    kpiAch.Id = kpi.kpiAchievementId;
                    kpiAch.Predicted_KPI_Payout__c = kpi.predictedKPIPayout;
                    kpiAch.Predicted_KPI_Percentage__c = kpi.predictedKPIPercentage;
                    kpiAch.DI_Product_Target_and_Achivement__c = kpi.productTargetandAchivementId;
                    kpiAch.Product_KPI__c = kpi.productKPI.productKPIId;
                    kpiAch.Additional_Predicted_KPI_Payout__c = kpi.addPredictedKPIPayout;
                    kpiAch.Predicted_Potential_Amount__c = kpi.predictedPotentialAmount;
                    kpiAch.Actual_Potential_Amount__c	 = kpi.actualPotentialAmount;
                    kpiAch.Indent_Order__c = kpi.indentOrder;
                    kpiAch.Indent_Wholesale__c = kpi.indentWholesale;
                    kpiAch.Growth_Predicted_KPI_Payout__c = kpi.growthPredictedKPIPayout;
                    kpiAch.CE_Ratio_Predicted_Payout__c = kpi.ceRatioPredictedPayout;
                    kpiAch.CE_Ratio_YTD_Predicted_Payout__c = kpi.ceRatioYTDPredictedPayout;
                    kpiAch.Quarter_Predicted_Percentage__c = kpi.quarterPredictedPercentage;
                    kpiAchievements.add(kpiAch);
                }
            }
            if(productTargets.size() > 0) {
                    upsert productTargets;
            }
            if(subTargets.size() > 0) {
                upsert subTargets;
            }
            if(kpiAchievements.size() > 0) {
                upsert kpiAchievements;
            }
            If(dealerIncRec!=null){
                dealerIncRec.Stage__c='Saved';
                dealerIncRec.Total_Payout_Predicted__c = incentiveRec.totalPayoutPredicted;
                dealerIncRec.Total_Retail_Predicted__c = incentiveRec.totalRetailPredicted;
                dealerIncRec.Total_Additional_Payout_Predicted__c = incentiveRec.totalAddPayoutPredicted;
                dealerIncRec.Additional_Payout_Predicted__c = incentiveRec.additionalPayoutPredicted;
                dealerIncRec.Multi_KPI_Payout_Predicted__c = incentiveRec.multiKpiPayoutPredicted;
                dealerIncRec.TIV_Payout_Predicted__c = incentiveRec.totalTIVPayoutPredicted;
                dealerIncRec.Total_Product_Payout_Predicted__c = incentiveRec.totalProdPayoutPredicted;
                dealerIncRec.Total_Sales_Person_Payout_Predicted__c = incentiveRec.totalSPersonPayoutPredicted;
                dealerIncRec.Total_Dealer_Payout_Predicted__c = incentiveRec.totalDealerPayoutPredicted;
                dealerIncRec.Growth_Payout_Predicted__c = incentiveRec.growthPayoutPredicted;
                update dealerIncRec;
            }

        } catch(Exception e) {
            message = 'ERROR';
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    @AuraEnabled(cacheable = true)
    public static List<Map<String, String>> getMonthOptions() {
        List<Map<String, String>> monthOptions = new List<Map<String, String>>();
        Schema.DescribeFieldResult objFieldDescribe = Dealer_Incentive__c.Month__c.getDescribe();
        List<Schema.PicklistEntry> lstPickListValues = objFieldDescribe.getPickListValues();
        for (Schema.PicklistEntry objPickList : lstPickListValues) {
            Map<String, String> option = new Map<String, String>();
            option.put('label', objPickList.getLabel());
            option.put('value', objPickList.getValue());
            monthOptions.add(option);
        }
        return monthOptions;
    }
    
    @AuraEnabled
    public static String deleteDealerIncRecords(String month, Integer year) {
        String status = '';
        try{
            delete [Select Id from DI_Region_Payout__c Where DI_KPI_Sub_Product_Payout__r.DI_KPI_Target_And_Payout__r.Month__c =: month AND DI_KPI_Sub_Product_Payout__r.DI_KPI_Target_And_Payout__r.Year__c =: year AND DI_KPI_Sub_Product_Payout__r.DI_KPI_Target_And_Payout__r.Type__c = 'KPI Target'];
            delete [Select Id from Slab_Info__c where DI_KPI_Target_And_Payout_Info__r.Month__c =: month AND DI_KPI_Target_And_Payout_Info__r.Year__c =: year AND DI_KPI_Target_And_Payout_Info__r.Type__c = 'KPI Target'];
            delete [Select Id from DI_KPI_Sub_Product_Payout__c where DI_KPI_Target_And_Payout__r.Month__c =: month AND DI_KPI_Target_And_Payout__r.Year__c =: year AND DI_KPI_Target_And_Payout__r.Type__c = 'KPI Target'];
            delete [Select Id from DI_KPI_Target_And_Payout_Info__c Where Month__c =: month AND Year__c =: year AND Type__c = 'KPI Target'];
            status = 'Success';
        } catch (Exception e){
            status = 'Error';
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());     
            throw new AuraHandledException(e.getMessage());
        }
        return status;
    }
}