public without sharing class dIFormulaController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String,JCBDealerIncentiveWrapper.ProductCategoryWrapper> getProductAndSubCategory() {
        Map<String,JCBDealerIncentiveWrapper.ProductCategoryWrapper> productWrappers = new Map<String,JCBDealerIncentiveWrapper.ProductCategoryWrapper>();
        try {
            List<DI_Product_Category__c> productCategory = [Select Id, Name, Order_No__c, (Select Id,Name from DI_Product_Sub_Categories__r ORDER BY Name) from DI_Product_Category__c];
            if(productCategory.size() > 0) {
                for(DI_Product_Category__c prod : productCategory) {
                    JCBDealerIncentiveWrapper.ProductCategoryWrapper prodWrap = new JCBDealerIncentiveWrapper.ProductCategoryWrapper(prod);
                    productWrappers.put(prodWrap.name, prodWrap);
                }
            }
            return productWrappers;
        } catch(Exception e) {
            throw e;
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> getAccountByRegion(String month, Integer year) {
        Map<String, List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>> accountMap = new Map<String, List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>>();
        Map<String,Object> productAndCount = new Map<String, Object>();
        try {
            List<Account> accounts = [SELECT Id, Name, JCB_India_Zone__c, Type,
                (SELECT Id, Month__c, Year__c, Dealer_Account__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c,
                        Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Stage__c,
                        Total_Product_Payout_Achieved__c, Total_Retail_Achieved__c,
                        Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c,
                        Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Payout_Predicted__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c
                FROM Dealer_Incentives__r
                WHERE Month__c =: month AND Year__c =: year)
            FROM Account
            WHERE JCB_India_Zone__c != null AND Type = 'Dealer' AND Region__c = 'India' AND Dealer_Location_Status__c = 'HQ' AND Active__c = true ORDER BY Name];
            Map <String,Decimal> productCount = new Map<String,Decimal>();
            Decimal tempcount = 0;
            for(Account account : accounts) {
                JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper accMap;
                if(account.Dealer_Incentives__r != null && account.Dealer_Incentives__r.size() > 0) {
                    accMap = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper(account.Dealer_Incentives__r.get(0));
                    List<DI_Product_Target_and_Achievement__c> productTargets = [SELECT Id, Total_Retail_Target__c, Product_Category__c, Product_Category__r.Name, Dealer_Incentive__c,Total_Retail_Predicted__c,Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c,Total_Retail_Achieved__c,Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c, (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c, DI_Product_Target_and_Achivement__c,SubCategory_Retail_Predicted__c,SubCategory_Retail_Achieved__c,SubCategory_Predicted_Payout__c,SubCategory_Actual_Payout_Achieved__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c, DI_Product_Target_and_Achivement__r.Total_Retail_2WD_Predicted__c, DI_Product_Target_and_Achivement__r.Total_Retail_4WD_Predicted__c, DI_Product_Target_and_Achivement__r.Total_Retail_Predicted__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) FROM DI_Product_Target_and_Achievement__c WHERE Dealer_Incentive__c = :account.Dealer_Incentives__r.get(0).Id];
                    List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement> productTargetsAndAchievements = new List<JCBDealerIncentiveWrapper.ProductTargetAndAchievement>();
                    for(DI_Product_Target_and_Achievement__c product : productTargets) {
                        JCBDealerIncentiveWrapper.ProductTargetAndAchievement productAchievement = new JCBDealerIncentiveWrapper.ProductTargetAndAchievement(product);
                        productTargetsAndAchievements.add(productAchievement);
                    }
                    accMap.productTargetsAndAchievements =  productTargetsAndAchievements;
                } else {
                    accMap = new JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper();
                    accMap.dealerId = account.Id;
                    accMap.dealerName = account.Name;
                }
                if(accountMap.containsKey(account.JCB_India_Zone__c)) {
                    accountMap.get(account.JCB_India_Zone__c).add(accMap);
                } else {
                    accountMap.put(account.JCB_India_Zone__c, new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>{accMap});
                }
                if(accMap.productTargetsAndAchievements != null){
                    for (JCBDealerIncentiveWrapper.ProductTargetAndAchievement prdtrg : accMap.productTargetsAndAchievements) {
                        prdtrg.totalRetailTarget = prdtrg.totalRetailTarget != null ? prdtrg.totalRetailTarget : 0;
                        if(productCount.containsKey(prdtrg.productName)) {
                            tempcount = productCount.get(prdtrg.productName) + prdtrg.totalRetailTarget;
                            productCount.put(prdtrg.productName, tempcount);
                        }
                        else{
                            productCount.put(prdtrg.productName, prdtrg.totalRetailTarget);
                        }
                    }
                }
            }
            Map<String,JCBDealerIncentiveWrapper.ProductCategoryWrapper> prodnameList = getProductAndSubCategory();
            for(String prod : prodnameList.keySet()){
                if(!(productCount.containsKey(prod))) {
                    productCount.put(prod, 0);
                }
            }
            productAndCount.put('productCount', productCount);
            productAndCount.put('accountMap',accountMap);
            return productAndCount;
        } catch(Exception e) {
            throw e;
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> saveDealerFormula(List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerIncentiveWraps,List<Id> removableId) {
        String message = 'SUCCESS';
        Map<String, Object> resultMap = new Map<String, Object>();
        try {
            Set<Id> newDealerIds = new Set<Id>();
            List<Id> oldDealerIds = new List<Id>();
            List<Id> demoDealerIds = new List<Id>();
            List<DI_Product_Target_and_Achievement__c> productTargets = new List<DI_Product_Target_and_Achievement__c>();
            List<DI_SubCategory_Target_and_Achievement__c> subProductTargets = new List<DI_SubCategory_Target_and_Achievement__c>();
            List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
            for(JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerIncWrap : dealerIncentiveWraps) {
                Dealer_Incentive__c dealerInc = new Dealer_Incentive__c();
                dealerInc.Id = dealerIncWrap.recordId;
                if(dealerInc.Id == null) {
                    dealerInc.Stage__c = 'Configured';
                    newDealerIds.add(dealerIncWrap.dealerId);
                    demoDealerIds.add(dealerIncWrap.dealerId);
                } else {
                    oldDealerIds.add(dealerIncWrap.dealerId);
                }
                dealerInc.Dealer_Account__c = dealerIncWrap.dealerId;
                dealerInc.Month__c = dealerIncWrap.month;
                dealerInc.Year__c = dealerIncWrap.year;
                dealerInc.Total_Retail_Predicted__c = dealerIncWrap.totalRetailPredicted;
                dealerIncentives.add(dealerInc);
            }
            if(dealerIncentives.size() > 0) {
                upsert dealerIncentives;
                for(Integer i = 0; i < dealerIncentiveWraps.size(); i++) {
                    JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerIncWrap = dealerIncentiveWraps[i];
                    for(JCBDealerIncentiveWrapper.ProductTargetAndAchievement productWrap : dealerIncWrap.productTargetsAndAchievements) {
                        DI_Product_Target_and_Achievement__c productTarget = new DI_Product_Target_and_Achievement__c();
                        productTarget.Id = productWrap.productTargetAndAchievementId;
                        productTarget.Product_Category__c = productWrap.productId;
                        productTarget.Total_Retail_Target__c = productWrap.totalRetailTarget;
                        productTarget.Dealer_Incentive__c = dealerIncentives[i].Id;
                        productTarget.Demo_Target__c = productWrap.demoTarget;
                        productTarget.Total_Retail_4WD_Predicted__c = productWrap.total4WDRetailPredicted;
                        productTarget.Total_Retail_2WD_Predicted__c = productWrap.total2WDRetailPredicted;
                        productTarget.Total_Retail_Predicted__c = productWrap.totalRetailPredicted;
                        productTargets.add(productTarget);
                        if(productTarget.Id == null) {
                            newDealerIds.add(dealerIncWrap.dealerId);
                        }
                    }
                }
            }
            
            if(productTargets.size() > 0) {
                upsert productTargets;
                Integer k = 0;
                for(Integer i = 0; i < dealerIncentiveWraps.size(); i++) {
                    JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper dealerIncWrap = dealerIncentiveWraps[i];
                    k = i == 0 ? 0 : k ;
                    if(k < productTargets.size()) {
                        for(Integer j=0; j < dealerIncWrap.productTargetsAndAchievements.size(); j++) {
                            JCBDealerIncentiveWrapper.ProductTargetAndAchievement productWrap = dealerIncWrap.productTargetsAndAchievements[j];
                            for(JCBDealerIncentiveWrapper.SubCategoryTargetAndAchievement subProdWrap : productWrap.subTargetAndAchievement) {
                                DI_SubCategory_Target_and_Achievement__c subProdTarget = new DI_SubCategory_Target_and_Achievement__c();
                                subProdTarget.Id = subProdWrap.subTargetAndAchievementId;
                                subProdTarget.Sub_Category__c = subProdWrap.subProductId;
                                subProdTarget.SubCategory_Retail_Target__c = subProdWrap.subCategoryRetailTarget;
                                subProdTarget.DI_Product_Target_and_Achivement__c = productTargets[k].Id;
                                subProductTargets.add(subProdTarget);
                                if(subProdTarget.Id == null) {
                                    newDealerIds.add(dealerIncWrap.dealerId);
                                }
                            }
                            k++;
                        }
                    }
                }
            }
            if(subProductTargets.size() > 0) {
                upsert subProductTargets;
            }
            if(removableId.size() > 0) {
                Database.delete(removableId);
            }
            resultMap.put('newDealerIds', newDealerIds);
            resultMap.put('oldDealerIds', oldDealerIds);
            resultMap.put('demoDealerIds', demoDealerIds);
        } catch(Exception e) {
            message = 'ERROR';
            throw e;
        }
        resultMap.put('message', message);
        return resultMap;
    }

    @AuraEnabled(cacheable=true)
    public static List<string> getPicklistValues(){
        try {
            List<string> options = new List<string>();
            Schema.DescribeFieldResult objFieldDescribe = User.User_Region_Zone__c.getDescribe();
            List<Schema.PicklistEntry> lstPickListValues = objFieldDescribe.getPickListValues();
            for (Schema.PicklistEntry objPickList : lstPickListValues) {
                options.add(objPickList.getValue());
            }
            options.sort();
            return options;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE JCB_India_Zone__c != null and Type = 'Dealer' and Region__c = 'India' and Dealer_Location_Status__c = 'HQ' and Active__c = true];
        return accounts;
    }
    
    @AuraEnabled
    public Map<Decimal,List<String>> yearsMonth { get; set; }
    
    public DIFormulaController(Map<Decimal,List<String>> yearMonth) {
        this.yearsMonth = yearMonth;
    }
    
    @AuraEnabled(cacheable = true)
    public static dIFormulaController getClonePicklistValues(){
        List<DI_KPI_Target_And_Payout_Info__c> dIProductRecords = [SELECT Year__c, Month__c, Id, Type__c FROM DI_KPI_Target_And_Payout_Info__c WHERE Type__c = 'KPI Target' AND Year__c != null AND Month__c != null ORDER BY Month__c];
    	Map<Decimal,List<String>> yearMonth = new Map<Decimal,List<String>>();
        set<Decimal> getYears = new set<Decimal>();
        set<String> getMonths = new set<String>();
        for(DI_KPI_Target_And_Payout_Info__c dIProductRecord : dIProductRecords){
            getYears.add(dIProductRecord.Year__c);
        }
        List<Decimal> years = new List<Decimal>(getYears);
        for(Decimal year : years){
            getMonths.clear();
            for(DI_KPI_Target_And_Payout_Info__c dIProductRecord : dIProductRecords){
                if(dIProductRecord.Year__c == year){
                    getMonths.add(dIProductRecord.Month__c);
                }
            }
            List<String> months = new List<String>(getMonths);
            yearMonth.put(year, months);
        }
        return new dIFormulaController(yearMonth);
	}

    @AuraEnabled(cacheable = true)
    public static Map<Decimal, List<String>> getCalcPicklistValues(){
        User user = [SELECT Id, Name, Account.Id, Account.Name, Account.JCB_India_Zone__c FROM User WHERE Id = :UserInfo.getUserId()];
        List<DI_KPI_Target_And_Payout_Info__c> dIProductRecords = [SELECT Id, Name, Month__c, Year__c From DI_KPI_Target_And_Payout_Info__c Where Year__c != null AND Month__c != null ORDER BY Month__c];
        Map<Decimal,List<String>> kpiYearMonth = new Map<Decimal,List<String>>();
        set<Decimal> getkpiYears = new set<Decimal>();
        set<String> getkpiMonths = new set<String>();
        for(DI_KPI_Target_And_Payout_Info__c dIProductRecord : dIProductRecords){
            getkpiYears.add(dIProductRecord.Year__c);
        }
        List<Decimal> kpiYears = new List<Decimal>(getkpiYears);
        for(Decimal year : kpiYears){
            getkpiMonths.clear();
            for(DI_KPI_Target_And_Payout_Info__c dIProductRecord : dIProductRecords){
                if(dIProductRecord.Year__c == year){
                    getkpiMonths.add(dIProductRecord.Month__c);
                }
            }
            List<String> kpiMonths = new List<String>(getkpiMonths);
            kpiYearMonth.put(year, kpiMonths);
        }

        List<Dealer_Incentive__c> dealerIncentives = new List<Dealer_Incentive__c>();
        dealerIncentives = [Select Id, Month__c, Year__c, Dealer_Account__r.Name,Stage__c from Dealer_Incentive__c where Dealer_Account__c = :user.Account.Id AND Year__c != null AND Month__c != null ORDER BY Month__c];
        Map<Decimal,List<String>> retailYearMonth = new Map<Decimal,List<String>>();
        set<Decimal> getRetailYears = new set<Decimal>();
        set<String> getRetailMonths = new set<String>();
        for(Dealer_Incentive__c dealer : dealerIncentives){
            getRetailYears.add(dealer.Year__c);
        }
        List<Decimal> retailYears = new List<Decimal>(getRetailYears);
        for(Decimal year : retailYears){
            getRetailMonths.clear();
            for(Dealer_Incentive__c dealer : dealerIncentives){
                if(dealer.Year__c == year){
                    getRetailMonths.add(dealer.Month__c);
                }
            }
            List<String> retailMonths = new List<String>(getRetailMonths);
            retailYearMonth.put(year, retailMonths);
        }
        
        Map<Decimal, List<String>> dropdownlist = new Map<Decimal, List<String>>();
        for(Decimal year : kpiYearMonth.keySet()) {
            if(retailYearMonth.get(year) != null) {
                List<String> months = new List<String>();
                for(String month : kpiYearMonth.get(year)) {
                    if(retailYearMonth.get(year).contains(month)) {
                        months.add(month);
                    }
                }
                if(months.size() > 0) {
                    dropdownlist.put(year, months);
                }
            }
        }
        return dropdownlist;
    }

    @AuraEnabled
    public static List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> getKPITargetAndPayoutInfo(String month, Decimal year, List<String> type) {
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> kpiTargets = new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        try {
            List<DI_KPI_Target_And_Payout_Info__c> kpiTargetAndPayouts = [SELECT Id, Month__c, Year__c, KPI_Target__c,Previous_Year__c,Previous_Month__c, KPI_Payout_Amount__c, Type__c, Has_Slabs__c, Machine_Target__c, Sales_Person_Incentive_Target__c,Is_Salesman_Incentive__c, Is_Total_Volume_Industry__c, Growth__c, All_Machine_Retail__c, DI_Product_KPI__c, DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, (Select Id, Slab_Range__c,Payout_Mode__c,  Amount__c,DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, Payout_Percentage__c,Growth_Range__c,Slab_Type__c, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Month__c = :month AND Year__c = :year AND Type__c IN:type ORDER BY DI_Product_KPI__r.Order_No__c];
            List<DI_KPI_Sub_Product_Payout__c> kpiSubPayouts = [SELECT Id, DI_Product_Sub_Category__c, DI_Product_Sub_Category__r.Name, DI_KPI_Target_And_Payout__c, Payout_Amount__c, Payout_Varies_By_Region__c, Payout_Varies_By_4WD__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c, (SELECT Id, Name, Payout_Amount__c, Zone_Name__c, TwoWD_Payout_Amount__c, FourWD_Payout_Amount__c FROM DI_Region_Payouts__r ORDER BY Zone_Name__c ASC) FROM DI_KPI_Sub_Product_Payout__c WHERE DI_KPI_Target_And_Payout__c IN :kpiTargetAndPayouts ORDER BY DI_Product_Sub_Category__r.Name];
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
            for(DI_KPI_Target_And_Payout_Info__c targetInfo : kpiTargetAndPayouts) {
                JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiTarget = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(targetInfo);
                kpiTarget.productPayouts = kpiSubPayoutMap.get(targetInfo.Id);
                kpiTargets.add(kpiTarget);
            }
        } catch(Exception e) {
           throw e;
        }
        return kpiTargets;
    }

    @AuraEnabled
    public static String saveProductKPIAndTarget(List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> kpiTargetsAndPayouts, List<List<Id>> deletedIds, List<Map<String,Object>> productTarget) {
        String message = 'SUCCESS';
        String stockId;
        try {
            List<DI_Product_Target__c> stockPolicyList = new List<DI_Product_Target__c>();
            List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> productkpiTargets = kpiTargetsAndPayouts;
            List<DI_KPI_Target_And_Payout_Info__c> kpiTargets = new List<DI_KPI_Target_And_Payout_Info__c>();
            if(productTarget != null){
                for(Integer i = 0 ; i < productTarget.size() ; i++){
                    DI_Product_Target__c stockPolicy = new DI_Product_Target__c();
                    stockPolicy.DI_Product_Category__c =(String)productTarget[i].get('DI_Product_Category__c');
                    stockPolicy.Stock_Policy__c = (Decimal)productTarget[i].get('Stock_Policy__c');
                    stockPolicy.Year__c = Integer.valueOf(productTarget[i].get('Year__c'));
                    stockPolicy.Month__c = (String) productTarget[i].get('Month__c');
                    stockId = (String) productTarget[i].get('Id');
                    if (stockId != null && !String.isBlank(stockId)) {
                        stockPolicy.Id = stockId;
                    }
                    stockPolicyList.add(stockPolicy);
                }
                Upsert stockPolicyList;
            }
            for(JCBDealerIncentiveWrapper.ProductKPIAndPayout prodKPI : productkpiTargets) {
                DI_KPI_Target_And_Payout_Info__c kpiTarg = new DI_KPI_Target_And_Payout_Info__c();
                kpiTarg.Id = prodKPI.recordId;
                kpiTarg.Month__c = prodKPI.month;
                kpiTarg.Year__c = prodKPI.year;
                kpiTarg.DI_Product_KPI__c = prodKPI.productKPI.productKPIId;
                kpiTarg.KPI_Target__c = prodKPI.target;
                kpiTarg.Type__c = prodKPI.type;
                if(kpiTarg.Type__c == 'Additional Incentive Target'){
                    kpiTarg.KPI_Payout_Amount__c = prodKPI.incentiveAmount;
                    kpiTarg.All_Machine_Retail__c = prodKPI.allMachineRetail;
                }if(kpiTarg.Type__c == 'Growth Additional Incentive'){
                    kpiTarg.Previous_Year__c = prodKPI.prevYear;
                    kpiTarg.Previous_Month__c = prodKPI.prevMonth;
                    kpiTarg.KPI_Payout_Amount__c = prodKPI.incentiveAmount;
                    kpiTarg.All_Machine_Retail__c = prodKPI.allMachineRetail;
                }
                if(kpiTarg.Type__c == 'Product To CE Ratio'){
                    kpiTarg.Growth__c = prodKPI.growth; 
                }
                kpiTarg.Has_Slabs__c = prodKPI.hasSlabs;
                kpiTarg.Machine_Target__c = JSON.serialize(prodKPI.machineTarget);
                if(productTarget != null && stockPolicyList != null){
                    for(Integer i = 0 ; i < stockPolicyList.size() ; i++){
                        if(prodKPI.productKPI.productId == stockPolicyList[i].DI_Product_Category__c){
                            kpiTarg.DI_Product_Target__c = stockPolicyList[i].Id;
                            break;
                        }    
                    }
                }
                kpiTargets.add(kpiTarg);
            }
            if(kpiTargets.size() > 0) {
                upsert kpiTargets;
                List<DI_KPI_Sub_Product_Payout__c> subProdPayouts = new List<DI_KPI_Sub_Product_Payout__c>();
                List<Slab_Info__c> slabKPI = new List<Slab_Info__c>();
                for(Integer j = 0; j < productkpiTargets.size(); j++) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout prodKPI = productkpiTargets[j];
                    if(prodKPI.productPayouts != null) {
                        for(JCBDealerIncentiveWrapper.ProductPayoutInfo payout : prodKPI.productPayouts) {
                            DI_KPI_Sub_Product_Payout__c subPayout = new DI_KPI_Sub_Product_Payout__c();
                            subPayout.Id = payout.payoutId;
                            subPayout.DI_Product_Sub_Category__c = payout.subProductId;
                            subPayout.DI_KPI_Target_And_Payout__c = kpiTargets[j].Id;
                            subPayout.Payout_Amount__c = payout.payoutAmount;
                            subPayout.TwoWD_Payout_Amount__c = payout.twoWDPayoutAmount;
                            subPayout.FourWD_Payout_Amount__c = payout.fourWDPayoutAmount;
                            subPayout.Payout_Varies_By_Region__c = payout.variesByRegion;
                            subPayout.Payout_Varies_By_4WD__c = payout.variesBy4WD;
                            
                            subProdPayouts.add(subPayout);
                        }
                    }
                    if(prodKPI.slabInfo != null && prodKPI.slabInfo.size() > 0){
                        for(JCBDealerIncentiveWrapper.SlabInfo slabs : prodKPI.slabInfo) {
                            Slab_Info__c slab = new Slab_Info__c();
                            slab.Id = slabs.slabId;
							slab.DI_KPI_Target_And_Payout_Info__c = kpiTargets[j].Id;
                            slab.Slab_Range__c = slabs.slabRange;
                            slab.Payout_Mode__c = slabs.payoutMode;
                            slab.Amount__c = slabs.amount;
                            slab.Payout_Percentage__c = slabs.payoutPercentage;
                            slab.Growth_Range__c = slabs.growthRange;
                            if(prodKPI.type == 'Additional Incentive Target'|| prodKPI.type == 'Growth Additional Incentive') {
                                slab.All_Machine_Retail__c = slabs.allMachineRetail;
                            }
                            slabKPI.add(slab);
                        }
                    }
                }
                if(subProdPayouts.size() > 0) {
                    upsert subProdPayouts;
                    List<DI_Region_Payout__c> regPayouts = new List<DI_Region_Payout__c>();
                    Integer k = 0;
                    for(Integer i = 0; i < productkpiTargets.size(); i++) {
                        JCBDealerIncentiveWrapper.ProductKPIAndPayout prodKPI = productkpiTargets[i];
                        k = i == 0 ? 0 : k ;
                        if(k < subProdPayouts.size()) {
                            for(Integer j = 0; j < prodKPI.productPayouts.size(); j++) {
                                JCBDealerIncentiveWrapper.ProductPayoutInfo payout = prodKPI.productPayouts[j];
                                if(payout.regionPayout != null && payout.regionPayout.size() > 0) {
                                    for(JCBDealerIncentiveWrapper.RegionPayout regPay : payout.regionPayout) {
                                        DI_Region_Payout__c regAmt = new DI_Region_Payout__c();
                                        regAmt.Id = regPay.regPayoutId;
                                        regAmt.Zone_Name__c = regPay.region;
                                        regAmt.Payout_Amount__c = regPay.amount;
                                        regAmt.TwoWD_Payout_Amount__c = regPay.twoWDPayoutAmount;
                                        regAmt.FourWD_Payout_Amount__c = regPay.fourWDPayoutAmount;
                                        regAmt.DI_KPI_Sub_Product_Payout__c = subProdPayouts[k].Id;
                                        regPayouts.add(regAmt);
                                    }
                                }
                                k++;
                            }
                        }
                    }
                    if(regPayouts.size() > 0) {
                        upsert regPayouts;
                    }
                }
                if(slabKPI.size() > 0) {
                    upsert slabKPI;
                }
                if(deletedIds.size() > 0) {
                    deleteRecordInDatabase(deletedIds);
                }
            }
        } catch(Exception e) {
            message = 'ERROR';
            throw e;
        }
        return message;
    }

    @AuraEnabled
    public static string saveSalesmanIncentive(JCBDealerIncentiveWrapper.SalesmanKPIWrapper salesKPITarget){
        String message = 'SUCCESS';
        try {
            JCBDealerIncentiveWrapper.SalesmanKPIWrapper salesmanKpi = salesKPITarget;
            DI_KPI_Target_And_Payout_Info__c kpiTargets = new DI_KPI_Target_And_Payout_Info__c();
            kpiTargets.Id = salesmanKpi.recordId;
            kpiTargets.Sales_Person_Incentive_Target__c  = salesmanKpi.salesPersonTarget;  
            kpiTargets.Is_Salesman_Incentive__c = salesmanKpi.isSalesmanIncentive;
            upsert kpiTargets;
            List<Slab_Info__c> slabKPI = new List<Slab_Info__c>();
            if(salesmanKpi.slabInfo != null && salesmanKpi.slabInfo.size() > 0){
                for(JCBDealerIncentiveWrapper.SlabInfo slabs : salesmanKpi.slabInfo) {
                    Slab_Info__c slab = new Slab_Info__c();
                    slab.Id = slabs.slabId;
                    slab.DI_KPI_Target_And_Payout_Info__c = kpiTargets.Id;
                    slab.Slab_Range__c = slabs.slabRange;
                    slab.Payout_Mode__c = slabs.payoutMode;
                    slab.Amount__c = slabs.amount; 
                    slab.Payout_Percentage__c = slabs.payoutPercentage;
                    slab.Slab_Type__c = slabs.slabType;
                    slabKPI.add(slab);
                }
            }
            if(slabKPI.size() > 0) {
                upsert slabKPI;
            }
        } catch (Exception e) {
            message = 'ERROR';
            throw e;
        }
        return message;
    }
   
    @AuraEnabled
    public static string saveIndustryIncentive(JCBDealerIncentiveWrapper.IndustryVolumeWrapper industryKPITarget){
        String message = 'SUCCESS';
        try {
            JCBDealerIncentiveWrapper.IndustryVolumeWrapper industryVolumeKpi = industryKPITarget;
            DI_KPI_Target_And_Payout_Info__c kpiTargets = new DI_KPI_Target_And_Payout_Info__c();
            kpiTargets.Id = industryVolumeKpi.recordId;
            kpiTargets.Is_Total_Volume_Industry__c = industryVolumeKpi.isIndustryIncentive;
            upsert kpiTargets;
            List<Slab_Info__c> slabKPI = new List<Slab_Info__c>();
            if(industryVolumeKpi.slabInfo != null && industryVolumeKpi.slabInfo.size() > 0){
                for(JCBDealerIncentiveWrapper.SlabInfo slabs : industryVolumeKpi.slabInfo) {
                    Slab_Info__c slab = new Slab_Info__c();
                    slab.Id = slabs.slabId;
                    slab.DI_KPI_Target_And_Payout_Info__c = kpiTargets.Id;
                    slab.Slab_Range__c = slabs.slabRange;
                    slab.Payout_Mode__c = slabs.payoutMode;
                    slab.Amount__c = slabs.amount; 
                    slab.Payout_Percentage__c = slabs.payoutPercentage;
                    slab.Slab_Type__c = slabs.slabType;
                    slabKPI.add(slab);
                }
            }
            if(slabKPI.size() > 0) {
                upsert slabKPI;
            }
        } catch (Exception e) {
            message = 'ERROR';
            throw e;
        }
        return message;
    }

    @AuraEnabled
    public static void deleteRecordInDatabase(List<List<Id>> deleteIds){
        for(Integer i = 0 ; i < deleteIds.size() ; i++){
            if(deleteIds[i].size() > 0) {
                Database.delete(deleteIds[i]);
            }    
        }  
    }
    
    @AuraEnabled
    public static Boolean isDataPresent(String month,Integer year){
        List<Dealer_Incentive__c> dilist = [select id from Dealer_Incentive__c where Month__c = :month and Year__c = :year];
        if(dilist.size() > 0){
            return true;
        }
        return false;
    }

    @AuraEnabled
    public static List<Dealer_Incentive__c> getDealerIncentives(String month,Integer year,String search,String productName){
        List<Dealer_Incentive__c> dealerIncentiveList =  new List<Dealer_Incentive__c>();
        if(!String.isBlank(productName)){
            dealerIncentiveList = [select id,Dealer_Account__r.Name,(select id,Product_Category__r.Name,Product_Category__c,Total_Retail_Achieved__c,Total_Retail_Predicted__c,Total_Retail_Target__c from DI_Product_Target_and_Achievements__r where Product_Category__r.Name =: productName ) from Dealer_Incentive__c where Month__c = :month and Year__c = :year ORDER BY Dealer_Account__r.Name];
        }
        return dealerIncentiveList;
    }

    @AuraEnabled
    public static List<Dealer_Incentive__c> getDealerIncentivesForStock(String month, Integer year) {
        try {
            List<Dealer_Incentive__c> dealerIncentives = [
                SELECT Id, Dealer_Account__r.Name,Dealer_Account__c,
                    (SELECT Id, Product_Category__r.Name, Product_Category__c, Total_Retail_Achieved__c,Total_Retail_Predicted__c, Total_Retail_Target__c, In_Stock__c,
                        Incentive_Status__c, Should_Have__c
                    FROM DI_Product_Target_and_Achievements__r)
                FROM Dealer_Incentive__c
                WHERE Month__c = :month AND Year__c = :year
                ORDER BY Dealer_Account__r.Name
            ];
            return dealerIncentives;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred while fetching Dealer Incentives: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable = true)
    public static List<Account> getDealerIncentivesByAccount(String month , Integer year){
        List<Account> accounts = [SELECT Id, Name, JCB_India_Zone__c, type, (SELECT Id, Month__c, Year__c, Dealer_Account__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c FROM Dealer_Incentives__r WHERE Month__c = :month AND Year__c = :year) FROM Account WHERE  JCB_India_Zone__c != null and Type = 'Dealer' and Region__c = 'India' and Dealer_Location_Status__c = 'HQ' and Active__c = true];
        return accounts;
    }

    @AuraEnabled
    public static List<DI_Product_Category__c> getProductsAndSubCategories(){
        List<DI_Product_Category__c> productCategoryList = new List<DI_Product_Category__c>();
        try {
            productCategoryList = [select id,Name,Order_No__c,(select id,name from DI_Product_Sub_Categories__r ) from DI_Product_Category__c ORDER BY Order_No__c ASC];
        } catch (Exception e) {
            throw e;
        }
        return productCategoryList;
    }


    @AuraEnabled
    public static String saveKpiAchievements(List<DI_KPI_Achievement__c> inputData, String month, Integer year ,List<Id> accountIds) {
        String message = '';
        List<DI_KPI_Achievement__c> updatingKPIAchievementList = inputData;
        try {
            upsert updatingKPIAchievementList;
            message = 'SUCCESS';
        }
        catch(Exception e) {
            message = 'ERROR';
            throw e;
        }
        return message;
    }

    @AuraEnabled
    public static List<DI_KPI_Achievement__c> getKPIAchivementsByDealers(String month , Integer year ){
        try {
            List<DI_KPI_Achievement__c> kpiAchievementList = [
                SELECT id,Name,Achieved_KPI_Perncentage__c,Product_KPI__r.KPI__r.Data_Source__c,Predicted_KPI_Percentage__c,Product_KPI__c,Product_KPI__r.Name,DI_Product_Target_and_Achivement__c,DI_Product_Target_and_Achivement__r.Name,DI_Product_Target_and_Achivement__r.Product_Category__c,DI_Product_Target_and_Achivement__r.Product_Category__r.Name,DI_Product_Target_and_Achivement__r.Dealer_Incentive__c,DI_Product_Target_and_Achivement__r.Dealer_Incentive__r.Name,DI_Product_Target_and_Achivement__r.Dealer_Incentive__r.Dealer_Account__c,DI_Product_Target_and_Achivement__r.Dealer_Incentive__r.Dealer_Account__r.Name
                FROM DI_KPI_Achievement__c
                WHERE DI_Product_Target_and_Achivement__r.Dealer_Incentive__r.Month__c =:month  AND DI_Product_Target_and_Achivement__r.Dealer_Incentive__r.Year__c =:year AND Product_KPI__r.KPI__r.Data_Source__c ='External'
            ];
            return kpiAchievementList;
        } catch (Exception e) {
            return new List<DI_KPI_Achievement__c>();
        }
    }

    @AuraEnabled
    public static Map<String,List<DI_Product_KPI__c>> getProductsAndKPI(){
        Map<String,List<DI_Product_KPI__c>> prodAndKpi;
        try {
            List<DI_Product_KPI__c> pdKpi=[Select Id,Name,Product_Category__r.Name,KPI__r.Name,KPI__r.Data_Source__c,Order_No__c From DI_Product_KPI__c where KPI__r.Data_Source__c ='External' ORDER BY Order_No__c];
            prodAndKpi=new Map<String,List<DI_Product_KPI__c>>();
            for(DI_Product_KPI__c pdk:pdKpi){
                if(!prodAndKpi.containsKey(pdk.Product_Category__r.Name)){
                    prodAndKpi.put(pdk.Product_Category__r.Name,new List<DI_Product_KPI__c>{pdk});
                }else{
                    prodAndKpi.get(pdk.Product_Category__r.Name).add(pdk);
                }
            }
        } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
        }
        return prodAndKpi;
    }

    @AuraEnabled
    public static List<DI_KPI_Target_And_Payout_Info__c> getKpiTargetAndPayouts(String month,Integer year,String productName){
        try {
            List<DI_KPI_Target_And_Payout_Info__c> kpiTrgtAndPyt = [select id,name,Month__c,Year__c,DI_Product_KPI__c,DI_Product_KPI__r.Name,DI_Product_KPI__r.Product_Category__c,DI_Product_KPI__r.Product_Category__r.Name,Type__c from DI_KPI_Target_And_Payout_Info__c where Month__c =:month and Year__c =:year and DI_Product_KPI__r.Product_Category__r.Name =:productName];
            List<DI_KPI_Target_And_Payout_Info__c> ceRatioTargets = JCBDealerIncentiveController.getKPITargetandPayouts(null, year, 'Product To CE Ratio', productName);
            if(ceRatioTargets != null && ceRatioTargets?.size() > 0) {
                kpiTrgtAndPyt.addAll(ceRatioTargets);
            }
            return kpiTrgtAndPyt;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Slab_Info__c> getSlabInfos(String month,Integer year,String productName){
        try {
            List<Slab_Info__c> slabInfos = [select id,Name,DI_Product_KPI__r.Name,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name,DI_Product_KPI__r.KPI__r.Data_Source__c,DI_Product_KPI__r.KPI__r.KPI_Visiblity__c,DI_KPI_Target_And_Payout_Info__c,DI_Multi_KPI_Target_Config__c,DI_Product_KPI__c,DI_Multi_KPI_Target_Config__r.DI_Product_Target__c,DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.Month__c,DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.Year__c,DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.DI_Product_Category__c,DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.DI_Product_Category__r.Name, All_Machine_Retail__c from Slab_Info__c where DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.DI_Product_Category__r.Name =: productName and DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.Month__c =:month  AND DI_Multi_KPI_Target_Config__r.DI_Product_Target__r.Year__c =:year];
            return slabInfos;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteSlab(Id idToDelete){
        if(idToDelete != null) {
            Database.delete(idToDelete);
        }
    }

    @AuraEnabled
    public static List<DI_Product_Target__c> getProductTargets(String month,Integer year){
        List<DI_Product_Target__c> productTargetsList = new List<DI_Product_Target__c>();
        try {
            productTargetsList = [select id,Name,Month__c,Year__c,DI_Product_Category__r.Name,DI_Product_Category__c,Stock_Policy__c  from DI_Product_Target__c where Month__c=:month and Year__c=:year];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return productTargetsList;
    }

    @AuraEnabled
    public static List<Dealer_Incentive__c> saveInHandProductTargetAndAchievements(List<DI_Product_Target_and_Achievement__c> inputData, String month, Integer year) {

        List<DI_Product_Target_and_Achievement__c> updatingProductTargetAndAchievements = inputData;

        Update updatingProductTargetAndAchievements;
        List<Dealer_Incentive__c> savedPrdTrgtAndAchvmntsByDealers = [select id,Dealer_Account__r.Name,(select id,Product_Category__r.Name,Product_Category__c,Total_Retail_Achieved__c,Total_Retail_Predicted__c,Total_Retail_Target__c,Incentive_Status__c,In_Stock__c,Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c from DI_Product_Target_and_Achievements__r ) from Dealer_Incentive__c where Month__c = :month and Year__c = :year ORDER BY Dealer_Account__r.Name];
        return savedPrdTrgtAndAchvmntsByDealers;
    }

    @AuraEnabled
    public static Id saveProductTargets(List<DI_Product_Target__c> inputdata,String month,Integer year,String productName){
        List<DI_Product_Target__c> updatingProductTargets = inputdata;
        for(DI_Product_Target__c prdTgt:updatingProductTargets){
            if(String.isEmpty(prdTgt.Id)){
                Insert prdTgt;
            }
            else{
                Update prdTgt;
            }
        }
        DI_Product_Target__c productTargetRecord = [SELECT Id FROM DI_Product_Target__c WHERE Month__c = :month AND Year__c = :year AND DI_Product_Category__r.Name = :productName LIMIT 1];
        return productTargetRecord != null ? productTargetRecord.Id : null;
    }

    @AuraEnabled
    public static void clearSingleField(Id recordId, String fieldToClear, Boolean salesmanIncentive , Boolean industryIncentive) {
        DI_KPI_Target_And_Payout_Info__c record = [SELECT Id, Sales_Person_Incentive_Target__c, Is_Salesman_Incentive__c, Is_Total_Volume_Industry__c FROM DI_KPI_Target_And_Payout_Info__c WHERE Id = :recordId LIMIT 1];
        if(!salesmanIncentive){
            record.Sales_Person_Incentive_Target__c = '';        
            record.Is_Salesman_Incentive__c = salesmanIncentive;
        }else{
            record.Is_Total_Volume_Industry__c = industryIncentive;
        }
        update record;
    }

    @AuraEnabled
    public static Map<String,Object> getTargetsAndPayouts(String month, Integer year, List<Id> dealerIds, Boolean isActual) {
        List<JCBDealerIncentiveWrapper.ProductKPIAndPayout> prodTargetAndPayoutInfo = new List<JCBDealerIncentiveWrapper.ProductKPIAndPayout>();
        Map<String,Object> resultMap;
        try {
            Map<Id, Dealer_Incentive__c> dealersMap = new Map<Id, Dealer_Incentive__c>();
            List<Id> dealerIncIds = new List<Id>();
            Map<Id, DI_Product_Target_and_Achievement__c> prodTargetsMap = new Map<Id, DI_Product_Target_and_Achievement__c>();
            List<Id> prodTargetIds = new List<Id>();
            Map<Id, DI_KPI_Achievement__c> kpiAchMap = new Map<Id, DI_KPI_Achievement__c>();
            List<Id> kpiAchIds = new List<Id>();
            String qry = 'Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = ' + year;
            if(month != null) {
                qry += ' AND Month__c = \'' + month + '\'';
            }
            if(dealerIds != null && dealerIds.size() > 0) {
                qry += ' AND Dealer_Account__c = ' + dealerIds;
            }
            // if(dealerIds != null && dealerIds.size() > 0) {
            //     dealersMap = new Map<Id, Dealer_Incentive__c>([Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :year AND Month__c = :month AND Dealer_Account__c = :dealerIds]);
            // } else {
            //     dealersMap = new Map<Id, Dealer_Incentive__c>([Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :year AND Month__c = :month]);
            // }
            dealersMap = new Map<Id, Dealer_Incentive__c>((List<Dealer_Incentive__c>)Database.query(qry));
            dealerIncIds = new List<Id>(dealersMap.keySet());
            Map<String,List<DI_Product_KPI__c>> prodANDKPI = JCBDealerIncentiveController.getProductsAndKPI();
            List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dealerInfoWrappers = new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>();
            if(dealerIncIds.size() > 0) {
                prodTargetsMap = new Map<Id, DI_Product_Target_and_Achievement__c>([Select Id, Product_Category__c, Product_Category__r.Name, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_4WD_Predicted__c, Total_Retail_2WD_Predicted__c, Total_Retail_4WD_Achieved__c, Total_Retail_2WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c, Quarter_Retail_Predicted__c, Quarter_Retail_Achieved__c,
                (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c,SubCategory_Retail_Predicted__c, SubCategory_Retail_Achieved__c, SubCategory_Predicted_Payout__c, SubCategory_Actual_Payout_Achieved__c, DI_Product_Target_and_Achivement__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c = :dealerIncIds]);
                prodTargetIds = new List<Id>(prodTargetsMap.keySet());
                kpiAchMap = new Map<Id, DI_KPI_Achievement__c>([Select Id, Achieved_KPI_Payout__c, Achieved_KPI_Perncentage__c, DI_Product_Target_and_Achivement__c, Predicted_KPI_Payout__c, Predicted_KPI_Percentage__c, Product_KPI__c, Additional_Predicted_KPI_Payout__c, Additional_Achieved_KPI_Payout__c, Actual_Potential_Amount__c, Predicted_Potential_Amount__c, Indent_Order__c, Indent_Wholesale__c, DI_Product_Target_and_Achivement__r.Dealer_Incentive__c, Product_KPI__r.KPI__r.Name, Product_KPI__r.KPI__c, Product_KPI__r.Product_Category__r.Name, Product_KPI__r.KPI__r.KPI_Visiblity__c from DI_KPI_Achievement__c where DI_Product_Target_and_Achivement__c = :prodTargetIds ORDER BY Product_KPI__r.Order_No__c]);
                kpiAchIds = new List<Id>(kpiAchMap.keySet());
            }
            // List<DI_KPI_Target_And_Payout_Info__c> pt = [SELECT Id, Month__c, Year__c, KPI_Target__c,Type__c, Has_Slabs__c, DI_Product_KPI__c, KPI_Payout_Amount__c,  DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.KPI__c, DI_Product_KPI__r.Product_Category__r.Name, DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, Machine_Target__c,Previous_Month__c,Previous_Year__c, Sales_Person_Incentive_Target__c, Is_Salesman_Incentive__c, Is_Total_Volume_Industry__c, Growth__c, All_Machine_Retail__c, (Select Id, Slab_Range__c,Payout_Mode__c,  Amount__c, Payout_Percentage__c,DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, DI_Product_KPI__r.KPI__r.KPI_Visiblity__c, DI_Product_KPI__r.Product_Category__c, DI_Product_KPI__r.Product_Category__r.Name, Growth_Range__c, Slab_Type__c, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Month__c = :month AND Year__c = :year ORDER BY DI_Product_KPI__r.Order_No__c];
            List<DI_KPI_Target_And_Payout_Info__c> pt = JCBDealerIncentiveController.getKPITargetandPayouts(null, year, null, null);
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
            // Get Previous year data for Growth Incentive
            //Integer prevYear = year - 1;
            List<Integer> prevYear = new List<Integer>{year, year-1};
            List<Dealer_Incentive__c> prevDealers = new List<Dealer_Incentive__c>();
            String prevQuery = 'Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c IN ' + prevYear;
            if(dealerIds != null && dealerIds.size() > 0) {
                prevQuery += ' AND Dealer_Account__c IN ' + dealerIds;
            }
            prevDealers = Database.query(prevQuery);
            // if(dealerIds?.size() > 0) {
            //     prevDealers = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :prevYear AND Dealer_Account__c = :dealerIds];
            // } else {
            //     prevDealers = [Select Id, Month__c, Year__c, Dealer_Account__r.Name, Dealer_Account__r.JCB_India_Zone__c, Stage__c, Total_Payout_Predicted__c, Total_Additional_Payout_Predicted__c, Additional_Payout_Predicted__c, Additional_Payout_Achieved__c, Growth_Payout_Predicted__c, Growth_Payout_Achieved__c, Multi_KPI_Payout_Predicted__c, Multi_KPI_Payout_Achieved__c, TIV_Payout_Predicted__c, TIV_Payout_Achieved__c, Total_Product_Payout_Predicted__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Product_Payout_Achieved__c, Total_Additional_Payout_Achieved__c, Total_Payout_Achieved__c, Total_Sales_Person_Payout_Predicted__c, Total_Sales_Person_Payout_Achieved__c, Total_Dealer_Payout_Predicted__c, Total_Dealer_Payout_Achieved__c from Dealer_Incentive__c where Year__c = :prevYear];
            // }

            Map<Id, List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>> dealerWrappers = new Map<Id, List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>>();
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
                    if(dealerWrappers.containsKey(dealerWrap.dealerId)) {
                        List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dList = dealerWrappers.get(dealerWrap.dealerId);
                        dList.add(dealerWrap);
                        dealerWrappers.put(dealerWrap.dealerId, dList);
                    } else {
                        List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper> dList = new List<JCBDealerIncentiveWrapper.DealerIncentivePayoutWrapper>{dealerWrap};
                        dealerWrappers.put(dealerWrap.dealerId, dList);
                    }
                }
            }

            if(pt != null && pt.size() > 0){
                for(DI_KPI_Target_And_Payout_Info__c ptp : pt) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(ptp);
                    kpiWrap.productPayouts = kpiSubPayoutMap.get(ptp.Id);
                    prodTargetAndPayoutInfo.add(kpiWrap);
                }
            }
            List<DI_KPI_Target_And_Payout_Info__c> ceRatioTargets = JCBDealerIncentiveController.getKPITargetandPayouts(null, year, 'Product To CE Ratio', null);
            if(ceRatioTargets != null && ceRatioTargets.size() > 0){
                for(DI_KPI_Target_And_Payout_Info__c ptp : ceRatioTargets) {
                    JCBDealerIncentiveWrapper.ProductKPIAndPayout kpiWrap = new JCBDealerIncentiveWrapper.ProductKPIAndPayout(ptp);
                    kpiWrap.productPayouts = kpiSubPayoutMap.get(ptp.Id);
                    prodTargetAndPayoutInfo.add(kpiWrap);
                }
            }
            List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargetWrappers = JCBDealerIncentiveController.getMultiKPITargets(month, year);
            resultMap=new Map<String,Object>();
            resultMap.put('prodTargetAndPayoutInfo', prodTargetAndPayoutInfo);
            resultMap.put('dealersMap', dealersMap);
            resultMap.put('dealerIncIds', dealerIncIds);
            resultMap.put('prodTargetsMap', prodTargetsMap);
            resultMap.put('prodTargetIds', prodTargetIds);
            resultMap.put('kpiAchMap', kpiAchMap);
            resultMap.put('kpiAchIds', kpiAchIds);
            resultMap.put('productsKPI', prodANDKPI);
            resultMap.put('isActual', isActual);
            resultMap.put('prevDealerWrappers', dealerWrappers);
            resultMap.put('multiKpitargetInfo',productTargetWrappers);
        } catch(Exception e) {
            throw e;
        }
        return resultMap;
    }

    @AuraEnabled
    public static String saveKpiPayouts(List<DI_KPI_Achievement__c> kpiAchievements, List<DI_SubCategory_Target_and_Achievement__c> subTargets, List<DI_Product_Target_and_Achievement__c> productTargets, List<Dealer_Incentive__c> dealerIncentives, List<Id> deletedIds) {
        String message = 'SUCCESS';
        try {
            if(kpiAchievements != null && kpiAchievements.size() > 0) {
                upsert kpiAchievements;
            }
            if(subTargets != null && subTargets.size() > 0) {
                upsert subTargets;
            }
            if(productTargets != null && productTargets.size() > 0) {
                upsert productTargets;
            }
            if(dealerIncentives != null && dealerIncentives.size() > 0) {
                upsert dealerIncentives;
            }
            if(deletedIds.size() > 0) {
                Database.delete(deletedIds);
            }
        } catch(Exception e) {
            message = 'ERROR';
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    @AuraEnabled
    public static Map<String, Object> deleteAdditionalRecords(String month, Integer year, String product, Boolean isDelete) {
        DI_Product_Target__c productTarget = [Select Id, Name,DI_Product_Category__r.Name FROM DI_Product_Target__c WHERE Month__c = :month AND Year__c = :year AND DI_Product_Category__r.Name =: product LIMIT 1];
        List<DI_Multi_KPI_Target_Config__c> listOfMulti = [SELECT Id, Month__c, Year__c, DI_Product_Target__c FROM DI_Multi_KPI_Target_Config__c WHERE Month__c = :month AND Year__c = :year AND DI_Product_Target__c =: productTarget.Id];
        List<Slab_Info__c> listOfSlab = [SELECT Id, Slab_Range__c, Payout_Percentage__c,DI_Multi_KPI_Target_Config__c, All_Machine_Retail__c FROM Slab_Info__c WHERE DI_Multi_KPI_Target_Config__c IN :listOfMulti];
        List<DI_KPI_Target_And_Payout_Info__c> listOfKpi = [SELECT Id, Month__c, Year__c, DI_Product_Target__c, (SELECT Id, Slab_Range__c, Payout_Percentage__c,DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name, All_Machine_Retail__c FROM Slab_Infos__r) FROM DI_KPI_Target_And_Payout_Info__c WHERE Month__c = :month AND Year__c =: year AND DI_Product_Target__c  =: productTarget.Id AND (type__c = 'Growth Additional Incentive' OR type__c ='Additional Incentive Target' OR type__c ='Product To CE Ratio')];
        Map<String, Object> resultMap = new Map<String, Object>();
        try {
            if(!isDelete){
                resultMap.put('listOfMulti', listOfMulti);
                resultMap.put('listOfSlab', listOfSlab);
                resultMap.put('listOfKpi', listOfKpi);
            }else{
                if (!listOfSlab.isEmpty()) {
                    delete listOfSlab;
                }if (!listOfMulti.isEmpty()) {
                    delete listOfMulti;
                }if(!listOfKpi.isEmpty()){
                    delete listOfKpi;
                }
            }
            
        } catch (DmlException e) {
            System.debug('Error deleting Slab_Info__c records: ' + e.getMessage());
        }
        return resultMap;
    }

      @AuraEnabled
    public static String saveMultipleKPITarget(List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargets){
        String message = 'SUCCESS';
        try {
            List<DI_Product_Target__c> dIproductTargets = new List<DI_Product_Target__c>();
            List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productMultikpiTargets = productTargets;
            for(JCBDealerIncentiveWrapper.ProductTargetWrapper prodWrap : productMultikpiTargets){
                DI_Product_Target__c prodTarg = new DI_Product_Target__c();
                prodTarg.Id = prodWrap.productTargetId;
                prodTarg.Month__c = prodWrap.month;
                prodTarg.Year__c = prodWrap.year;
                prodTarg.DI_Product_Category__c = prodWrap.productCategory.productId;
                dIproductTargets.add(prodTarg);
            }
            if(dIproductTargets.size() > 0){
                upsert dIproductTargets;
                List<DI_Multi_KPI_Target_Config__c> multipleKPI = new List<DI_Multi_KPI_Target_Config__c>();
                List<Slab_Info__c> slabKPI = new List<Slab_Info__c>();
                for(Integer i = 0; i < productMultikpiTargets.size(); i++) {
                    JCBDealerIncentiveWrapper.ProductTargetWrapper prodTarWrap = productMultikpiTargets[i];
                    if(prodTarWrap.multiKpi != null && prodTarWrap.multiKpi.size() > 0){
                        for(JCBDealerIncentiveWrapper.DIMultiWrapper multi : prodTarWrap.multiKpi) {
                            DI_Multi_KPI_Target_Config__c kpiTarg = new DI_Multi_KPI_Target_Config__c();
                            kpiTarg.Id = multi.multiKpiId;
                            kpiTarg.Condition_Logic__c = multi.conditionLogic;
                            kpiTarg.Custom_Logic__c = multi.customLogic;
                            kpiTarg.Month__c = multi.month;
                            kpiTarg.Year__c = multi.year;
                            kpiTarg.Amount__c = multi.incentiveAmount;
                            kpiTarg.DI_Product_Target__c = dIproductTargets[i].Id;
                            multipleKPI.add(kpiTarg);
                        }
                    }
                    if(multipleKPI.size() > 0){
                        upsert multipleKPI;
                        for(Integer j = 0; j < prodTarWrap.multiKpi.size(); j++) {
                            JCBDealerIncentiveWrapper.DIMultiWrapper prodTarMultiWrap = prodTarWrap.multiKpi[j];
                            if(prodTarMultiWrap.multiKpSlabs != null && prodTarMultiWrap.multiKpSlabs.size() > 0) {
                                for(JCBDealerIncentiveWrapper.SlabInfo multiSlabs : prodTarMultiWrap.multiKpSlabs){
                                    Slab_Info__c slabKPIs = new Slab_Info__c();
                                    slabKPIs.Id = multiSlabs.slabId;
                                    slabKPIs.DI_Multi_KPI_Target_Config__c = multipleKPI[j].Id;
                                    slabKPIs.Slab_Range__c = multiSlabs.slabRange;
                                    slabKPIs.DI_Product_KPI__c = multiSlabs.productKPI.productKPIId;
                                    slabKPI.add(slabKPIs);
                                }
                            }
                        }
                        if(slabKPI.size() > 0){
                            upsert slabKPI;
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    @AuraEnabled
    public static List<JCBDealerIncentiveWrapper.ProductTargetWrapper> getMultiKPITargets(String month, Decimal year, String product) {
        List<JCBDealerIncentiveWrapper.ProductTargetWrapper> productTargetList = new List<JCBDealerIncentiveWrapper.ProductTargetWrapper>();
        JCBDealerIncentiveWrapper.ProductTargetWrapper productTarget = new JCBDealerIncentiveWrapper.ProductTargetWrapper();
        List<DI_Multi_KPI_Target_Config__c> multiConfigList = [SELECT Id,Amount__c,Custom_Logic__c, Condition_Logic__c, Month__c, Year__c,DI_Product_Target__c,DI_Product_Target__r.Id FROM DI_Multi_KPI_Target_Config__c WHERE DI_Product_Target__c != null];
        Map<Id, List<JCBDealerIncentiveWrapper.DIMultiWrapper>> multiConfigMap = new Map<Id, List<JCBDealerIncentiveWrapper.DIMultiWrapper>>();
        for (DI_Multi_KPI_Target_Config__c multiConfig : multiConfigList) {
            JCBDealerIncentiveWrapper.DIMultiWrapper dIMultiWrap = new JCBDealerIncentiveWrapper.DIMultiWrapper(multiConfig);
            if (!multiConfigMap.containsKey(multiConfig.DI_Product_Target__c)) {
                multiConfigMap.put(multiConfig.DI_Product_Target__c, new List<JCBDealerIncentiveWrapper.DIMultiWrapper>());
            }
            multiConfigMap.get(multiConfig.DI_Product_Target__c).add(dIMultiWrap);
        }
      
        List<Slab_Info__c> slabList = [SELECT Id,Slab_Range__c,Payout_Mode__c,Amount__c,Payout_Percentage__c,Growth_Range__c,Slab_Type__c, DI_Product_KPI__c,DI_Product_KPI__r.KPI__c,DI_Product_KPI__r.KPI__r.Name,DI_Product_KPI__r.KPI__r.KPI_Visiblity__c,DI_Product_KPI__r.Product_Category__c,DI_Product_KPI__r.Product_Category__r.Name,DI_Multi_KPI_Target_Config__c,DI_Multi_KPI_Target_Config__r.Id, All_Machine_Retail__c FROM Slab_Info__c WHERE DI_Multi_KPI_Target_Config__c != null];
        Map<Id, List<JCBDealerIncentiveWrapper.SlabInfo>> slabMap = new Map<Id, List<JCBDealerIncentiveWrapper.SlabInfo>>();
        for (Slab_Info__c slab : slabList) {
            JCBDealerIncentiveWrapper.SlabInfo slabWrap = new JCBDealerIncentiveWrapper.SlabInfo(slab);
            if (!slabMap.containsKey(slab.DI_Multi_KPI_Target_Config__c)) {
                slabMap.put(slab.DI_Multi_KPI_Target_Config__c, new List<JCBDealerIncentiveWrapper.SlabInfo>());
            }
            slabMap.get(slab.DI_Multi_KPI_Target_Config__c).add(slabWrap);
        }
        try {     
            List<DI_Product_Target__c> diProducts = new List<DI_Product_Target__c>();
            if(product !=null){
                diProducts = [SELECT Id,Month__c, Year__c,DI_Product_Category__c, DI_Product_Category__r.Name,DI_Product_Category__r.Order_No__c FROM DI_Product_Target__c WHERE Month__c =: month AND Year__c=:year AND DI_Product_Category__r.Name=:product];
            }else{
                diProducts = [SELECT Id,Month__c, Year__c,DI_Product_Category__c, DI_Product_Category__r.Name,DI_Product_Category__r.Order_No__c FROM DI_Product_Target__c WHERE Month__c =: month AND Year__c=:year];
            }
            for(DI_Product_Target__c multiInfo : diProducts){
                List<JCBDealerIncentiveWrapper.DIMultiWrapper> multiTarget = multiConfigMap.get(multiInfo.Id);
                productTarget = new JCBDealerIncentiveWrapper.ProductTargetWrapper(multiInfo);
                if(multiTarget != null){
                    for(Integer i=0; i<multiTarget.size(); i++){
                        JCBDealerIncentiveWrapper.DIMultiWrapper multi = multiTarget[i];
                        multi.multiKpSlabs = slabMap.get(multi.multiKpiId);
                     }
                     productTarget.multiKpi = multiTarget;
                }
                productTargetList.add(productTarget);
            }
        } catch(Exception e) {
            System.debug('Exception type: ' + e.getTypeName());
            System.debug('Message: ' + e.getMessage());
            System.debug('Cause: ' + e.getCause()); 
            System.debug('Line number: ' + e.getLineNumber());
            System.debug('Stack trace: ' + e.getStackTraceString());
            System.debug('exception ----****    ' +e);
           throw e;
        }
        return productTargetList;
    }
}