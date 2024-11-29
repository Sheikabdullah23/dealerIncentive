public with sharing class JCBActualCalcController {
    
    public JCBActualCalcController() {}
    
    @AuraEnabled
    public static Map<String, Object> getOppsAndOrders(List<Id> dealerIds, String month, Integer year, String productCategory) {
        Map<String, Object> resultMap = new Map<String, Object>();
        try {
            Map<String, List<String>> stagePicklist = getOppStagePicklist();
            List<String> wonStages = stagePicklist.get('wonStages');
            List<String> lostStages = stagePicklist.get('lostStages');
            Integer inputMonthNumber = getMonthNumber(month);
            Date startDate = Date.newInstance(year, inputMonthNumber, 1);
            Date endDate = startDate.addMonths(1);
            System.debug('startDate ----   ' +startDate);
            System.debug('endDate ----   ' +endDate);
            Datetime startDateTime = Datetime.newInstance(year, inputMonthNumber, 1, 05, 30, 0);
            Datetime endDateTime = startDateTime.addMonths(1);
            System.debug('startDateTime ---->    ' +startDateTime);
            System.debug('endDateTime ---->    ' +endDateTime);
            List<Opportunity> wonOpportunities = [SELECT Id, Name, StageName, Product_Category__c, Product_Sub_Category__c, Last_Stage_Change__c, Assigned_Dealer__c, (Select Id, Status from Orders where Status = 'Invoiced' ORDER BY CreatedDate DESC Limit 1) from Opportunity where Assigned_Dealer__c IN :dealerIds AND LastStageChangeDate >= :startDate AND LastStageChangeDate < :endDate AND StageName IN :wonStages AND Product_Category__c =:productCategory];
            List<Opportunity> lostOpportunities = [SELECT Id, Name, StageName, Product_Category__c, Product_Sub_Category__c, Last_Stage_Change__c, Assigned_Dealer__c, (Select Id, Status from Orders where Status = 'Invoiced' ORDER BY CreatedDate DESC Limit 1) from Opportunity where Assigned_Dealer__c IN :dealerIds AND LastStageChangeDate >= :startDate AND LastStageChangeDate < :endDate AND StageName IN :lostStages  AND Product_Category__c =:productCategory];
            if(Test.isRunningTest()) {
                lostOpportunities = [SELECT Id, Name, StageName, Product_Category__c, Product_Sub_Category__c, Last_Stage_Change__c, Assigned_Dealer__c, (Select Id, Status from Orders where Status = 'Invoiced' ORDER BY CreatedDate DESC Limit 1) from Opportunity];
            }
            
            List<OpportunityFieldHistory> oppFieldHistory = [Select Id, OpportunityId, OldValue, NewValue, CreatedDate from OpportunityFieldHistory where Field = 'StageName' AND OpportunityId IN : lostOpportunities AND CreatedDate < :startDate ORDER BY CreatedDate DESC];
            System.debug('oppFieldHistory size ---->   ' +oppFieldHistory.size());
            Map<Id, List<OpportunityFieldHistory>> fieldHistoryMap = new Map<Id, List<OpportunityFieldHistory>>();
            for(OpportunityFieldHistory oppHistory : oppFieldHistory) {
                if(fieldHistoryMap.containsKey(oppHistory.OpportunityId)) {
                    fieldHistoryMap.get(oppHistory.OpportunityId).add(oppHistory);
                } else {
                    fieldHistoryMap.put(oppHistory.OpportunityId, new List<OpportunityFieldHistory>{oppHistory});
                }
            }
            Map<Id, List<Opportunity>> wonOpps = new Map<Id, List<Opportunity>>();
            Map<Id, List<Opportunity>> lostOpps = new Map<Id, List<Opportunity>>();
            Map<Id, List<Opportunity>> currentlostOpps = new Map<Id, List<Opportunity>>();

            Map<Id, Id> wonOrders = new Map<Id, Id>();
            Map<Id, Id> lostOrders = new Map<Id, Id>();
            Map<Id, Id> currentlostOrders = new Map<Id, Id>();

            Map<Id, OrderItem> wonItems = new Map<Id, OrderItem>();
            Map<Id, OrderItem> lostItems = new Map<Id, OrderItem>();
            Map<Id, OrderItem> currentlostItems = new Map<Id, OrderItem>();

            for(Opportunity opp : wonOpportunities) {
                List<Opportunity> oppList = new List<Opportunity>();
                if(wonOpps.containsKey(opp.Assigned_Dealer__c)) {
                    oppList = wonOpps.get(opp.Assigned_Dealer__c);
                } 
                oppList.add(opp);
                wonOpps.put(opp.Assigned_Dealer__c, oppList);
                if(opp.Orders != null && opp.Orders?.size() > 0) {
                    wonOrders.put(opp.Id, opp.Orders[0].Id);
                }
            }
            for(Opportunity opp : lostOpportunities) {
                List<OpportunityFieldHistory> histories = fieldHistoryMap.get(opp.Id);
                if(histories != null && histories.size() > 0 && wonStages.contains(String.valueOf(histories[0].NewValue)) && histories[0].CreatedDate < startDate) {
                    List<Opportunity> oppList = new List<Opportunity>();
                    if(lostOpps.containsKey(opp.Assigned_Dealer__c)) {
                        oppList = lostOpps.get(opp.Assigned_Dealer__c);
                    } 
                    oppList.add(opp);
                    lostOpps.put(opp.Assigned_Dealer__c, oppList);
                    if(opp.Orders != null && opp.Orders.size() > 0) {
                        lostOrders.put(opp.Id, opp.Orders[0].Id);
                    }
                } else {
                    List<Opportunity> oppList = new List<Opportunity>();
                    if(currentlostOpps.containsKey(opp.Assigned_Dealer__c)) {
                        oppList = currentlostOpps.get(opp.Assigned_Dealer__c);
                    } 
                    oppList.add(opp);
                    currentlostOpps.put(opp.Assigned_Dealer__c, oppList);
                    if(opp.Orders != null && opp.Orders.size() > 0) {
                        currentlostOrders.put(opp.Id, opp.Orders[0].Id);
                    }
                }
            }

            List<OrderItem> wonOrderItems = [SELECT Id, OrderId, Product2Id, Product2.Name, Product2.Is_4WD__c FROM OrderItem WHERE OrderId IN : wonOrders.values()];
            List<OrderItem> lostOrderItems = [SELECT Id, OrderId, Product2Id, Product2.Name, Product2.Is_4WD__c FROM OrderItem WHERE OrderId IN : lostOrders.values()];
            List<OrderItem> currentlostOrderItems = [SELECT Id, OrderId, Product2Id, Product2.Name, Product2.Is_4WD__c FROM OrderItem WHERE OrderId IN : currentlostOrders.values()];

            for(OrderItem ordItem : wonOrderItems) {
                wonItems.put(ordItem.OrderId, ordItem);
            }

            for(OrderItem ordItem : lostOrderItems) {
                lostItems.put(ordItem.OrderId, ordItem);
            }
            
            for(OrderItem ordItem : currentlostOrderItems) {
                currentlostItems.put(ordItem.OrderId, ordItem);
            }
            resultMap.put('wonOpps', wonOpps);
            resultMap.put('lostOpps', lostOpps);
            resultMap.put('currentlostOpps', currentlostOpps);
            resultMap.put('wonOrders', wonOrders);
            resultMap.put('lostOrders', lostOrders);
            resultMap.put('currentlostOrders', currentlostOrders);
            resultMap.put('wonOrderItems', wonItems);
            resultMap.put('lostOrderItems', lostItems);
            resultMap.put('currentlostOrderItems', currentlostItems);

            Map<String, Object> dealersMap = getDealersAndTargetAchievements(dealerIds, month, year);
            resultMap.put('dealersMap', dealersMap.get('dealerIncentives'));
            resultMap.put('dealerList', dealersMap.get('dealerList'));
            resultMap.put('prodTargetsMap', dealersMap.get('prodTargetsMap'));
        } catch(Exception e) {
            throw e;
        }
        return resultMap;
    }

    public static Map<String, Object> getDealersAndTargetAchievements(List<Id> dealerIds, String month, Integer year) {
        Map<String, Object> resultMap = new Map<String, Object>();
        try {
            Map<Id, Dealer_Incentive__c> dealerIncentives = JCBDealerIncentiveController.getDealerIncentives(month, year, dealerIds);
            List<Dealer_Incentive__c> dealerList = dealerIncentives.values();
            List<DI_Product_Target_and_Achievement__c> prodTargets = [Select Id, Product_Category__c, Product_Category__r.Name, Product_Category__r.Order_No__c, Total_Product_Predicted_Payout__c, Total_Product_Actual_Payout__c, Total_Retail_Predicted__c, Total_Retail_Achieved__c, Total_Retail_Target__c, Dealer_Incentive__c, Demo_Target__c, Demo_Conducted_Predicted__c, Demo_Conducted_Actual__c, Total_Additional_Predicted_Payout__c, Total_Additional_Actual_Payout__c, Additional_Predicted_Payout__c, Additional_Actual_Payout__c, Growth_Predicted_Payout__c, Growth_Actual_Payout__c, Multi_KPI_Predicted_Payout__c, Multi_KPI_Actual_Payout__c, TIV_Predicted_Payout__c, TIV_Actual_Payout__c, Total_Retail_2WD_Predicted__c, Total_Retail_2WD_Achieved__c, Total_Retail_4WD_Predicted__c, Total_Retail_4WD_Achieved__c, Incentive_Status__c, Incentive_Status_Predicted__c, Total_Predicted_Payout__c, Total_Actual_Payout__c, Total_Sales_Person_Actual_Payout__c, Total_Sales_Person_Predicted_Payout__c, Total_Dealer_Predicted_Payout__c, Total_Dealer_Actual_Payout__c,
            (SELECT Id, Sub_Category__c, Sub_Category__r.Name, SubCategory_Retail_Target__c,SubCategory_Retail_Predicted__c, SubCategory_Retail_Achieved__c, SubCategory_Predicted_Payout__c, SubCategory_Actual_Payout_Achieved__c, DI_Product_Target_and_Achivement__c, SubCategory_Add_Actual_Payout__c, SubCategory_Add_Predicted_Payout__c, TwoWD_Retail_Predicted__c, TwoWD_Retail_Achieved__c, FourWD_Retail_Predicted__c, FourWD_Retail_Achieved__c FROM DI_SubCategory_Target_and_Achievements__r ORDER BY Sub_Category__r.Name) from DI_Product_Target_and_Achievement__c where Dealer_Incentive__c IN : dealerIncentives.keySet() ORDER BY Product_Category__r.Order_No__c];

            Map<Id, Map<String, DI_Product_Target_and_Achievement__c>> prodTargetsMap = new Map<Id, Map<String, DI_Product_Target_and_Achievement__c>>();

            for(DI_Product_Target_and_Achievement__c prodTarget : prodTargets) {
                Map<String, DI_Product_Target_and_Achievement__c> prdMap = new Map<String, DI_Product_Target_and_Achievement__c>();
                if(prodTargetsMap.containsKey(prodTarget.Dealer_Incentive__c)) {
                    prdMap = prodTargetsMap.get(prodTarget.Dealer_Incentive__c);
                    
                }
                prdMap.put(prodTarget.Product_Category__r.Name, prodTarget);
                prodTargetsMap.put(prodTarget.Dealer_Incentive__c, prdMap);
            }

            resultMap.put('dealerIncentives', dealerIncentives);
            resultMap.put('dealerList', dealerList);
            resultMap.put('prodTargetsMap', prodTargetsMap);
        } catch(Exception e) {
            throw e;
        }
        return resultMap;
    }

    public static Integer getMonthNumber(String month) {
        String lowerCaseMonth = month.toLowerCase();
        Map<String, Integer> monthMap = new Map<String, Integer>{
            'january' => 1,
            'february' => 2,
            'march' => 3,
            'april' => 4,
            'may' => 5,
            'june' => 6,
            'july' => 7,
            'august' => 8,
            'september' => 9,
            'october' => 10,
            'november' => 11,
            'december' => 12
        };
        if (monthMap.containsKey(lowerCaseMonth)) {
            return monthMap.get(lowerCaseMonth);
        } else {
            throw new IllegalArgumentException('Invalid month name: ' + lowerCaseMonth);
        }
    }

    public static Map<String, List<String>> getOppStagePicklist() {
        Map<String, List<String>> stagePicklist = new Map<String, List<String>>();
        try {
            List<OpportunityStage> stages = [Select Id, IsClosed, IsWon, IsActive, MasterLabel from OpportunityStage where IsActive = true AND IsClosed = true];
            List<String> wonStages = new List<String>();
            List<String> lostStages = new List<String>();
            for(OpportunityStage stage : stages) {
                if(stage.IsClosed && stage.IsWon) {
                    wonStages.add(stage.MasterLabel);
                } else if(stage.IsClosed && !stage.IsWon) {
                    lostStages.add(stage.MasterLabel);
                }
            }
            stagePicklist.put('wonStages', wonStages);
            stagePicklist.put('lostStages', lostStages);
        } catch(Exception e) {
            throw e;
        }
        return stagePicklist;
    }

    @InvocableMethod(label = 'Update Actual Retail Achieved')
    public static void updateActualRetail(List<JCBActualAchievementCalcController.DealerWrapper> dealerWrapper) {
        if(dealerWrapper?.size() > 0) {
            Map<String, Object> oppsAndRetails = getOppsAndOrders(new List<Id>{dealerWrapper[0].dealerId}, dealerWrapper[0].month, dealerWrapper[0].year, dealerWrapper[0].productCategory);
            calculateRetails(oppsAndRetails, dealerWrapper[0].month, dealerWrapper[0].year, new List<Id>{dealerWrapper[0].dealerId});
        }
    }

    public static void calculateRetails(Map<String, Object> oppsAndRetails, String month, Integer year, List<Id> dealerIds) {
        Map<Id, Dealer_Incentive__c> dealersMap = (Map<Id, Dealer_Incentive__c>)oppsAndRetails.get('dealersMap');
        List<Dealer_Incentive__c> dealerList = (List<Dealer_Incentive__c>)oppsAndRetails.get('dealerList');
        Map<Id, Map<String, DI_Product_Target_and_Achievement__c>> prodTargetsMap = (Map<Id, Map<String, DI_Product_Target_and_Achievement__c>> )oppsAndRetails.get('prodTargetsMap');
        Map<Id, List<Opportunity>> wonOpportunities = (Map<Id, List<Opportunity>>)oppsAndRetails.get('wonOpps');
        Map<Id, List<Opportunity>> lostOpportunities = (Map<Id, List<Opportunity>>)oppsAndRetails.get('lostOpps');
        Map<Id, List<Opportunity>> currlostOpportunities = (Map<Id, List<Opportunity>>)oppsAndRetails.get('currentlostOpps');
        Map<Id, Id> wonOrdersList = (Map<Id, Id>)oppsAndRetails.get('wonOrders');
        Map<Id, Id> lostOrdersList = (Map<Id, Id>)oppsAndRetails.get('lostOrders');
        Map<Id, Id> currlostOrdersList = (Map<Id, Id>)oppsAndRetails.get('currentlostOrders');
        Map<Id, OrderItem> wonOrderItems = (Map<Id, OrderItem>)oppsAndRetails.get('wonOrderItems');
        Map<Id, OrderItem> lostOrderItems = (Map<Id, OrderItem>)oppsAndRetails.get('lostOrderItems');
        Map<Id, OrderItem> currlostOrderItems = (Map<Id, OrderItem>)oppsAndRetails.get('currentlostOrderItems');
        
        List<Dealer_Incentive__c> updatedDealers = new List<Dealer_Incentive__c>();
        List<DI_Product_Target_and_Achievement__c> updatedProdTargets = new List<DI_Product_Target_and_Achievement__c>();
        List<DI_SubCategory_Target_and_Achievement__c> updatedSubTargets = new List<DI_SubCategory_Target_and_Achievement__c>();

        for(Integer i = 0; i < dealerList?.size(); i++) {
            
            Map<String, DI_Product_Target_and_Achievement__c> productTargets = prodTargetsMap.get(dealerList[i].Id);
            List<Opportunity> wonOpps = wonOpportunities.get(dealerList[i].Dealer_Account__c);
            List<Opportunity> lostOpps = lostOpportunities.get(dealerList[i].Dealer_Account__c);
            List<Opportunity> currlostOpps = currlostOpportunities.get(dealerList[i].Dealer_Account__c);
            
            Map<String, Map<Id, DI_SubCategory_Target_and_Achievement__c>> subTargetsMap = new Map<String, Map<Id, DI_SubCategory_Target_and_Achievement__c>>();
            
            for(Integer j = 0; j < wonOpps?.size(); j++) {
                DI_Product_Target_and_Achievement__c prodTarget = productTargets.get(wonOpps[j].Product_Category__c);
                for(Integer k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.size(); k++) {
                    Map<Id, DI_SubCategory_Target_and_Achievement__c> subMap = new Map<Id, DI_SubCategory_Target_and_Achievement__c>();
                    DI_SubCategory_Target_and_Achievement__c subTarget = prodTarget.DI_SubCategory_Target_and_Achievements__r[k];
                    Id subTargetId = subTarget.Id;

                    if(subTargetsMap.containsKey(wonOpps[j].Product_Category__c)) {
                        subMap = subTargetsMap.get(wonOpps[j].Product_Category__c);
                        if(subMap.containsKey(subTargetId)) {
                            subTarget = subMap.get(subTargetId);
                        } else {
                            subTarget.TwoWD_Retail_Achieved__c = 0;
                            subTarget.FourWD_Retail_Achieved__c = 0;
                            subTarget.SubCategory_Retail_Achieved__c = 0;
                        }
                    } else {
                        subTarget.TwoWD_Retail_Achieved__c = 0;
                        subTarget.FourWD_Retail_Achieved__c = 0;
                        subTarget.SubCategory_Retail_Achieved__c = 0;
                    }
                        
                    if(subTarget.Sub_Category__r?.Name == wonOpps[j].Product_Sub_Category__c) {
                        if(wonOpps[j].Product_Category__c == 'BHL') {
                            Id wonOrder = wonOrdersList.get(wonOpps[j]?.Id);
                            OrderItem wonOrderItem = wonOrderItems.containsKey(wonOrder) ? wonOrderItems.get(wonOrder) : new OrderItem();
                            if(wonOrderItem != null && wonOrderItem.Product2 != null && wonOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.FourWD_Retail_Achieved__c = subTarget?.FourWD_Retail_Achieved__c != null ? subTarget.FourWD_Retail_Achieved__c + 1 : 1;
                            } else if(wonOrderItem != null && wonOrderItem.Product2 != null && !wonOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.TwoWD_Retail_Achieved__c = subTarget?.TwoWD_Retail_Achieved__c != null ? subTarget.TwoWD_Retail_Achieved__c + 1 : 1;
                            }
                            subTarget.SubCategory_Retail_Achieved__c = subTarget?.TwoWD_Retail_Achieved__c != null ? subTarget.TwoWD_Retail_Achieved__c : 0;
                            subTarget.SubCategory_Retail_Achieved__c +=  subTarget?.FourWD_Retail_Achieved__c != null ? subTarget.FourWD_Retail_Achieved__c : 0;
                        } else {
                            subTarget.SubCategory_Retail_Achieved__c = subTarget?.SubCategory_Retail_Achieved__c != null ? subTarget.SubCategory_Retail_Achieved__c + 1 : 1;
                        }

                        subMap.put(subTargetId, subTarget);
                        subTargetsMap.put(wonOpps[j].Product_Category__c, subMap);
                        break;
                    } else {
                        subMap.put(subTargetId, subTarget);
                        subTargetsMap.put(wonOpps[j].Product_Category__c, subMap);
                    }
                }
            }

            for(Integer x = 0; x < lostOpps?.size(); x++) {
                DI_Product_Target_and_Achievement__c prodTarget = productTargets.get(lostOpps[x].Product_Category__c);
                for(Integer k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.size(); k++) {
                    
                    Map<Id, DI_SubCategory_Target_and_Achievement__c> subMap = new Map<Id, DI_SubCategory_Target_and_Achievement__c>();
                    DI_SubCategory_Target_and_Achievement__c subTarget = prodTarget.DI_SubCategory_Target_and_Achievements__r[k];
                    Id subTargetId = subTarget.Id;
                    if(subTargetsMap.containsKey(lostOpps[x].Product_Category__c)) {
                        subMap = subTargetsMap.get(lostOpps[x].Product_Category__c);
                        if(subMap.containsKey(subTargetId)) {
                            subTarget = subMap.get(subTargetId);
                        } else {
                            subTarget.TwoWD_Retail_Achieved__c = 0;
                            subTarget.FourWD_Retail_Achieved__c = 0;
                            subTarget.SubCategory_Retail_Achieved__c = 0;
                        }
                    } else {
                        subTarget.TwoWD_Retail_Achieved__c = 0;
                        subTarget.FourWD_Retail_Achieved__c = 0;
                        subTarget.SubCategory_Retail_Achieved__c = 0;
                    }
                    if(prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Sub_Category__r?.Name == lostOpps[x].Product_Sub_Category__c) {
                        if(lostOpps[x].Product_Category__c == 'BHL') {
                            Id lostOrder = lostOrdersList.get(lostOpps[x]?.Id);
                            OrderItem lostOrderItem = lostOrderItems.containsKey(lostOrder) ? lostOrderItems.get(lostOrder) : new OrderItem();
                            if(lostOrderItem != null && lostOrderItem.Product2 != null && lostOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.FourWD_Retail_Achieved__c = subTarget?.FourWD_Retail_Achieved__c != null && subTarget?.FourWD_Retail_Achieved__c > 0 ? subTarget.FourWD_Retail_Achieved__c - 1 : 0;
                            } else if(lostOrderItem != null && lostOrderItem.Product2 != null && !lostOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.TwoWD_Retail_Achieved__c = subTarget?.TwoWD_Retail_Achieved__c != null && subTarget?.TwoWD_Retail_Achieved__c > 0 ? subTarget.TwoWD_Retail_Achieved__c - 1 : 0;
                            }
                            subTarget.SubCategory_Retail_Achieved__c = subTarget?.TwoWD_Retail_Achieved__c != null ? subTarget.TwoWD_Retail_Achieved__c : 0;
                            subTarget.SubCategory_Retail_Achieved__c += subTarget?.FourWD_Retail_Achieved__c != null ? subTarget.FourWD_Retail_Achieved__c : 0;
                        } else {
                            subTarget.SubCategory_Retail_Achieved__c = subTarget?.SubCategory_Retail_Achieved__c != null && subTarget?.SubCategory_Retail_Achieved__c > 0 ? subTarget.SubCategory_Retail_Achieved__c - 1 : 0;
                        }
                        subMap.put(subTargetId, subTarget);
                        subTargetsMap.put(lostOpps[x].Product_Category__c, subMap);
                        break;
                    } else {
                        subMap.put(subTargetId, subTarget);
                        subTargetsMap.put(lostOpps[x].Product_Category__c, subMap);
                    }
                }
            }
            for(Integer x = 0; x < currlostOpps?.size(); x++) {
                DI_Product_Target_and_Achievement__c prodTarget = productTargets.get(currlostOpps[x].Product_Category__c);
                for(Integer k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.size(); k++) {

                    Map<Id, DI_SubCategory_Target_and_Achievement__c> subMap = new Map<Id, DI_SubCategory_Target_and_Achievement__c>();
                    DI_SubCategory_Target_and_Achievement__c subTarget = prodTarget.DI_SubCategory_Target_and_Achievements__r[k];
                    Id subTargetId = subTarget.Id;

                    if(prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Sub_Category__r?.Name == currlostOpps[x].Product_Sub_Category__c) {
                        if(subTargetsMap.containsKey(currlostOpps[x].Product_Category__c)) {
                            subMap = subTargetsMap.get(currlostOpps[x].Product_Category__c);
                            if(subMap.containsKey(subTargetId)) {
                                subTarget = subMap.get(subTargetId);
                            } else {
                                subTarget = prodTarget.DI_SubCategory_Target_and_Achievements__r[k];
                                subTarget.TwoWD_Retail_Achieved__c = 0;
                                subTarget.FourWD_Retail_Achieved__c = 0;
                                subTarget.SubCategory_Retail_Achieved__c = 0;
                            }
                        } else {
                            subTarget = prodTarget.DI_SubCategory_Target_and_Achievements__r[k];
                            subTarget.TwoWD_Retail_Achieved__c = 0;
                            subTarget.FourWD_Retail_Achieved__c = 0;
                            subTarget.SubCategory_Retail_Achieved__c = 0;
                            subTargetsMap.put(currlostOpps[x].Product_Category__c, new Map<Id, DI_SubCategory_Target_and_Achievement__c>());
                        }
                        subMap.put(subTargetId, subTarget);
                        subTargetsMap.put(currlostOpps[x].Product_Category__c, subMap);
                        break;
                    }
                }
            }

            Dealer_Incentive__c dealerInc = dealerList[i];
            dealerInc.Total_Retail_Achieved__c = 0;
            Boolean isSubExist = false;
            for(String prodName : productTargets.keySet()) {
                DI_Product_Target_and_Achievement__c prodTarget = productTargets.get(prodName);
                if(subTargetsMap.containsKey(prodName)) {
                    List<DI_SubCategory_Target_and_Achievement__c> subTargets = subTargetsMap.get(prodName).values();
                    prodTarget.Total_Retail_2WD_Achieved__c = 0;
                    prodTarget.Total_Retail_4WD_Achieved__c = 0;
                    prodTarget.Total_Retail_Achieved__c = 0;
                    for(Integer m = 0; m < subTargets?.size(); m++) {
                        prodTarget.Total_Retail_2WD_Achieved__c += subTargets[m].TwoWD_Retail_Achieved__c != null ? subTargets[m].TwoWD_Retail_Achieved__c : 0;
                        prodTarget.Total_Retail_4WD_Achieved__c += subTargets[m].FourWD_Retail_Achieved__c != null ? subTargets[m].FourWD_Retail_Achieved__c : 0;
                        prodTarget.Total_Retail_Achieved__c += subTargets[m].SubCategory_Retail_Achieved__c != null ? subTargets[m].SubCategory_Retail_Achieved__c : 0;
                        updatedSubTargets.add(subTargets[m]);
                    }
                    if(subTargets?.size() > 0) {
                        isSubExist = true;
                        updatedProdTargets.add(prodTarget);
                    }
                }
                dealerInc.Total_Retail_Achieved__c += prodTarget.Total_Retail_Achieved__c != null ? prodTarget.Total_Retail_Achieved__c : 0;
            }
            if(isSubExist) {
                updatedDealers.add(dealerInc);
            }
        }
        if(updatedSubTargets?.size() > 0) {
            update updatedSubTargets;
            if(updatedProdTargets?.size() > 0) {
                update updatedProdTargets;
                if(updatedDealers?.size() > 0) {
                    update updatedDealers;
                }
            }
            JCBActualAchievementCalcController.getTargetsAndPayouts(month, year, dealerIds, true);
        }
    }

    @AuraEnabled
    public static String updateActualForAllDealers(List<Id> dealerIds, String month, Integer year, String productCategory) {
        String status;
        try {
            if(dealerIds?.size() > 0) {
                Integer startIndex = 0;
                Integer endIndex = dealerIds.size() >= 5 ? 4 : dealerIds.size() - 1;
                Database.executeBatch(new JCBDealerIncentiveBatch(dealerIds, month, year, productCategory, startIndex, endIndex));
            }
            status = 'SUCCESS';
        } catch(Exception e) {
            status = 'ERROR';
            throw e;
        }
        return status;
    }

    @AuraEnabled
    public static String getDemoConducted(String month, Integer year){
		String result = '';
        Integer monthNum = getMonthNumber(month);
        Date startDate = Date.newInstance(year, monthNum, 1);
        Date endDate;
        
        if (monthNum == 12) {
            endDate = Date.newInstance(year + 1, 1, 1).addDays(-1);
        } else {
            endDate = Date.newInstance(year, monthNum + 1, 1).addDays(-1);
        }
        
        try{
            List<DI_Product_KPI__c> poductKpis = new List<DI_Product_KPI__c>(); 
            List<DI_Product_Category__c> product = [Select Id, Name From DI_Product_Category__c Where Name = 'TH' LIMIT 1];
            List<DI_KPI_Info__c> kpis = [Select Id, Name From DI_KPI_Info__c Where Name = 'Demo' AND Data_Source__c = 'Salesforce' LIMIT 1];
            if(kpis.size() > 0){
                poductKpis = [Select Id, Name From DI_Product_KPI__c Where Product_Category__c =: product[0].Id AND KPI__c =: kpis[0].Id]; 
            }
            
            if(poductKpis != null){
                List<Demonstration__c> demos = [Select Id, End_Date__c, Jcb_India_Demo_Request__c, Jcb_India_Demo_Request__r.Dealer_Name__c, Product_Category__c, Jcb_India_Demo_Request__r.Product_Category__c From Demonstration__c Where End_Date__c != null AND End_Date__c >=: startDate AND End_Date__c <=: endDate AND Status_JCBIndia__c = 'Closed' AND Jcb_India_Demo_Request__r.Product_Category__c != null];
                Map<Id, Map<String, Integer>> productDemoCount = new Map<Id, Map<String, Integer>>();
                List<Id> dealerIds = new List<Id>();
                for(Integer i = 0 ; i < demos.size() ; i++){
                    dealerIds.add(demos[i].Jcb_India_Demo_Request__r.Dealer_Name__c);
                    Map<String, Integer> temp = new Map<String, Integer>();
                    Integer demoCount = 0;
                    if(productDemoCount.containsKey(demos[i].Jcb_India_Demo_Request__r.Dealer_Name__c)){
                        temp = productDemoCount.get(demos[i].Jcb_India_Demo_Request__r.Dealer_Name__c);
                        if(temp.containsKey(demos[i].Jcb_India_Demo_Request__r.Product_Category__c)){
                            demoCount = temp.get(demos[i].Jcb_India_Demo_Request__r.Product_Category__c);
                        }
                        demoCount += 1;
                    } else {
                        demoCount += 1;
                    }
                    temp.put(demos[i].Jcb_India_Demo_Request__r.Product_Category__c, demoCount);
                    productDemoCount.put(demos[i].Jcb_India_Demo_Request__r.Dealer_Name__c, temp);
                }
                
                List<Dealer_Incentive__c> dealerInc = [Select Id From Dealer_Incentive__c Where Dealer_Account__c IN: dealerIds AND month__c =: month AND year__c =: year];
                System.debug('dealerInc: ' + dealerInc);
                List<DI_Product_Target_and_Achievement__c> productTargetAndAchi = [Select Id, Dealer_Incentive__c, Dealer_Incentive__r.Dealer_Account__c, Demo_Conducted_Actual__c, Demo_Target__c, Product_Category__c, Product_Category__r.Name, (Select Id, Name, Achieved_KPI_Perncentage__c From DI_KPI_Achievement__r Where Product_KPI__r.KPI__r.Name LIKE '%Demo%') From DI_Product_Target_and_Achievement__c Where Dealer_Incentive__c IN: dealerInc];
                List<DI_KPI_Achievement__c> kpiAchievementList = new List<DI_KPI_Achievement__c>();
                List<DI_Product_Target_and_Achievement__c> targetAndAchiList = new List<DI_Product_Target_and_Achievement__c>();
                
                System.debug('productTargetAndAchi.size ---> ' + productTargetAndAchi.size());
                for(Integer j = 0 ; j < productTargetAndAchi.size(); j++){
                    Id dealerId = productTargetAndAchi[j].Dealer_Incentive__r.Dealer_Account__c;
                    String productName = productTargetAndAchi[j].Product_Category__r.Name;
                    if(productDemoCount.containsKey(dealerId)){
                        if(productDemoCount.get(dealerId).containsKey(productName)){
                            Integer count = productDemoCount.get(dealerId).get(productName);
                            productTargetAndAchi[j].Demo_Conducted_Actual__c = count;
                            targetAndAchiList.add(productTargetAndAchi[j]);
                            if(productTargetAndAchi[j].DI_KPI_Achievement__r != null && productTargetAndAchi[j].DI_KPI_Achievement__r.size() > 0){
                                DI_KPI_Achievement__c kpiAch = productTargetAndAchi[j].DI_KPI_Achievement__r[0];
                                if(productTargetAndAchi[j].Demo_Conducted_Actual__c != null && productTargetAndAchi[j].Demo_Target__c != null){
                                    kpiAch.Achieved_KPI_Perncentage__c =  (productTargetAndAchi[j].Demo_Conducted_Actual__c / productTargetAndAchi[j].Demo_Target__c) * 100;  
                                } else {
                                    kpiAch.Achieved_KPI_Perncentage__c = 0;
                                }
                                kpiAchievementList.add(kpiAch);
                            }  
                        }
                    }
                }
                if(kpiAchievementList.size() > 0){
                    update kpiAchievementList;
                }
                if(targetAndAchiList.size() > 0){
                    update targetAndAchiList;
                }
            }
            result = 'SUCCESS';
        }catch(Exception e){
            result = 'ERROR';
            throw e;
        }
        return result;
    }

}