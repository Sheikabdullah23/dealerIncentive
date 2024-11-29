public with sharing class JCBDealerIncentiveBatch implements Database.Batchable<sObject> {

    public final String query;
    public List<Id> accIds;
    public final String productCategory;
    public final Integer startIndex;
    public final Integer endIndex;
    public final String month;
    public final Integer year;
    public final List<Id> dealers;

    public JCBDealerIncentiveBatch(List<Id> dealerIds, String monthVal, Integer yearVal, String productName, Integer startInd, Integer endInd) {
        startIndex = startInd;
        endIndex = endInd;
        month = monthVal;
        year = yearVal;
        productCategory = productName;
        dealers = dealerIds;
        accIds = new List<Id>();
        for(Integer i = this.startIndex; i < = this.endIndex; i++) {
            accIds.add(this.dealers[i]);
        }
        query = 'SELECT Id from Dealer_Incentive__c where Month__c = :month AND Year__c = :year AND Dealer_Account__c IN :accIds';
        System.debug('startIndex ---- '+startIndex);
        System.debug('endIndex ---- '+endIndex);
    }

    public Database.QueryLocator start(Database.BatchableContext bc){
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext bc, List<sObject> scope){
        List<JCBActualAchievementCalcController.DealerWrapper> dealerWrapper = new List<JCBActualAchievementCalcController.DealerWrapper>();
        Map<String, Object> oppsAndRetails = JCBActualCalcController.getOppsAndOrders(accIds, month, year, productCategory);
        JCBActualCalcController.calculateRetails(oppsAndRetails, this.month, this.year, accIds);
    }

    public void finish(Database.BatchableContext bc){
        Integer sIndex = this.startIndex + 5;
        Integer eIndex = (this.endIndex + 5) < this.dealers?.size() ? (this.endIndex + 5) : (this.dealers?.size() - 1);
        if(sIndex < this.dealers?.size() && eIndex < this.dealers?.size())
        Database.executeBatch(new JCBDealerIncentiveBatch(this.dealers, this.month, this.year, this.productCategory, sIndex, eIndex));
    }

}