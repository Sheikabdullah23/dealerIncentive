public with sharing class JCBDealerIncentiveWrapper {

    /* Start of ProductVolumeTargetWrapper class*/
    public class DealerIncentivePayoutWrapper {
        
        @AuraEnabled
        public Id recordId{get; set;}

        @AuraEnabled
        public String dealerId{get; set;}

        @AuraEnabled
        public string dealerName{get; set;}
        
        @AuraEnabled
        public string dealerRegion{get; set;}

        @AuraEnabled
        public String month{get; set;}

        @AuraEnabled
        public Integer year{get; set;}
        
        @AuraEnabled
        public string stage{get; set;}

        @AuraEnabled
        public Decimal totalPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalPayoutReceived{get; set;}

        @AuraEnabled
        public Decimal totalRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal totalRetailAchieved{get; set;}

        @AuraEnabled
        public Decimal totalProdPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalProdPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal totalAddPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalAddPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal totalSPersonPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalSPersonPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal totalDealerPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalDealerPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal growthPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal growthPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal additionalPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal additionalPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal multiKpiPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal multiKpiPayoutAchieved{get; set;}

        @AuraEnabled
        public Decimal totalTIVPayoutPredicted{get; set;}

        @AuraEnabled
        public Decimal totalTIVPayoutAchieved{get; set;}



        @AuraEnabled
        public List<ProductTargetAndAchievement> productTargetsAndAchievements{get; set;}

        public DealerIncentivePayoutWrapper(){}

        public DealerIncentivePayoutWrapper(Dealer_Incentive__c dealerIncentive){

            this.recordId = dealerIncentive.Id;
            this.month = dealerIncentive.Month__c;
            this.year = (Integer)dealerIncentive.Year__c;
            this.dealerId = dealerIncentive.Dealer_Account__c;
            this.dealerName = dealerIncentive.Dealer_Account__r.Name;
            this.dealerRegion = dealerIncentive.Dealer_Account__r.JCB_India_Zone__c;
            this.stage=dealerIncentive.Stage__c;
            this.totalRetailPredicted = dealerIncentive.Total_Retail_Predicted__c;
            this.totalRetailAchieved = dealerIncentive.Total_Retail_Achieved__c;
            this.totalProdPayoutPredicted=dealerIncentive.Total_Product_Payout_Predicted__c;
            this.totalProdPayoutAchieved = dealerIncentive.Total_Product_Payout_Achieved__c;
            this.totalAddPayoutPredicted = dealerIncentive.Total_Additional_Payout_Predicted__c;
            this.totalAddPayoutAchieved = dealerIncentive.Total_Additional_Payout_Achieved__c;
            this.totalSPersonPayoutPredicted = dealerIncentive.Total_Sales_Person_Payout_Predicted__c;
            this.totalSPersonPayoutAchieved = dealerIncentive.Total_Sales_Person_Payout_Achieved__c;
            this.totalPayoutPredicted = dealerIncentive.Total_Payout_Predicted__c;
            this.totalPayoutReceived = dealerIncentive.Total_Payout_Achieved__c;
            this.totalDealerPayoutPredicted = dealerIncentive.Total_Dealer_Payout_Predicted__c;
            this.totalDealerPayoutAchieved = dealerIncentive.Total_Dealer_Payout_Achieved__c;
            this.growthPayoutPredicted = dealerIncentive.Growth_Payout_Predicted__c;
            this.growthPayoutAchieved = dealerIncentive.Growth_Payout_Achieved__c;
            this.additionalPayoutPredicted = dealerIncentive.Additional_Payout_Predicted__c;
            this.additionalPayoutAchieved = dealerIncentive.Additional_Payout_Achieved__c;
            this.multiKpiPayoutPredicted = dealerIncentive.Multi_KPI_Payout_Predicted__c;
            this.multiKpiPayoutAchieved = dealerIncentive.Multi_KPI_Payout_Achieved__c;
            this.totalTIVPayoutPredicted = dealerIncentive.TIV_Payout_Predicted__c;
            this.totalTIVPayoutAchieved = dealerIncentive.TIV_Payout_Achieved__c;

        }
    }

    public class ProductTargetAndAchievement{

        @AuraEnabled
        public Id productTargetAndAchievementId{get; set;}

        @AuraEnabled
        public String productName{get; set;}

        @AuraEnabled
        public String productId{get; set;}

        @AuraEnabled
        public Id dealerIncentiveId{get; set;}

        @AuraEnabled
        public Decimal totalProductActualPayout{get; set;}

        @AuraEnabled
        public Decimal totalProductPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalAddPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalAddActualPayout{get; set;}

        @AuraEnabled
        public Decimal totalRetailAchieved{get; set;}
        
        @AuraEnabled
        public Decimal totalRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal totalRetailTarget{get; set;}

        @AuraEnabled
        public List<SubCategoryTargetAndAchievement> subTargetAndAchievement{get; set;}

        @AuraEnabled
        public Decimal demoTarget{get; set;}

        @AuraEnabled
        public Decimal demoConductedPredicted{get; set;}

        @AuraEnabled
        public Decimal demoConductedActual{get; set;}

        @AuraEnabled
        public Decimal oldDemoTarget{get; set;}

        @AuraEnabled
        public Decimal total4WDRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal total2WDRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal total4WDRetailAchieved{get; set;}

        @AuraEnabled
        public Decimal total2WDRetailAchieved{get; set;}

        @AuraEnabled
        public List<ProductKPIAndAchievements> productKPIAndAchievements{get; set;}

        @AuraEnabled
        public String incentiveStatus{get; set;}

        @AuraEnabled
        public String incentiveStatusPredicted{get; set;}

        @AuraEnabled
        public Decimal totalPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalActualPayout{get; set;}

        @AuraEnabled
        public Decimal totalSPersonPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalSPersonActualPayout{get; set;}

        @AuraEnabled
        public Decimal totalDealerPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalDealerActualPayout{get; set;}

        @AuraEnabled
        public Decimal additionalPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal additionalActualPayout{get; set;}

        @AuraEnabled
        public Decimal growthPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal growthActualPayout{get; set;}

        @AuraEnabled
        public Decimal multiKpiPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal multiKpiActualPayout{get; set;}

        @AuraEnabled
        public Decimal totalTIVPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal totalTIVActualPayout{get; set;}

		@AuraEnabled
        public Decimal retailVolumePercentage{get; set;}

		@AuraEnabled
        public Decimal quarterRetailPredicted{get; set;}

		@AuraEnabled
        public Decimal quarterRetailAchieved{get; set;}


        public ProductTargetAndAchievement() {}

        public ProductTargetAndAchievement(DI_Product_Target_and_Achievement__c prodTargetAch) {

            this.productTargetAndAchievementId = prodTargetAch.Id;
            this.productId = prodTargetAch.Product_Category__c;
            this.productName = prodTargetAch.Product_Category__r.Name;
            this.totalRetailTarget = prodTargetAch.Total_Retail_Target__c;
            this.totalRetailPredicted = prodTargetAch.Total_Retail_Predicted__c;
            this.totalProductPredictedPayout = prodTargetAch.Total_Product_Predicted_Payout__c;
            this.totalProductActualPayout = prodTargetAch.Total_Product_Actual_Payout__c;
            this.totalRetailAchieved = prodTargetAch.Total_Retail_Achieved__c;
            this.dealerIncentiveId = prodTargetAch.Dealer_Incentive__c;
            this.demoTarget = prodTargetAch.Demo_Target__c;
            this.demoConductedPredicted = prodTargetAch.Demo_Conducted_Predicted__c;
            this.demoConductedActual = prodTargetAch.Demo_Conducted_Actual__c;
            this.oldDemoTarget = prodTargetAch.Demo_Target__c;
            this.total4WDRetailPredicted =  prodTargetAch.Total_Retail_4WD_Predicted__c;
            this.total2WDRetailPredicted = prodTargetAch.Total_Retail_2WD_Predicted__c;
            this.total4WDRetailAchieved = prodTargetAch.Total_Retail_4WD_Achieved__c;
            this.total2WDRetailAchieved = prodTargetAch.Total_Retail_2WD_Achieved__c;
            this.totalAddPredictedPayout = prodTargetAch.Total_Additional_Predicted_Payout__c;
            this.totalAddActualPayout = prodTargetAch.Total_Additional_Actual_Payout__c;
            this.subTargetAndAchievement = new List<SubCategoryTargetAndAchievement>();
            for(DI_SubCategory_Target_and_Achievement__c subTarget : prodTargetAch.DI_SubCategory_Target_and_Achievements__r) {
                SubCategoryTargetAndAchievement subCategoryTarget = new SubCategoryTargetAndAchievement(subTarget);
                this.subTargetAndAchievement.add(subCategoryTarget);
            }
            this.incentiveStatus = prodTargetAch.Incentive_Status__c;
            this.incentiveStatusPredicted = prodTargetAch.Incentive_Status_Predicted__c;
            this.totalPredictedPayout = prodTargetAch.Total_Predicted_Payout__c;
            this.totalActualPayout = prodTargetAch.Total_Actual_Payout__c;
            this.totalSPersonPredictedPayout = prodTargetAch.Total_Sales_Person_Predicted_Payout__c;
            this.totalSPersonActualPayout = prodTargetAch.Total_Sales_Person_Actual_Payout__c;
            this.totalDealerPredictedPayout = prodTargetAch.Total_Dealer_Predicted_Payout__c;
            this.totalDealerActualPayout = prodTargetAch.Total_Dealer_Actual_Payout__c;
            this.additionalPredictedPayout = prodTargetAch.Additional_Predicted_Payout__c;
            this.additionalActualPayout = prodTargetAch.Additional_Actual_Payout__c;
            this.growthPredictedPayout = prodTargetAch.Growth_Predicted_Payout__c;
            this.growthActualPayout = prodTargetAch.Growth_Actual_Payout__c;
            this.multiKpiPredictedPayout = prodTargetAch.Multi_KPI_Predicted_Payout__c;
            this.multiKpiActualPayout = prodTargetAch.Multi_KPI_Actual_Payout__c;
            this.totalTIVPredictedPayout = prodTargetAch.TIV_Predicted_Payout__c;
            this.totalTIVActualPayout = prodTargetAch.TIV_Actual_Payout__c;
            this.quarterRetailPredicted = prodTargetAch.Quarter_Retail_Predicted__c;
            this.quarterRetailAchieved = prodTargetAch.Quarter_Retail_Achieved__c;
            this.productKPIAndAchievements = new List<ProductKPIAndAchievements>();
            if(prodTargetAch.DI_KPI_Achievement__r != null && prodTargetAch.DI_KPI_Achievement__r.size() > 0) {
                for(DI_KPI_Achievement__c kpiAch : prodTargetAch.DI_KPI_Achievement__r) {
                    ProductKPIAndAchievements kpi = new ProductKPIAndAchievements(kpiAch);
                    this.productKPIAndAchievements.add(kpi);
                }
            }
            if(this.totalRetailTarget > 0 && this.totalRetailPredicted > 0){
                this.retailVolumePercentage = (this.totalRetailPredicted / this.totalRetailTarget) * 100;
            } else {
                this.retailVolumePercentage = 0;
            }
        }
    }

    public class SubCategoryTargetAndAchievement {

        @AuraEnabled
        public Id subTargetAndAchievementId{get; set;}

        @AuraEnabled
        public String subProductName{get; set;}

        @AuraEnabled
        public String subProductId{get; set;}

        @AuraEnabled
        public Decimal subCategoryAchievedPayout{get; set;}

        @AuraEnabled
        public Decimal subCategoryPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal subCategoryAddActualPayout{get; set;}

        @AuraEnabled
        public Decimal subCategoryAddPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal subCategoryRetailAchieved{get; set;}

        @AuraEnabled
        public Decimal subCategoryRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal subCategoryRetailTarget{get; set;}
        
        @AuraEnabled
        public Decimal oldRetailTarget{get; set;}

        @AuraEnabled
        public Decimal twoWDRetailPredicted{get; set;}
        
        @AuraEnabled
        public Decimal twoWDRetailAchieved{get; set;}

        @AuraEnabled
        public Decimal fourWDRetailPredicted{get; set;}

        @AuraEnabled
        public Decimal fourWDRetailAchieved{get; set;}

        public SubCategoryTargetAndAchievement() {}

        public SubCategoryTargetAndAchievement(DI_SubCategory_Target_and_Achievement__c subTargetAndAchievement) {
            this.subTargetAndAchievementId = subTargetAndAchievement.Id;
            this.subProductId = subTargetAndAchievement.Sub_Category__c;
            this.subProductName = subTargetAndAchievement.Sub_Category__r.Name;
            this.subCategoryRetailTarget = subTargetAndAchievement.SubCategory_Retail_Target__c;
            this.oldRetailTarget = subTargetAndAchievement.SubCategory_Retail_Target__c;
            this.subCategoryRetailPredicted = subTargetAndAchievement.SubCategory_Retail_Predicted__c;
            this.subCategoryRetailAchieved = subTargetAndAchievement.SubCategory_Retail_Achieved__c != null ? subTargetAndAchievement.SubCategory_Retail_Achieved__c : 0;
            this.subCategoryPredictedPayout = subTargetAndAchievement.SubCategory_Predicted_Payout__c;
            this.subCategoryAchievedPayout = subTargetAndAchievement.SubCategory_Actual_Payout_Achieved__c;
            this.subCategoryAddActualPayout = subTargetAndAchievement.SubCategory_Add_Actual_Payout__c;
            this.subCategoryAddPredictedPayout = subTargetAndAchievement.SubCategory_Add_Predicted_Payout__c;
            this.twoWDRetailPredicted = subTargetAndAchievement.TwoWD_Retail_Predicted__c;
            this.twoWDRetailAchieved = subTargetAndAchievement.TwoWD_Retail_Achieved__c != null ? subTargetAndAchievement.TwoWD_Retail_Achieved__c : 0;
            this.fourWDRetailPredicted = subTargetAndAchievement.FourWD_Retail_Predicted__c;
            this.fourWDRetailAchieved = subTargetAndAchievement.FourWD_Retail_Achieved__c != null ? subTargetAndAchievement.FourWD_Retail_Achieved__c : 0;
        }
    }

    public class ProductKPIAndAchievements {

        @AuraEnabled
        public Id kpiAchievementId{get; set;}

        @AuraEnabled
        public  Id productTargetandAchivementId{get; set;}

        @AuraEnabled
        public Decimal predictedKPIPercentage{get; set;}

        @AuraEnabled
        public Decimal predictedKPIPayout{get; set;}

        @AuraEnabled
        public Decimal achievedKPIPerncentage{get; set;}

        @AuraEnabled
        public Decimal achievedKPIPayout{get; set;}

        @AuraEnabled
        public ProductKPI productKPI {get; set;}

        @AuraEnabled
        public Decimal addPredictedKPIPayout {get; set;}

        @AuraEnabled
        public Decimal addAchievedKPIPayout {get; set;}
        
        @AuraEnabled
        public Decimal predictedPotentialAmount {get; set;}

        @AuraEnabled
        public Decimal actualPotentialAmount {get; set;}

        @AuraEnabled
        public Decimal indentOrder{get; set;}

        @AuraEnabled
        public Decimal indentWholesale{get; set;}

        @AuraEnabled
        public Decimal growthPredictedKPIPayout{get; set;}

        @AuraEnabled
        public Decimal growthAchievedKPIPayout{get; set;}

        @AuraEnabled
        public Decimal ceRatioPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal ceRatioActualPayout{get; set;}

        @AuraEnabled
        public Decimal ceRatioYTDPredictedPayout{get; set;}

        @AuraEnabled
        public Decimal ceRatioYTDActualPayout{get; set;}

        @AuraEnabled
        public Decimal quarterPredictedPercentage{get; set;}

        @AuraEnabled
        public Decimal quarterActualPercentage{get; set;}

        public ProductKPIAndAchievements() {}

        public ProductKPIAndAchievements(DI_KPI_Achievement__c kpiAch) {

            this.kpiAchievementId = kpiAch.Id;
            this.predictedKPIPercentage = kpiAch.Predicted_KPI_Percentage__c;
            this.predictedKPIPayout = kpiAch.Predicted_KPI_Payout__c;
            this.achievedKPIPerncentage = kpiAch.Achieved_KPI_Perncentage__c;
            this.achievedKPIPayout = kpiAch.Achieved_KPI_Payout__c;
            this.addPredictedKPIPayout = kpiAch.Additional_Predicted_KPI_Payout__c;
            this.addAchievedKPIPayout = kpiAch.Additional_Achieved_KPI_Payout__c;
            this.predictedPotentialAmount = kpiAch.Predicted_Potential_Amount__c;
            this.actualPotentialAmount = kpiAch.Actual_Potential_Amount__c	;
            this.indentOrder = kpiAch.Indent_Order__c;
            this.indentWholesale = kpiAch.Indent_Wholesale__c;
            this.growthPredictedKPIPayout = kpiAch.Growth_Predicted_KPI_Payout__c;
            this.growthAchievedKPIPayout = kpiAch.Growth_Achieved_KPI_Payout__c;
            this.ceRatioPredictedPayout = kpiAch.CE_Ratio_Predicted_Payout__c;
            this.ceRatioActualPayout = kpiAch.CE_Ratio_Actual_Payout__c;
            this.ceRatioYTDPredictedPayout = kpiAch.CE_Ratio_YTD_Predicted_Payout__c;
            this.ceRatioYTDActualPayout = kpiAch.CE_Ratio_YTD_Actual_Payout__c;
            this.quarterPredictedPercentage = kpiAch.Quarter_Predicted_Percentage__c;
            this.quarterActualPercentage = kpiAch.Quarter_Actual_Percentage__c;
            if(kpiAch.Product_KPI__r != null) {
                this.productKPI = new ProductKPI(kpiAch.Product_KPI__r);
            }
        }
    }

    public class ProductKPI {

        @AuraEnabled
        public Id productKPIId{get; set;}
        
        @AuraEnabled
        public Id kpiId{get; set;}

        @AuraEnabled
        public String kpiName{get; set;}
        
        @AuraEnabled
        public Id productId{get; set;}
        
        @AuraEnabled 
        public String productName{get; set;}

        @AuraEnabled
        public String kpiVisibility{get; set;}

        @AuraEnabled
        public Boolean isCalcPayout {get; set;}

        public ProductKPI() {}

        public ProductKPI(DI_Product_KPI__c prodKPI) {

            this.productKPIId = prodKPI.Id;
            this.kpiId = prodKPI.KPI__c;
            if(prodKPI.KPI__r != null) {
                this.kpiName = prodKPI.KPI__r.Name;
                this.kpiVisibility = prodKPI.KPI__r.KPI_Visiblity__c;
                this.isCalcPayout = prodKPI.KPI__r.KPI_Visiblity__c != null ? prodKPI.KPI__r.KPI_Visiblity__c.contains('CALC Payout') : false;
            }
            this.productId = prodKPI.Product_Category__c;
            if(prodKPI.Product_Category__r != null) {
                this.productName = prodKPI.Product_Category__r.Name;
            }
        }
    }
    /* End of ProductVolumeTargetWrapper class and its supportive classes*/

    /* Start of ProductKPIAndPayoutWrapper class and its supportive classes*/

    public class ProductKPIAndPayout {

        @AuraEnabled
        public Id recordId{get; set;}

        @AuraEnabled
        public String month{get; set;}

        @AuraEnabled
        public Decimal year{get; set;}

        @AuraEnabled
        public Decimal prevYear{get; set;}

        @AuraEnabled
        public String prevMonth{get; set;}

        @AuraEnabled
        public String type{get; set;}

        @AuraEnabled 
        public String growth{get; set;} 

        @AuraEnabled
        public ProductKPI productKPI{get; set;}

        @AuraEnabled
        public String target{get; set;}
        
        @AuraEnabled
        public List<SlabInfo> slabInfo{get; set;}

        @AuraEnabled
        public List<MachineTarget> machineTarget{get; set;}

        @AuraEnabled
        public Boolean hasSlabs{get; set;}

        @AuraEnabled
        public Decimal incentiveAmount{get; set;}

        @AuraEnabled
        public List<ProductPayoutInfo> productPayouts{get; set;}

        @AuraEnabled
        public String salesPersonTarget{get; set;}

        @AuraEnabled
        public Boolean isSalesmanIncentive{get; set;}

        @AuraEnabled
        public Boolean isIndustryIncentive{get; set;}

        @AuraEnabled
        public Boolean allMachineRetail{get; set;}

        public ProductKPIAndPayout(){}

        public ProductKPIAndPayout(DI_KPI_Target_And_Payout_Info__c kpiTarget){
            this.recordId = kpiTarget.Id;
            this.month = kpiTarget.Month__c;
            this.year = kpiTarget.Year__c;
            this.hasSlabs = kpiTarget.Has_Slabs__c;
            this.target = kpiTarget.KPI_Target__c;
            this.type = kpiTarget.Type__c;
            this.growth = kpiTarget.Growth__c;
            
            this.incentiveAmount = kpiTarget.KPI_Payout_Amount__c;
            this.prevMonth = kpiTarget.Previous_Month__c;
            this.prevYear = kpiTarget.Previous_Year__c;
            this.salesPersonTarget = kpiTarget.Sales_Person_Incentive_Target__c;
            this.isSalesmanIncentive = kpiTarget.Is_Salesman_Incentive__c;
            this.isIndustryIncentive = kpiTarget.Is_Total_Volume_Industry__c;
            this.allMachineRetail = kpiTarget.All_Machine_Retail__c;
            if(kpiTarget.Machine_Target__c != null) {
                this.machineTarget = (List<MachineTarget>)System.JSON.deserialize(kpiTarget.Machine_Target__c,List<MachineTarget>.class);
            }
            this.productPayouts = new List<ProductPayoutInfo>();
            if(kpiTarget.DI_KPI_Sub_Product_Payouts__r != null && kpiTarget.DI_KPI_Sub_Product_Payouts__r.size() > 0) {
                for(DI_KPI_Sub_Product_Payout__c kpiPayout : kpiTarget.DI_KPI_Sub_Product_Payouts__r) {
                    ProductPayoutInfo payout = new ProductPayoutInfo(kpiPayout);
                    this.productPayouts.add(payout);
                }
            }
            if(kpiTarget.DI_Product_KPI__r != null) {
                this.productKPI = new ProductKPI(kpiTarget.DI_Product_KPI__r);
            }
            this.slabInfo = new List<SlabInfo>();
            if(kpiTarget.Slab_Infos__r != null && kpiTarget.Slab_Infos__r.size() > 0) {
                for(Slab_Info__c slab : kpiTarget.Slab_Infos__r) {
                    this.slabInfo.add(new SlabInfo(slab));
                }
            }
        }
    }

    public class SlabInfo {
 
        @AuraEnabled
        public Id slabId{get; set;}
 
        @AuraEnabled
        public String slabRange{get; set;}

        @AuraEnabled
        public String growthRange{get; set;}
 
        @AuraEnabled
        public String payoutMode{get; set;}
        
        @AuraEnabled
        public Decimal amount{get; set;}
       
        @AuraEnabled 
        public Double payoutPercentage{get; set;}

        @AuraEnabled
        public String slabType{get; set;}

        @AuraEnabled
        public ProductKPI productKPI{get; set;}

        @AuraEnabled
        public Boolean allMachineRetail{get; set;}

        public SlabInfo() {}
 
        public SlabInfo(Slab_Info__c slabKPI) {
            this.slabId = slabKPI.Id;
            this.slabRange = slabKPI.Slab_Range__c;
            this.payoutMode = slabKPI.Payout_Mode__c;
            this.amount = slabKPI.Amount__c;
            this.payoutPercentage = slabKPI.Payout_Percentage__c;
            this.growthRange = slabKPI.Growth_Range__c;
            this.slabType = slabKPI.Slab_Type__c;
            if(slabKPI.DI_Product_KPI__r != null) {
                this.productKPI = new ProductKPI(slabKPI.DI_Product_KPI__r);
            }
            this.allMachineRetail = slabKPI.All_Machine_Retail__c;
        }
    }

    public class MachineTarget {

        @AuraEnabled public String slabRange{get; set;}

        @AuraEnabled public Decimal amount{get; set;}

        public MachineTarget(){}
    }

    /* End of ProductKPIAndPayoutWrapper class and its supportive classes*/

    /* Start of ProductPayoutInfoWrapper class and its supportive classes*/

    public class ProductPayoutInfo {

        @AuraEnabled
        public Id payoutId{get; set;}

        @AuraEnabled
        public Id subProductId{get; set;}

        @AuraEnabled
        public String subProductName{get; set;}

        @AuraEnabled
        public Id kpiTargetId{get; set;}

        @AuraEnabled
        public Decimal payoutAmount{get; set;}

        @AuraEnabled
        public Boolean variesByRegion{get; set;}

        @AuraEnabled
        public Boolean variesBy4WD{get; set;}

        @AuraEnabled
        public Decimal twoWDPayoutAmount{get; set;}

        @AuraEnabled
        public Decimal fourWDPayoutAmount{get; set;}

        @AuraEnabled
        public List<RegionPayout> regionPayout{get; set;}

        public ProductPayoutInfo() {}

        public ProductPayoutInfo(DI_KPI_Sub_Product_Payout__c payoutInfo) {
            this.payoutId = payoutInfo.Id;
            this.subProductId = payoutInfo.DI_Product_Sub_Category__c;
            if(payoutInfo.DI_Product_Sub_Category__r != null) {
                this.subProductName = payoutInfo.DI_Product_Sub_Category__r.Name;
            }
            this.kpiTargetId = payoutInfo.DI_KPI_Target_And_Payout__c;
            this.payoutAmount = payoutInfo.Payout_Amount__c;
            this.variesByRegion = payoutInfo.Payout_Varies_By_Region__c;
            this.variesBy4WD = payoutInfo.Payout_Varies_By_4WD__c;
            // if(payoutInfo.Region_Payout__c != null) {
            //     this.regionPayout = (List<RegionPayout>)System.JSON.deserialize(payoutInfo.Region_Payout__c,List<RegionPayout>.class);
            // }
            this.regionPayout = new List<RegionPayout>();
            if(payoutInfo.DI_Region_Payouts__r != null && payoutInfo.DI_Region_Payouts__r.size() > 0) {
                for(DI_Region_Payout__c regPay : payoutInfo.DI_Region_Payouts__r) {
                    this.regionPayout.add(new RegionPayout(regPay));
                }
            }
            this.twoWDPayoutAmount = payoutInfo.TwoWD_Payout_Amount__c;
            this.fourWDPayoutAmount = payoutInfo.FourWD_Payout_Amount__c;
        }
    }

    public class RegionPayout{

        @AuraEnabled
        public Id regPayoutId{get; set;}

        @AuraEnabled 
        public String region{get; set;}
        
        @AuraEnabled 
        public Decimal amount{get; set;}

        @AuraEnabled
        public Decimal twoWDPayoutAmount{get; set;}

        @AuraEnabled
        public Decimal fourWDPayoutAmount{get; set;}

        public RegionPayout() {}

        public RegionPayout(DI_Region_Payout__c regionPay) {
            this.regPayoutId = regionPay.Id;
            this.region = regionPay.Zone_Name__c;
            this.amount = regionPay.Payout_Amount__c;
            this.twoWDPayoutAmount = regionPay.TwoWD_Payout_Amount__c;
            this.fourWDPayoutAmount = regionPay.FourWD_Payout_Amount__c;
        }

    }
    /* End of ProductPayoutInfoWrapper class and its supportive classes*/

    public class ProductCategoryWrapper {

        @AuraEnabled
        public Id productId{get; set;}

        @AuraEnabled
        public String name{get; set;}

        @AuraEnabled
        public Decimal value {get; set;}

        @AuraEnabled
        public Decimal orderNo {get; set;}

        @AuraEnabled
        public List<SubCategoryWrapper> subCategoryList{get; set;}

        public ProductCategoryWrapper(){}

        public ProductCategoryWrapper(DI_Product_Category__c product) {
            productId = product.Id;
            name = product.Name;
            orderNo = product.Order_No__c;
            List<SubCategoryWrapper> subCategoryWraps = new List<SubCategoryWrapper>();
            if(product.DI_Product_Sub_Categories__r.size() > 0) {
                for(DI_Product_Sub_Category__c sub : product.DI_Product_Sub_Categories__r) {
                    SubCategoryWrapper subCategoryWrap = new SubCategoryWrapper(sub);
                    subCategoryWraps.add(subCategoryWrap);
                }
            }
            subCategoryList = subCategoryWraps;
        }
    }

    public class SubCategoryWrapper {

        @AuraEnabled
        public Id subCategoryId{get; set;}

        @AuraEnabled
        public String name{get; set;}

        @AuraEnabled
        public Boolean subDisabled{get; set;}

        public SubCategoryWrapper(DI_Product_Sub_Category__c subCategory) {
            subCategoryId = subCategory.Id;
            name = subCategory.Name;
        }
    }

    public class SalesmanKPIWrapper {
        
        @AuraEnabled
        public Id recordId{get; set;}

        @AuraEnabled
        public string salesPersonTarget{get; set;}

        @AuraEnabled
        public List<SlabInfo> slabInfo{get; set;}

        @AuraEnabled
        public Boolean isSalesmanIncentive{get; set;}

        public SalesmanKPIWrapper(){}

        public SalesmanKPIWrapper(DI_KPI_Target_And_Payout_Info__c kpiTarget){
            this.recordId = kpiTarget.Id;
            this.salesPersonTarget = kpiTarget.Sales_Person_Incentive_Target__c;
            this.isSalesmanIncentive = kpiTarget.Is_Salesman_Incentive__c;
        }
    }

    public class IndustryVolumeWrapper{
 
        @AuraEnabled
        public Id recordId{get; set;}
 
        @AuraEnabled
        public List<SlabInfo> slabInfo{get; set;}
 
        @AuraEnabled
        public Boolean isIndustryIncentive{get; set;}
 
        public IndustryVolumeWrapper(){}
 
        public IndustryVolumeWrapper(DI_KPI_Target_And_Payout_Info__c kpiTarget){
            this.recordId = kpiTarget.Id;
            this.isIndustryIncentive = kpiTarget.Is_Total_Volume_Industry__c;
        }
    }

      public class DIMultiWrapper{
        @AuraEnabled 
        public Id multiKpiId{get; set;}

        @AuraEnabled 
        public String conditionLogic{get; set;}

        @AuraEnabled 
        public String customLogic{get; set;}

        @AuraEnabled 
        public Decimal year{get; set;}

        @AuraEnabled 
        public String month{get; set;}

        @AuraEnabled 
        public Decimal incentiveAmount{get; set;}

        @AuraEnabled 
        public List<SlabInfo> multiKpSlabs{get; set;} 

        public DIMultiWrapper(){}
        
        public DIMultiWrapper(DI_Multi_KPI_Target_Config__c mulKpi) {
            this.multiKpiId = mulKpi.Id;
            this.conditionLogic = mulKpi.Condition_Logic__c;
            this.customLogic = mulKpi.Custom_Logic__c;
            this.month = mulKpi.Month__c;
            this.year = mulKpi.Year__c;        
            this.incentiveAmount = mulKpi.Amount__c;
            this.multiKpSlabs = new List<SlabInfo>();
        }
    }

    public class ProductTargetWrapper{

        @AuraEnabled 
        public Id productTargetId{get; set;}

        @AuraEnabled 
        public String month{get; set;}

        @AuraEnabled 
        public Decimal year{get; set;}

        @AuraEnabled 
        public ProductCategoryWrapper productCategory{get; set;}

        @AuraEnabled
        public List<DIMultiWrapper> multiKpi{get; set;}

        public ProductTargetWrapper(){}

        public ProductTargetWrapper(DI_Product_Target__c prdKPI) {
            this.productTargetId = prdKPI.Id;
            this.year = prdKPI.Year__c;
            this.month = prdKPI.Month__c;
            if(prdKPI.DI_Product_Category__r != null) {
                this.productCategory = new ProductCategoryWrapper(prdKPI.DI_Product_Category__r);
            }
        }
    }

    // public class ProductCategoryWrapper {

    //     @AuraEnabled
    //     public Id productId{get; set;}

    //     @AuraEnabled
    //     public String productName{get; set;}

    //     public ProductCategoryWrapper(){}

    //     public ProductCategoryWrapper(DI_Product_Category__c product) {
    //         this.productId = product.Id;
    //         this.productName = product.name;
    //     }
    // }
}