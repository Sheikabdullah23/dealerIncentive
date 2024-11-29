import saveKpiPayouts from '@salesforce/apex/dIFormulaController.saveKpiPayouts';

export {
    getDealerTargetsAndPayouts,
    updateActualRetail
}

var dealerIncIds;
var dealersMap;
//selectedCERTargets;
var prodTargetIds;
var prodTargetsMap;
var kpiAchIds;
var kpiAchMaps;
var productsKPI;
var prodTargetAndPayoutInfo;
var isActual;
var deletedIds = [];
var prevDealerWrappers;
var multiKpiTargetPayouts;
var isTIVConfigured = false;
var dealerRegion;

async function getDealerTargetsAndPayouts(productKPITargetsAndPayouts) {
    try {
        deletedIds = [];
        if(productKPITargetsAndPayouts) {
            dealerIncIds = productKPITargetsAndPayouts['dealerIncIds'];
            dealersMap = productKPITargetsAndPayouts['dealersMap'];
            prodTargetIds = productKPITargetsAndPayouts['prodTargetIds']
            prodTargetsMap = productKPITargetsAndPayouts['prodTargetsMap']
            kpiAchIds = productKPITargetsAndPayouts['kpiAchIds']
            kpiAchMaps = productKPITargetsAndPayouts['kpiAchMap'];
            productsKPI = productKPITargetsAndPayouts['productsKPI'];
            prodTargetAndPayoutInfo = productKPITargetsAndPayouts['prodTargetAndPayoutInfo'];
            isActual = productKPITargetsAndPayouts['isActual'];
            prevDealerWrappers = productKPITargetsAndPayouts['prevDealerWrappers'];
            multiKpiTargetPayouts = productKPITargetsAndPayouts['multiKpitargetInfo'];
            const result = await calculatePayouts();
            console.log('result 1 --->   ', result);
            return result;
        }
    } catch(error) {
        console.error('error 1 --->   ', error);
    }
}

async function calculatePayouts()  {
    try {
        let kpiAchievements = [];
        let productListMap = {};
        let dealerListMap = {};
        for(let i = 0; i < dealerIncIds?.length; i++) {
            let dealerInc = dealersMap[dealerIncIds[i]];
            dealerRegion = dealerInc?.Dealer_Account__r?.JCB_India_Zone__c;
            let dealerKpiAchList = Object.values(kpiAchMaps)?.filter(kpi => kpi.DI_Product_Target_and_Achivement__r.Dealer_Incentive__c == dealerIncIds[i]);
            let dealerProductList = Object.values(prodTargetsMap)?.filter(prod => prod.Dealer_Incentive__c == dealerIncIds[i]);
            if(dealerKpiAchList) {
                for(const key in productsKPI) {
                    let productKPI = productsKPI[key];
                    let productKPIIds = productKPI.map(ele => {
                        return ele?.Id;
                    })
                    if(productKPI?.length > 0) {
                        let productTarget = dealerProductList?.find(prod => prod.Product_Category__c == productKPI[0].Product_Category__c);
                        if(productTarget) {
                            let productKPIList = dealerKpiAchList.filter(kpi => productKPIIds.includes(kpi.Product_KPI__c));
                            let updatedAchievements = [];
                            isTIVConfigured = false;
                            let prodMultiTarget = multiKpiTargetPayouts?.find(multi => multi.productCategory?.name == key);
                            let multiKPITargets = prodMultiTarget?.multiKpi || [];
                            for(let j = 0; j < productKPI?.length; j++) {
                                let kpiTarget = prodTargetAndPayoutInfo?.find(kpiTar => kpiTar.productKPI.productKPIId == productKPI[j]?.Id && kpiTar.type == 'KPI Target' && kpiTar.month == dealerInc.Month__c);
                                let addKPITarget = prodTargetAndPayoutInfo?.find(kpiTar => kpiTar.productKPI.productKPIId == productKPI[j]?.Id && kpiTar.type == 'Additional Incentive Target' && kpiTar.month == dealerInc.Month__c);
                                let growthKPITarget = prodTargetAndPayoutInfo?.find(kpiTar => kpiTar.productKPI.productKPIId == productKPI[j]?.Id && kpiTar.type == 'Growth Additional Incentive' && kpiTar.month == dealerInc.Month__c);
                                let cerKPITarget = prodTargetAndPayoutInfo?.find(kpiTar => kpiTar.productKPI.productKPIId == productKPI[j]?.Id && kpiTar.type == 'Product To CE Ratio');
                                let multiKPITarget;
                                for(let m = 0; m < multiKPITargets?.length; m++) {
                                    let slabs = multiKPITargets[m].multiKpSlabs;
                                    for(let n = 0; n < slabs?.length; n++) {
                                        if(slabs[n].productKPI.productKPIId == productKPI[j]?.Id) {
                                            multiKPITarget = slabs[n];
                                            break;
                                        }
                                    }
                                    if(multiKPITarget) {
                                        break;
                                    }
                                }
                                let kpiAchievement = productKPIList.find(kpiAch => kpiAch.Product_KPI__c == productKPI[j]?.Id);
                                if(kpiTarget || addKPITarget || growthKPITarget || multiKPITarget || cerKPITarget) {
                                    let achievedPercentage;
                                    if(!kpiAchievement) {   
                                        kpiAchievement = {};
                                        kpiAchievement.Product_KPI__c = productKPI[j]?.Id;
                                        kpiAchievement.Product_KPI__r = productKPI[j];
                                        kpiAchievement.DI_Product_Target_and_Achivement__c = productTarget?.Id;
                                    }
                                    if(kpiAchievement?.Product_KPI__r?.KPI__r?.Name?.includes('Volume')) {
                                        kpiAchievement.Achieved_KPI_Perncentage__c = productTarget.Total_Retail_Achieved__c > 0 && productTarget.Total_Retail_Target__c > 0 ? (productTarget.Total_Retail_Achieved__c / productTarget.Total_Retail_Target__c) * 100 : 0;
                                        kpiAchievement.Predicted_KPI_Percentage__c = productTarget.Total_Retail_Predicted__c > 0 && productTarget.Total_Retail_Target__c > 0 ? (productTarget.Total_Retail_Predicted__c / productTarget.Total_Retail_Target__c) * 100 : 0;
                                    } else if(kpiAchievement?.Product_KPI__r?.KPI__r?.Name?.includes('Demo')) {
                                        kpiAchievement.Achieved_KPI_Perncentage__c = productTarget.Demo_Target__c > 0 && productTarget.Demo_Conducted_Actual__c > 0 ? (productTarget.Demo_Conducted_Actual__c / productTarget.Demo_Target__c) * 100 : 0;
                                        kpiAchievement.Predicted_KPI_Percentage__c = productTarget.Demo_Target__c > 0 && productTarget.Demo_Conducted_Predicted__c > 0 ? (productTarget.Demo_Conducted_Predicted__c / productTarget.Demo_Target__c) * 100 : 0;
                                    }
                                    if(kpiTarget) {
                                        kpiAchievement = calculateKPIPayout(kpiAchievement, kpiTarget, productTarget, productKPIList);
                                    }
                                    if(addKPITarget) {
                                        kpiAchievement = calculateAddKPIPayout(kpiAchievement, addKPITarget, productTarget, dealerInc)
                                    } else {
                                        kpiAchievement.Additional_Predicted_KPI_Payout__c = 0;
                                        kpiAchievement.Additional_Achieved_KPI_Payout__c = 0;
                                    }
                                    if(growthKPITarget) {
                                        kpiAchievement = calculateGrowthKPIPayout(kpiAchievement, growthKPITarget, productTarget, dealerInc);
                                    } else {
                                        kpiAchievement.Growth_Achieved_KPI_Payout__c = 0;
                                        kpiAchievement.Growth_Predicted_KPI_Payout__c = 0;
                                    }
                                    if(cerKPITarget && cerKPITarget.productKPI.kpiName.includes('Product To CE Ratio')) {
                                        kpiAchievement = calculateCERKPIPayout(kpiAchievement, cerKPITarget, productTarget, dealerInc, productKPIList);
                                    } else {
                                        kpiAchievement.CE_Ratio_Actual_Payout__c = 0;
                                        kpiAchievement.CE_Ratio_Predicted_Payout__c = 0;
                                    }
                                    updatedAchievements.push(kpiAchievement);
                                    kpiAchievements.push(kpiAchievement);
                                    if(productListMap.hasOwnProperty(kpiAchievement.DI_Product_Target_and_Achivement__c)) {
                                        let pList = productListMap[kpiAchievement.DI_Product_Target_and_Achivement__c];
                                        if(kpiAchievement.Product_KPI__r.KPI__r.KPI_Visiblity__c.includes('CALC Payout')) {
                                            pList.Total_Product_Predicted_Payout__c += kpiAchievement.Predicted_KPI_Payout__c ? kpiAchievement.Predicted_KPI_Payout__c : 0;
                                            pList.Total_Product_Actual_Payout__c += kpiAchievement.Achieved_KPI_Payout__c ? kpiAchievement.Achieved_KPI_Payout__c : 0;
                                            pList.Additional_Predicted_Payout__c += kpiAchievement.Additional_Predicted_KPI_Payout__c ? kpiAchievement.Additional_Predicted_KPI_Payout__c : 0;
                                            pList.Additional_Actual_Payout__c += kpiAchievement.Additional_Achieved_KPI_Payout__c ? kpiAchievement.Additional_Achieved_KPI_Payout__c : 0;
                                            pList.Growth_Predicted_Payout__c += kpiAchievement.Growth_Predicted_KPI_Payout__c ? kpiAchievement.Growth_Predicted_KPI_Payout__c : 0;
                                            pList.Growth_Actual_Payout__c += kpiAchievement.Growth_Achieved_KPI_Payout__c ? kpiAchievement.Growth_Achieved_KPI_Payout__c : 0;
                                            // plist.CE_Ratio_Actual_Retail__c += kpiAchievement.CE_Ratio_Actual_Payout__c ? kpiAchievement.CE_Ratio_Actual_Payout__c :0;
                                            pList.Total_Additional_Predicted_Payout__c = pList.Additional_Predicted_Payout__c + pList.Growth_Predicted_Payout__c;
                                            // pList.Total_Additional_Predicted_Payout__c += pList.Multi_KPI_Predicted_Payout__c ? pList.Multi_KPI_Predicted_Payout__c : 0;
                                            pList.Total_Additional_Actual_Payout__c = pList.Additional_Actual_Payout__c + pList.Growth_Actual_Payout__c;
                                            // pList.Total_Additional_Actual_Payout__c += pList.Multi_KPI_Actual_Payout__c ? pList.Multi_KPI_Actual_Payout__c : 0;
                                            pList.Total_Dealer_Predicted_Payout__c = pList.Total_Product_Predicted_Payout__c;
                                            pList.Total_Dealer_Actual_Payout__c = pList.Total_Product_Actual_Payout__c;
                                        } else {
                                            pList.Total_Sales_Person_Predicted_Payout__c = kpiAchievement.Predicted_KPI_Payout__c ? kpiAchievement.Predicted_KPI_Payout__c : 0;
                                            pList.Total_Sales_Person_Actual_Payout__c = kpiAchievement.Achieved_KPI_Payout__c ? kpiAchievement.Achieved_KPI_Payout__c : 0;
                                        }
                                        pList.Total_Predicted_Payout__c = pList.Total_Dealer_Predicted_Payout__c ? pList.Total_Dealer_Predicted_Payout__c : 0; 
                                        pList.Total_Predicted_Payout__c += pList.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                        pList.Total_Actual_Payout__c = pList.Total_Dealer_Actual_Payout__c ? pList.Total_Dealer_Actual_Payout__c : 0 
                                        pList.Total_Actual_Payout__c += pList.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                        productListMap[kpiAchievement.DI_Product_Target_and_Achivement__c] = pList;
                                    } else {
                                        let pList = productTarget;
                                        pList.Multi_KPI_Predicted_Payout__c = 0;
                                        pList.Multi_KPI_Actual_Payout__c = 0;
                                        if(kpiAchievement.Product_KPI__r.KPI__r.KPI_Visiblity__c.includes('CALC Payout')) {
                                            pList.Total_Product_Predicted_Payout__c = kpiAchievement.Predicted_KPI_Payout__c ? kpiAchievement.Predicted_KPI_Payout__c : 0;
                                            pList.Total_Product_Actual_Payout__c = kpiAchievement.Achieved_KPI_Payout__c ? kpiAchievement.Achieved_KPI_Payout__c : 0;
                                            pList.Additional_Predicted_Payout__c = kpiAchievement.Additional_Predicted_KPI_Payout__c ? kpiAchievement.Additional_Predicted_KPI_Payout__c : 0;
                                            pList.Additional_Actual_Payout__c = kpiAchievement.Additional_Achieved_KPI_Payout__c ? kpiAchievement.Additional_Achieved_KPI_Payout__c : 0;
                                            pList.Growth_Predicted_Payout__c = kpiAchievement.Growth_Predicted_KPI_Payout__c ? kpiAchievement.Growth_Predicted_KPI_Payout__c : 0;
                                            pList.Growth_Actual_Payout__c = kpiAchievement.Growth_Achieved_KPI_Payout__c ? kpiAchievement.Growth_Achieved_KPI_Payout__c : 0;
                                            pList.Total_Additional_Predicted_Payout__c = pList.Additional_Predicted_Payout__c + pList.Growth_Predicted_Payout__c;
                                            pList.Total_Additional_Actual_Payout__c = pList.Additional_Actual_Payout__c + pList.Growth_Actual_Payout__c;
                                            pList.Total_Dealer_Predicted_Payout__c = pList.Total_Product_Predicted_Payout__c;
                                            pList.Total_Dealer_Actual_Payout__c = pList.Total_Product_Actual_Payout__c;
                                            
                                        } else {
                                            pList.Total_Sales_Person_Predicted_Payout__c = kpiAchievement.Predicted_KPI_Payout__c ? kpiAchievement.Predicted_KPI_Payout__c : 0;
                                            pList.Total_Sales_Person_Actual_Payout__c = kpiAchievement.Achieved_KPI_Payout__c ? kpiAchievement.Achieved_KPI_Payout__c : 0;
                                        }
                                        pList.Total_Predicted_Payout__c = pList.Total_Dealer_Predicted_Payout__c ? pList.Total_Dealer_Predicted_Payout__c : 0; 
                                        pList.Total_Predicted_Payout__c += pList.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                        pList.Total_Actual_Payout__c = pList.Total_Dealer_Actual_Payout__c ? pList.Total_Dealer_Actual_Payout__c : 0 
                                        pList.Total_Actual_Payout__c += pList.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                        productListMap[kpiAchievement.DI_Product_Target_and_Achivement__c] = pList;
                                    }
                                } else {
                                    if(kpiAchievement?.Id) {
                                        deletedIds.push(kpiAchievement.Id);
                                    }
                                }
                            }
                            let pList = productListMap[productTarget?.Id];
                            if(pList) {
                                if(multiKPITargets?.length > 0) {
                                    pList = calculateMultiKpiPayout(pList, multiKPITargets, productKPIList, dealerInc);
                                }
                                pList.Total_Additional_Predicted_Payout__c += pList.Multi_KPI_Predicted_Payout__c ? pList.Multi_KPI_Predicted_Payout__c : 0;
                                pList.Total_Additional_Actual_Payout__c += pList.Multi_KPI_Actual_Payout__c ? pList.Multi_KPI_Actual_Payout__c : 0;
                                pList.Total_Dealer_Predicted_Payout__c += pList.Total_Additional_Predicted_Payout__c;
                                pList.Total_Dealer_Actual_Payout__c += pList.Total_Additional_Actual_Payout__c;
                                pList = calculateTIVPayout(pList, updatedAchievements);
                                if(isTIVConfigured) {
                                    pList.Total_Predicted_Payout__c = pList.TIV_Predicted_Payout__c ? pList.TIV_Predicted_Payout__c : 0;
                                    pList.Total_Actual_Payout__c = pList.TIV_Actual_Payout__c ? pList.TIV_Actual_Payout__c : 0;
                                } else {
                                    pList.Total_Predicted_Payout__c = pList.Total_Dealer_Predicted_Payout__c ? pList.Total_Dealer_Predicted_Payout__c : 0; 
                                    pList.Total_Actual_Payout__c = pList.Total_Dealer_Actual_Payout__c ? pList.Total_Dealer_Actual_Payout__c : 0 
                                }
                                pList.Total_Predicted_Payout__c += pList.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                pList.Total_Actual_Payout__c += pList.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                productListMap[productTarget.Id] = pList;
                            }

                            if(dealerListMap.hasOwnProperty(productTarget.Dealer_Incentive__c)) {
                                let dList = dealerListMap[productTarget.Dealer_Incentive__c];
                                if(pList?.Incentive_Status_Predicted__c == 'Eligible') {
                                    dList.Total_Product_Payout_Predicted__c += pList?.Total_Product_Predicted_Payout__c ? pList?.Total_Product_Predicted_Payout__c : 0;
                                    dList.Additional_Payout_Predicted__c += pList?.Additional_Predicted_Payout__c ? pList?.Additional_Predicted_Payout__c : 0;
                                    dList.Growth_Payout_Predicted__c += pList?.Growth_Predicted_Payout__c ? pList?.Growth_Predicted_Payout__c : 0;
                                    dList.Multi_KPI_Payout_Predicted__c += pList?.Multi_KPI_Predicted_Payout__c ? pList?.Multi_KPI_Predicted_Payout__c : 0;
                                    dList.Total_Additional_Payout_Predicted__c = dList.Additional_Payout_Predicted__c + dList.Growth_Payout_Predicted__c;
                                    dList.Total_Additional_Payout_Predicted__c += dList.Multi_KPI_Payout_Predicted__c ? dList.Multi_KPI_Payout_Predicted__c : 0;
                                    dList.Total_Dealer_Payout_Predicted__c =  dList.Total_Product_Payout_Predicted__c + dList.Total_Additional_Payout_Predicted__c;
                                    dList.TIV_Payout_Predicted__c += pList?.TIV_Predicted_Payout__c ? pList.TIV_Predicted_Payout__c : 0;
                                    if(isTIVConfigured) {
                                        dList.Total_Payout_Predicted__c += pList?.TIV_Predicted_Payout__c ? pList.TIV_Predicted_Payout__c : 0;
                                    } else {
                                        dList.Total_Payout_Predicted__c += pList?.Total_Dealer_Predicted_Payout__c ? pList.Total_Dealer_Predicted_Payout__c : 0;
                                    }
                                }
                                dList.Total_Sales_Person_Payout_Predicted__c += pList?.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                dList.Total_Payout_Predicted__c += pList?.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                // dList.Total_Payout_Predicted__c = dList.Total_Dealer_Payout_Predicted__c + dList.Total_Sales_Person_Payout_Predicted__c;
                                
                                if(pList?.Incentive_Status__c == 'Eligible') {
                                    dList.Total_Product_Payout_Achieved__c += pList?.Total_Product_Actual_Payout__c ? pList?.Total_Product_Actual_Payout__c : 0;
                                    dList.Additional_Payout_Achieved__c += pList?.Additional_Actual_Payout__c ? pList?.Additional_Actual_Payout__c : 0;
                                    dList.Growth_Payout_Achieved__c += pList?.Growth_Actual_Payout__c ? pList?.Growth_Actual_Payout__c : 0;
                                    dList.Multi_KPI_Payout_Achieved__c += pList?.Multi_KPI_Actual_Payout__c ? pList?.Multi_KPI_Actual_Payout__c : 0;
                                    dList.Total_Additional_Payout_Achieved__c = dList.Additional_Payout_Achieved__c + dList.Growth_Payout_Achieved__c;
                                    dList.Total_Additional_Payout_Achieved__c += dList.Multi_KPI_Payout_Achieved__c ? dList.Multi_KPI_Payout_Achieved__c : 0;
                                    dList.Total_Dealer_Payout_Achieved__c = dList.Total_Product_Payout_Achieved__c + dList.Total_Additional_Payout_Achieved__c;
                                    dList.TIV_Payout_Achieved__c += pList?.TIV_Actual_Payout__c ? pList.TIV_Actual_Payout__c : 0;
                                    if(isTIVConfigured) {
                                        dList.Total_Payout_Achieved__c += pList?.TIV_Actual_Payout__c ? pList.TIV_Actual_Payout__c : 0;
                                    } else {
                                        dList.Total_Payout_Achieved__c += pList?.Total_Dealer_Actual_Payout__c ? pList.Total_Dealer_Actual_Payout__c : 0;
                                    }
                                }
                                dList.Total_Sales_Person_Payout_Achieved__c += pList?.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                dList.Total_Payout_Achieved__c += pList?.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                
                                dealerListMap[productTarget.Dealer_Incentive__c] = dList;
                            } else {
                                let dList = dealerInc;
                                dList.Total_Product_Payout_Predicted__c = 0;
                                dList.Additional_Payout_Predicted__c = 0;
                                dList.Growth_Payout_Predicted__c = 0;
                                dList.Multi_KPI_Payout_Predicted__c = 0;
                                dList.Total_Additional_Payout_Predicted__c = 0;
                                dList.Total_Dealer_Payout_Predicted__c = 0;
                                dList.TIV_Payout_Predicted__c = 0;
                                dList.Total_Sales_Person_Payout_Predicted__c = 0;
                                dList.Total_Payout_Predicted__c = 0;

                                dList.Total_Product_Payout_Achieved__c = 0;
                                dList.Additional_Payout_Achieved__c = 0;
                                dList.Growth_Payout_Achieved__c = 0;
                                dList.Multi_KPI_Payout_Achieved__c = 0;
                                dList.Total_Additional_Payout_Achieved__c = 0;
                                dList.Total_Dealer_Payout_Achieved__c = 0;
                                dList.TIV_Payout_Achieved__c = 0;
                                dList.Total_Sales_Person_Payout_Achieved__c = 0;
                                dList.Total_Payout_Achieved__c = 0;
                                
                                if(pList?.Incentive_Status_Predicted__c == 'Eligible') {
                                    dList.Total_Product_Payout_Predicted__c = pList?.Total_Product_Predicted_Payout__c ? pList?.Total_Product_Predicted_Payout__c : 0;
                                    dList.Additional_Payout_Predicted__c = pList?.Additional_Predicted_Payout__c ? pList?.Additional_Predicted_Payout__c : 0;
                                    dList.Growth_Payout_Predicted__c = pList?.Growth_Predicted_Payout__c ? pList?.Growth_Predicted_Payout__c : 0;
                                    dList.Multi_KPI_Payout_Predicted__c = pList?.Multi_KPI_Predicted_Payout__c ? pList?.Multi_KPI_Predicted_Payout__c : 0;
                                    dList.Total_Additional_Payout_Predicted__c = dList.Additional_Payout_Predicted__c + dList.Growth_Payout_Predicted__c;
                                    dList.Total_Additional_Payout_Predicted__c += dList.Multi_KPI_Payout_Predicted__c ? dList.Multi_KPI_Payout_Predicted__c : 0;
                                    dList.Total_Dealer_Payout_Predicted__c =  dList.Total_Product_Payout_Predicted__c + dList.Total_Additional_Payout_Predicted__c;
                                    dList.TIV_Payout_Predicted__c = pList?.TIV_Predicted_Payout__c ? pList.TIV_Predicted_Payout__c : 0;
                                    if(isTIVConfigured) {
                                        dList.Total_Payout_Predicted__c = pList?.TIV_Predicted_Payout__c ? pList.TIV_Predicted_Payout__c : 0;
                                    } else {
                                        dList.Total_Payout_Predicted__c = pList?.Total_Dealer_Predicted_Payout__c ? pList.Total_Dealer_Predicted_Payout__c : 0;
                                    }
                                }
                                dList.Total_Sales_Person_Payout_Predicted__c = pList?.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                dList.Total_Payout_Predicted__c += pList?.Total_Sales_Person_Predicted_Payout__c ? pList.Total_Sales_Person_Predicted_Payout__c : 0;
                                // dList.Total_Payout_Predicted__c = dList.Total_Dealer_Payout_Predicted__c + dList.Total_Sales_Person_Payout_Predicted__c;

                                if(pList?.Incentive_Status__c == 'Eligible') {
                                    dList.Total_Product_Payout_Achieved__c = pList?.Total_Product_Actual_Payout__c ? pList?.Total_Product_Actual_Payout__c : 0;
                                    dList.Additional_Payout_Achieved__c = pList?.Additional_Actual_Payout__c ? pList?.Additional_Actual_Payout__c : 0;
                                    dList.Growth_Payout_Achieved__c = pList?.Growth_Actual_Payout__c ? pList?.Growth_Actual_Payout__c : 0;
                                    dList.Multi_KPI_Payout_Achieved__c = pList?.Multi_KPI_Actual_Payout__c ? pList?.Multi_KPI_Actual_Payout__c : 0;
                                    dList.Total_Additional_Payout_Achieved__c = dList.Additional_Payout_Achieved__c + dList.Growth_Payout_Achieved__c;
                                    dList.Total_Additional_Payout_Achieved__c += dList.Multi_KPI_Payout_Achieved__c ? dList.Multi_KPI_Payout_Achieved__c : 0;
                                    dList.Total_Dealer_Payout_Achieved__c = dList.Total_Product_Payout_Achieved__c + dList.Total_Additional_Payout_Achieved__c;
                                    dList.TIV_Payout_Achieved__c = pList?.TIV_Actual_Payout__c ? pList.TIV_Actual_Payout__c : 0;
                                    if(isTIVConfigured) {
                                        dList.Total_Payout_Achieved__c = pList?.TIV_Actual_Payout__c ? pList.TIV_Actual_Payout__c : 0;
                                    } else {
                                        dList.Total_Payout_Achieved__c = pList?.Total_Dealer_Actual_Payout__c ? pList.Total_Dealer_Actual_Payout__c : 0;
                                    }
                                }
                                dList.Total_Sales_Person_Payout_Achieved__c = pList?.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                dList.Total_Payout_Achieved__c += pList?.Total_Sales_Person_Actual_Payout__c ? pList.Total_Sales_Person_Actual_Payout__c : 0;
                                dealerListMap[productTarget.Dealer_Incentive__c] = dList;
                            }
                        }
                    }
                }
            }
        }
        let updatedList = {};
        if(kpiAchievements.length > 0) {
            updatedList.kpiAchievements = kpiAchievements;
            let productList = Object.values(productListMap);
            if(productList?.length > 0) {
                updatedList.productList = productList;
                let dealerList = Object.values(dealerListMap);
                if(dealerList?.length > 0) {
                    updatedList.dealerList = dealerList;
                }
            }
            updatedList.subTargetList = [];
            const result = await saveKPIAchievements(updatedList);
            console.log('result 2 --->   ' +result);
            return result;
        }
    } catch(error) {
        console.error('error 2 ---->  ', error);
    }
}

async function saveKPIAchievements(updatedList) {
    // saveKpiPayouts({kpiAchievements : updatedList.kpiAchievements, subTargets : updatedList.subTargetList, productTargets : updatedList.productList, dealerIncentives : updatedList.dealerList, deletedIds : deletedIds}).then(res => {
    //     console.log('Recalculate Incentive for all Dealers Successfully');
    // }).catch(error => {
    //     console.error('Recalculate Incentive error   ', error);
    // })

     try {
        const res = await saveKpiPayouts({
            kpiAchievements: updatedList.kpiAchievements,
            subTargets: updatedList.subTargetList,
            productTargets: updatedList.productList,
            dealerIncentives: updatedList.dealerList,
            deletedIds: deletedIds
        });
        console.log('Recalculate Incentive for all Dealers Successfully  ', res);
        return res;
    } catch (error) {
        console.error('Error saving KPI achievements:', error);
        return  error;
    }
}

function calculateKPIPayout(kpiAchievement, kpiTarget, productTarget, productKPIList) {
    try {
        let actualRetailFields = { retail : 'SubCategory_Retail_Achieved__c', twoWD : 'TwoWD_Retail_Achieved__c', fourWD : 'FourWD_Retail_Achieved__c'};
        let predictedRetailFields = { retail : 'SubCategory_Retail_Predicted__c', twoWD : 'TwoWD_Retail_Predicted__c', fourWD : 'FourWD_Retail_Predicted__c'};
        if (kpiTarget && !kpiTarget.productKPI.kpiName.includes('Sales Person')) {
            if(kpiTarget.hasSlabs && kpiTarget.slabInfo?.length > 0) {
                let slabs = kpiTarget.slabInfo;
                let isEligible = false;
                if(isActual || !isActual) {
                    let achieved = kpiAchievement.Achieved_KPI_Perncentage__c ? kpiAchievement.Achieved_KPI_Perncentage__c : 0;
                    if(achieved > 0) {
                        for(let i = 0; i < slabs.length; i++) {
                            if (validateTargetConditon(slabs[i].slabRange, achieved)) {
                                isEligible = true;
                                if (slabs[i].payoutMode != 'Amt') {
                                    if (slabs[i].payoutMode != 'proRata') {
                                        kpiAchievement.Achieved_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, actualRetailFields) * (parseFloat(slabs[i].payoutPercentage) / 100)).toFixed(2));
                                    } else {
                                        let proRataPercent = parseFloat(achieved) / 100;
                                        kpiAchievement.Achieved_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, actualRetailFields) * proRataPercent).toFixed(2));
                                    }
                                } else {
                                    kpiAchievement.Achieved_KPI_Payout__c = parseFloat(productTarget.Total_Retail_Achieved__c * slabs[i].amount);
                                }
                                break;
                            }
                        }
                    }
                    if (!isEligible) {
                        kpiAchievement.Achieved_KPI_Payout__c = 0;
                    }
                }
                if(!isActual) {
                    isEligible = false;
                    for(let i = 0; i < slabs.length; i++) {
                        let achieved = kpiAchievement.Predicted_KPI_Percentage__c ? kpiAchievement.Predicted_KPI_Percentage__c : 0;
                        if (validateTargetConditon(slabs[i].slabRange, achieved)) {
                            isEligible = true;
                            if (slabs[i].payoutMode != 'Amt') {
                                if (slabs[i].payoutMode != 'proRata') {
                                    kpiAchievement.Predicted_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, predictedRetailFields) * (parseFloat(slabs[i].payoutPercentage) / 100)).toFixed(2));
                                } else {
                                    let predictedPercent = parseFloat(achieved) / 100;
                                    kpiAchievement.Predicted_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, predictedRetailFields) * predictedPercent).toFixed(2));
                                }
                            } else {
                                kpiAchievement.Predicted_KPI_Payout__c = parseFloat(productTarget.Total_Retail_Predicted__c * slabs[i].amount);
                            }
                            break;
                        }
                    }
                    if (!isEligible) {
                        kpiAchievement.Predicted_KPI_Payout__c = 0;
                    }
                }
            } else {
                if (kpiTarget.target) {
                    if(isActual || !isActual) {
                        let achieved = kpiAchievement.Achieved_KPI_Perncentage__c ? kpiAchievement.Achieved_KPI_Perncentage__c : 0;
                        if (validateTargetConditon(kpiTarget.target, achieved)) {
                                kpiAchievement.Achieved_KPI_Payout__c = getPayoutAmount(productTarget, kpiTarget, actualRetailFields);
                        } else {
                            kpiAchievement.Achieved_KPI_Payout__c = 0;
                        }
                    }
                    if(!isActual) {
                        let achieved = kpiAchievement.Predicted_KPI_Percentage__c ? kpiAchievement.Predicted_KPI_Percentage__c : 0;
                        if (validateTargetConditon(kpiTarget.target, achieved)) {
                                kpiAchievement.Predicted_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, predictedRetailFields));
                        } else {
                            kpiAchievement.Predicted_KPI_Payout__c = 0;
                        }
                    }
                } else {
                    kpiAchievement.Achieved_KPI_Payout__c = 0;
                    kpiAchievement.Predicted_KPI_Payout__c = 0;
                }
            }
        } else if (kpiTarget && kpiTarget.productKPI.kpiName.includes('Demo')) {
            var demoTarget = productTarget.demoTarget;
            var expr;
            if (demoTarget) {
                expr = '>=' + demoTarget;
                if(isActual || !isActual) {
                    let achieved = productTarget.demoConductedActual ? productTarget.demoConductedActual : 0;
                    if (validateTargetConditon(expr, achieved)) {
                        kpiAchievement.Achieved_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, actualRetailFields));
                    } else {
                        kpiAchievement.Achieved_KPI_Payout__c = 0;
                    }
                }
                if(!isActual) {
                    let achieved = productTarget.demoConductedPredicted ? productTarget.demoConductedPredicted : 0;
                    if (validateTargetConditon(expr, achieved)) {
                        kpiAchievement.Predicted_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, predictedRetailFields));
                    } else {
                        kpiAchievement.Predicted_KPI_Payout__c = 0;
                    }
                }
            } else {
                kpiAchievement.Achieved_KPI_Payout__c = 0;
                kpiAchievement.Predicted_KPI_Payout__c = 0;
            }
        } else if (kpiTarget.productKPI?.kpiName.includes('Sales Person')) {
            let kpiTar = prodTargetAndPayoutInfo.find(kpi => kpi.productKPI.productId == productTarget.Product_Category__c && kpi.salesPersonTarget != null && kpi.isSalesmanIncentive);
            if(kpiTar) {
                let kpiAch = productKPIList.find(kpi => kpi.Product_KPI__c == kpiTar.productKPI.productKPIId);
                if(kpiAch) {
                    let salesTarget = extractTargetNumValue(kpiTar.salesPersonTarget, true)
                    if (isActual || !isActual) {
                        let salesAchieved = kpiAch.Achieved_KPI_Perncentage__c > 0 && salesTarget > 0 ? (kpiAch.Achieved_KPI_Perncentage__c / salesTarget) * 100 : 0;
                        let slabs = kpiTar.slabInfo;
                        let isEligible = false;
                        if(salesAchieved > 0) {
                            for(let i = 0; i < slabs.length; i++) {
                                if(slabs[i].slabType == 'Salesperson Incentive') {
                                    if (validateTargetConditon(slabs[i].slabRange, salesAchieved)) {
                                        isEligible = true;
                                        if (slabs[i].payoutMode != 'Amt') {
                                            if (slabs[i].payoutMode != 'proRata') {
                                                kpiAchievement.Achieved_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, actualRetailFields) * (parseFloat(slabs[i].payoutPercentage) / 100)).toFixed(2));
                                            } else {
                                                let proRataPercent = parseFloat(salesAchieved) / 100;
                                                kpiAchievement.Achieved_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, actualRetailFields) * proRataPercent).toFixed(2));
                                            }
                                        } else {
                                            kpiAchievement.Achieved_KPI_Payout__c = parseFloat(productTarget.Total_Retail_Achieved__c * slabs[i].amount);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if (!isEligible) {
                            kpiAchievement.Achieved_KPI_Payout__c = 0;
                        }
                    } 
                    if (!isActual) {
                        let salesAchieved = kpiAch.Predicted_KPI_Percentage__c > 0 && salesTarget > 0 ? (kpiAch.Predicted_KPI_Percentage__c / salesTarget) * 100 : 0;
                        let slabs = kpiTar.slabInfo;
                        let isEligible = false;
                        if(salesAchieved > 0) {
                            for(let i = 0; i < slabs.length; i++) {
                                if(slabs[i].slabType == 'Salesperson Incentive') {
                                    if (validateTargetConditon(slabs[i].slabRange, salesAchieved)) {
                                        isEligible = true;
                                        if (slabs[i].payoutMode != 'Amt') {
                                            if (slabs[i].payoutMode != 'proRata') {
                                                kpiAchievement.Predicted_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, predictedRetailFields) * (parseFloat(slabs[i].payoutPercentage) / 100)).toFixed(2));
                                            } else {
                                                let proRataPercent = parseFloat(salesAchieved) / 100;
                                                kpiAchievement.Predicted_KPI_Payout__c = parseFloat((getPayoutAmount(productTarget, kpiTarget, predictedRetailFields) * proRataPercent).toFixed(2));
                                            }
                                        } else {
                                            kpiAchievement.Predicted_KPI_Payout__c = parseFloat(productTarget.Total_Retail_Predicted__c * slabs[i].amount);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if (!isEligible) {
                            kpiAchievement.Predicted_KPI_Payout__c = 0;
                        }
                    } 
                } else {
                    if(isActual || !isActual) {
                        kpiAchievement.Achieved_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, actualRetailFields));
                    }
                    if(!isActual) {
                        kpiAchievement.Predicted_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, predictedRetailFields));
                    }
                }
            }
            else {
                if(isActual || !isActual) {
                    kpiAchievement.Achieved_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, actualRetailFields));
                }
                if(!isActual) {
                    kpiAchievement.Predicted_KPI_Payout__c = parseFloat(getPayoutAmount(productTarget, kpiTarget, predictedRetailFields));
                }
            }
        }
    } catch(error) {
    }
    return kpiAchievement;
}

function calculateTIVPayout(pList, updatedAchievements) {
    let tivTarget = prodTargetAndPayoutInfo.find(kpi => kpi.productKPI.productId == pList.Product_Category__c && kpi.isIndustryIncentive);
    if (tivTarget) {
        let kpiAch = updatedAchievements?.find(kpi => kpi.Product_KPI__c == tivTarget.productKPI.productKPIId);
        if (kpiAch) {
            let slabs = tivTarget.slabInfo?.filter(slab => slab.slabType == 'Total Volume Industry Incentive');
            if (slabs?.length > 0) {
                isTIVConfigured = true;
                if(isActual || !isActual) {
                    let isEligible = false;
                    let coverageAchieved = kpiAch.Achieved_KPI_Perncentage__c ? kpiAch.Achieved_KPI_Perncentage__c : 0;
                    if (coverageAchieved > 0) {
                        for (let s = 0; s < slabs?.length; s++) {
                            if (slabs[s].slabType == 'Total Volume Industry Incentive') {
                                if (validateTargetConditon(slabs[s].slabRange, coverageAchieved)) {
                                    isEligible = true;
                                    let percent = slabs[s].payoutPercentage > 0 ? slabs[s].payoutPercentage : 0;
                                    pList.TIV_Actual_Payout__c = parseFloat(((pList.Total_Dealer_Actual_Payout__c * percent) / 100).toFixed(2));
                                    break;
                                }
                            }
                        }
                    }
                    if (!isEligible) {
                        pList.TIV_Actual_Payout__c = 0;
                    }

                }
                if(!isActual) {
                    let isEligible = false;
                    let coverageAchieved = kpiAch.Predicted_KPI_Percentage__c ? kpiAch.Predicted_KPI_Percentage__c : 0;
                    if (coverageAchieved > 0) {
                        for (let s = 0; s < slabs?.length; s++) {
                            if (slabs[s].slabType == 'Total Volume Industry Incentive') {
                                if (validateTargetConditon(slabs[s].slabRange, coverageAchieved)) {
                                    isEligible = true;
                                    let percent = slabs[s].payoutPercentage > 0 ? slabs[s].payoutPercentage : 0;
                                    pList.TIV_Predicted_Payout__c = parseFloat(((pList.Total_Dealer_Predicted_Payout__c * percent) / 100).toFixed(2));
                                    break;
                                }
                            }
                        }
                    }
                    if (!isEligible) {
                        pList.TIV_Predicted_Payout__c = 0;
                    }

                }
            } else {
                pList.TIV_Actual_Payout__c = 0;
                pList.TIV_Predicted_Payout__c = 0;
            }
        }
    } else {
        pList.TIV_Actual_Payout__c = 0;
        pList.TIV_Predicted_Payout__c = 0;
    }
    return pList;
}

function calculateAddKPIPayout(kpiAchievement, addKPITarget, productTarget, dealerInc) {
    if (addKPITarget.hasSlabs && addKPITarget.slabInfo?.length > 0) {
        var slabs = addKPITarget.slabInfo;
        if(isActual || !isActual) {
            let percentage = kpiAchievement.Achieved_KPI_Perncentage__c ? kpiAchievement.Achieved_KPI_Perncentage__c : 0;
            let isEligible = false;
            for (let i = 0; i < slabs?.length; i++) {
                if (validateTargetConditon(slabs[i].slabRange, percentage)) {
                    kpiAchievement.Additional_Achieved_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Achieved__c * slabs[i].amount);
                    isEligible = true;
                    break;
                }
            }
            if (!isEligible) {
                kpiAchievement.Additional_Achieved_KPI_Payout__c = 0;
            }
        }
        if(!isActual) {
            let isEligible = false;
            let percentage = kpiAchievement.Predicted_KPI_Percentage__c ? kpiAchievement.Predicted_KPI_Percentage__c : 0;
            for (let i = 0; i < slabs?.length; i++) {
                if (validateTargetConditon(slabs[i].slabRange, percentage)) {
                    kpiAchievement.Additional_Predicted_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Predicted__c * slabs[i].amount);
                    isEligible = true;
                    break;
                }
            }
            if (!isEligible) {
                kpiAchievement.Additional_Predicted_KPI_Payout__c = 0;
            }
        }
    } else {
        if (addKPITarget.target) {
            if(isActual || !isActual) {
                let percentage;
                if (addKPITarget.productKPI.kpiName.includes('Demo')) {
                    percentage = productTarget.Demo_Target__c > 0 && kpiAchievement.Achieved_KPI_Perncentage__c > 0 ? (kpiAchievement.Achieved_KPI_Perncentage__c / productTarget.Demo_Target__c) * 100 : 0;
                } else {
                    percentage = kpiAchievement.Achieved_KPI_Perncentage__c ? kpiAchievement.Achieved_KPI_Perncentage__c : 0;
                }
                if (validateTargetConditon(addKPITarget.target, percentage)) {
                    kpiAchievement.Additional_Achieved_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Achieved__c * addKPITarget.incentiveAmount);
                } else if (addKPITarget.machineTarget?.length > 0) {
                    let predictedDiff;
                    if (addKPITarget.productKPI.kpiName.includes('Volume')) {
                        predictedDiff = productTarget.Total_Retail_Achieved__c - productTarget.Total_Retail_Target__c;
                    } else {
                        predictedDiff = kpiAchievement.Achieved_KPI_Perncentage__c - productTarget.Demo_Target__c;
                    }
                    for (let m = 0; m < addKPITarget.machineTarget?.length; m++) {
                        if (validateTargetConditon(addKPITarget.machineTarget[m].slabRange, predictedDiff)) {
                            kpiAchievement.Additional_Achieved_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Achieved__c * addKPITarget.machineTarget[m].amount);
                            break;
                        }
                    }
                } else {
                    kpiAchievement.Additional_Achieved_KPI_Payout__c = 0;
                }
            }
            if(!isActual) {
                let percentage;
                if (addKPITarget.productKPI.kpiName.includes('Demo')) {
                    percentage = productTarget.Demo_Target__c > 0 && kpiAchievement.Predicted_KPI_Percentage__c > 0 ? (kpiAchievement.Predicted_KPI_Percentage__c / productTarget.Demo_Target__c) * 100 : 0;
                } else {
                    percentage = kpiAchievement.Predicted_KPI_Percentage__c ? kpiAchievement.Predicted_KPI_Percentage__c : 0;
                }
                if (validateTargetConditon(addKPITarget.target, percentage)) {
                    kpiAchievement.Additional_Predicted_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Predicted__c * addKPITarget.incentiveAmount);
                } else if (addKPITarget.machineTarget?.length > 0) {
                    let predictedDiff;
                    if (addKPITarget.productKPI.kpiName.includes('Volume')) {
                        predictedDiff = productTarget.Total_Retail_Predicted__c - productTarget.Total_Retail_Target__c;
                    } else {
                        predictedDiff = kpiAchievement.Predicted_KPI_Percentage__c - productTarget.Demo_Target__c;
                    }
                    for (let m = 0; m < addKPITarget.machineTarget?.length; m++) {
                        if (validateTargetConditon(addKPITarget.machineTarget[m].slabRange, predictedDiff)) {
                            kpiAchievement.Additional_Predicted_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Predicted__c * addKPITarget.machineTarget[m].amount);
                            break;
                        }
                    }
                } else {
                    kpiAchievement.Additional_Predicted_KPI_Payout__c = 0;
                }
            }
        } else {
            kpiAchievement.Additional_Achieved_KPI_Payout__c = 0;
            kpiAchievement.Additional_Predicted_KPI_Payout__c = 0;
        }
    }
    return kpiAchievement;
}

function calculateGrowthKPIPayout(kpiAchievement, growthKPITarget, productTarget, dealerInc) {

    if(prevDealerWrappers) {
        let currentDealers = prevDealerWrappers[dealerInc.Dealer_Account__c];
        let prevDealer = currentDealers?.find(deal => deal.month == growthKPITarget.prevMonth);
        if (prevDealer?.productTargetsAndAchievements) {
            let prevProdTarget = prevDealer.productTargetsAndAchievements.find(prod => prod.productId == productTarget.Product_Category__c);
            if (prevProdTarget?.productKPIAndAchievements) {
                let kpiAch = prevProdTarget.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == growthKPITarget.productKPI.kpiId);
                if (kpiAch) {
                    if (growthKPITarget.hasSlabs && growthKPITarget.slabInfo?.length > 0) {
                        var slabs = growthKPITarget.slabInfo;
                        if(isActual || !isActual) {
                            let growthDiff = kpiAchievement?.Achieved_KPI_Perncentage__c > 0 && kpiAch.achievedKPIPerncentage > 0 ? kpiAchievement.Achieved_KPI_Perncentage__c - kpiAch.achievedKPIPerncentage : 0;
                            let isEligible = false;
                            for (let i = 0; i < slabs?.length; i++) {
                                if (validateTargetConditon(slabs[i].slabRange, kpiAch.achievedKPIPerncentage) && validateTargetConditon(slabs[i].growthRange, growthDiff)) {
                                    kpiAchievement.Growth_Achieved_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Achieved__c * slabs[i].amount);
                                    isEligible = true;
                                    break;
                                }
                            }
                            if (!isEligible) {
                                kpiAchievement.Growth_Achieved_KPI_Payout__c = 0;
                            }
                        }
                        if(!isActual) {
                            let growthDiff = kpiAchievement?.Predicted_KPI_Percentage__c > 0 && kpiAch.achievedKPIPerncentage > 0 ? kpiAchievement.Achieved_KPI_Perncentage__c - kpiAch.achievedKPIPerncentage : 0;
                            let isEligible = false;
                            for (let i = 0; i < slabs?.length; i++) {
                                if (validateTargetConditon(slabs[i].slabRange, kpiAch.achievedKPIPerncentage) && validateTargetConditon(slabs[i].growthRange, growthDiff)) {
                                    kpiAchievement.Growth_Predicted_KPI_Payout__c = parseFloat(dealerInc.Total_Retail_Predicted__c * slabs[i].amount);
                                    isEligible = true;
                                    break;
                                }
                            }
                            if (!isEligible) {
                                kpiAchievement.Growth_Predicted_KPI_Payout__c = 0;
                            }
                        }
                    } else {
                        kpiAchievement.Growth_Achieved_KPI_Payout__c = 0;
                        kpiAchievement.Growth_Predicted_KPI_Payout__c = 0;
                    }
                }
            }
        }
    }
    return kpiAchievement;
}

function calculateMultiKpiPayout(product, multiKpi, productKPIList, dealerInc) {
    product.Multi_KPI_Predicted_Payout__c = 0 ;
    product.Multi_KPI_Actual_Payout__c = 0;
    for (let i = 0; i < multiKpi?.length; i++) {
        let slabs = multiKpi[i].multiKpSlabs;
        let conditionList = [];
        if(isActual || !isActual) {
            for (let j = 0; j < slabs?.length; j++) {
                let kpi = productKPIList.find(kpi => kpi.Product_KPI__c == slabs[j].productKPI?.productKPIId);
                let achieved = kpi ? kpi.Achieved_KPI_Perncentage__c ? kpi.Achieved_KPI_Perncentage__c : 0 : 0;
                conditionList.push(validateTargetConditon(slabs[j].slabRange, achieved));
            }
            if(conditionList?.length > 0) {
                let params = {propertyName : 'Multi_KPI_Actual_Payout__c', grandTotalVolume : dealerInc.Total_Retail_Achieved__c};
                product = checkConditionLogic(conditionList, multiKpi[i], params, product);
            }
        }
        if(!isActual) {
            conditionList = [];
            for (let j = 0; j < slabs?.length; j++) {
                let kpi = productKPIList.find(kpi => kpi.Product_KPI__c == slabs[j].productKPI?.productKPIId);
                let achieved = kpi ? kpi.Predicted_KPI_Percentage__c ? kpi.Predicted_KPI_Percentage__c : 0 : 0;
                conditionList.push(validateTargetConditon(slabs[j].slabRange, achieved));
            }
            if(conditionList?.length > 0) {
                let params = {propertyName : 'Multi_KPI_Predicted_Payout__c', grandTotalVolume : dealerInc.Total_Retail_Predicted__c};
                product = checkConditionLogic(conditionList, multiKpi[i], params, product);
            }
        }
       
    }

    return product;
}


function calculateCERKPIPayout(kpiAchievement, cerKPITarget, productTarget, dealerInc, productKPIList) {
    let prevMonth = getMonth(dealerInc.Month__c);
    let prevYear = cerKPITarget?.year - 1;
    var addKPITar = prodTargetAndPayoutInfo.find((kpiTar) => kpiTar.type == 'Product To CE Ratio' && kpiTar.target != null && !kpiTar.hasSlabs);
    var addKPIAch = productKPIList.find(kpiAch => kpiAch.Product_KPI__r.KPI__c == addKPITar?.productKPI?.kpiId);
    var addKPIPercentageActual = addKPIAch?.Achieved_KPI_Perncentage__c ? addKPIAch.Achieved_KPI_Perncentage__c : 0;
    var addKPIPercentagePredicted = addKPIAch?.predictedKPIPercentage ? addKPIAch.predictedKPIPercentage : 0;
    kpiAchievement.Quarter_Actual_Percentage__c = kpiAchievement.Achieved_KPI_Perncentage__c;
    if(prevDealerWrappers) {
        let currentDealers = prevDealerWrappers[dealerInc.Dealer_Account__c];
        let prevQuarterMonths = ['October', 'November', 'December'];
        let prevDealer = currentDealers?.filter(deal => prevQuarterMonths.includes(deal.month) && deal.year == prevYear);
        if (prevDealer?.length > 0) { // prevDealer?.productTargetsAndAchievements
            // let prevProdTarget = prevDealer.productTargetsAndAchievements.find(prod => prod.productId == productTarget.Product_Category__c);
            let prevQuarterActualPercentage = 0;
            for(let i = 0; i < prevDealer.length; i++) {
                let prevProdTarget = prevDealer[i].productTargetsAndAchievements.find(prod => prod.productId == productTarget.Product_Category__c);
                let kpiAch = prevProdTarget.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == cerKPITarget.productKPI.kpiId);
                if(kpiAch) {
                    prevQuarterActualPercentage += kpiAch.achievedKPIPerncentage ? kpiAch.achievedKPIPerncentage : 0;
                }
            }
            prevQuarterActualPercentage = prevQuarterActualPercentage / prevDealer.length;
            // if (prevProdTarget?.productKPIAndAchievements) {
                // let kpiAch = prevProdTarget.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == cerKPITarget.productKPI.kpiId);
                if (prevQuarterActualPercentage > 0) { // kpiAch
                    let prevMonthDealer = currentDealers?.find(deal => deal.month == prevMonth && deal.year == cerKPITarget.year);
                    let prevMonthProduct = prevMonthDealer?.productTargetsAndAchievements.find(prod => prod.productId == productTarget.Product_Category__c);
                    let prevMonthKpiAch = prevMonthProduct?.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == cerKPITarget.productKPI.kpiId);
                    let prevMonthYTDPayout = prevMonthKpiAch?.ceRatioYTDActualPayout ? parseFloat(prevMonthKpiAch?.ceRatioYTDActualPayout) : 0;
                    let prevMonthYTDRetail = prevMonthProduct?.quarterRetailAchieved ? prevMonthProduct?.quarterRetailAchieved : 0;
                    productTarget.Quarter_Retail_Achieved__c = dealerInc.Month__c == 'January' ? productTarget.Total_Retail_Achieved__c : productTarget.Total_Retail_Achieved__c + prevMonthYTDRetail;
                    let prevPayout = dealerInc.Month__c == 'January' ? 0 : prevMonthKpiAch?.ceRatioYTDActualPayout ? parseFloat(prevMonthKpiAch?.ceRatioYTDActualPayout) : 0;
                    if (cerKPITarget.hasSlabs && cerKPITarget.slabInfo?.length > 0) {
                        var slabs = cerKPITarget.slabInfo;
                        // let prevQuarterActualPercentage = kpiAch?.quarterActualPercentage ? kpiAch.quarterActualPercentage : 0;
                        if(isActual || !isActual) {
                            let quarterActualPercentage = kpiAchievement?.Quarter_Actual_Percentage__c ? kpiAchievement.Quarter_Actual_Percentage__c : 0;
                            let growthDiff = quarterActualPercentage - prevQuarterActualPercentage;
                            let isEligible = false;
                            for (let i = 0; i < slabs?.length; i++) {
                                if (validateTargetConditon(slabs[i].growth, growthDiff) && validateTargetConditon(slabs[i].slabRange, growthDiff)) {
                                    if(addKPITar == null || (addKPITar?.target && addKPIPercentageActual > 0 && validateTargetConditon(addKPITar?.target, addKPIPercentageActual))) {
                                        kpiAchievement.CE_Ratio_Actual_Payout__c = parseFloat(productTarget.Quarter_Retail_Achieved__c * slabs[i].amount) - prevPayout;
                                        kpiAchievement.CE_Ratio_YTD_Actual_Payout__c = (dealerInc.Month__c == 'January') ? kpiAchievement.CE_Ratio_Actual_Payout__c : prevMonthYTDPayout + kpiAchievement.CE_Ratio_Actual_Payout__c ;
                                        isEligible = true;
                                        break;
                                    }
                                 }
                             }
                            if (!isEligible) {
                                kpiAchievement.CE_Ratio_Actual_Payout__c = 0 - prevPayout;
                                kpiAchievement.CE_Ratio_YTD_Actual_Payout__c = (dealerInc.Month__c == 'January') ? kpiAchievement.CE_Ratio_Actual_Payout__c : prevMonthYTDPayout + kpiAchievement.CE_Ratio_Actual_Payout__c;
                            }
                        }
                        if(!isActual) {
                            let quarterActualPercentage = kpiAchievement?.Quarter_Predicted_Percentage__c ? kpiAchievement.Quarter_Predicted_Percentage__c : 0;
                            let growthDiff = quarterActualPercentage - prevQuarterActualPercentage;
                            let isEligible = false;
                            for (let i = 0; i < slabs?.length; i++) {
                                if (validateTargetConditon(slabs[i].growth, growthDiff) && validateTargetConditon(slabs[i].slabRange, growthDiff)) {
                                    if(addKPITar == null || (addKPITar?.target && addKPIPercentagePredicted > 0 && validateTargetConditon(addKPITar?.target, addKPIPercentagePredicted))) {
                                        kpiAchievement.CE_Ratio_Predicted_Payout__c = parseFloat(productTarget.Quarter_Retail_Predicted__c * slabs[i].amount);
                                        kpiAchievement.CE_Ratio_YTD_Predicted_Payout__c = (dealerInc.Month__c == 'January') ? kpiAchievement.CE_Ratio_Predicted_Payout__c : prevMonthYTDPayout + kpiAchievement.CE_Ratio_Predicted_Payout__c;
                                        isEligible = true;
                                        break;
                                    }
                                 }
                             }
                            if (!isEligible) {
                                kpiAchievement.CE_Ratio_Predicted_Payout__c = 0 - prevPayout;
                                // kpiAchievement.CE_Ratio_YTD_Predicted_Payout__c = kpiAch.ceRatioYTDActualPayout;
                            }
                        }
                    } else {
                        kpiAchievement.CE_Ratio_Actual_Payout__c = 0;
                        kpiAchievement.CE_Ratio_Predicted_Payout__c = 0;
                        kpiAchievement.CE_Ratio_YTD_Actual_Payout__c = (dealerInc.Month__c == 'January') ? kpiAchievement.CE_Ratio_Actual_Payout__c : prevMonthYTDPayout + kpiAchievement.CE_Ratio_Actual_Payout__c ;
                        kpiAchievement.CE_Ratio_YTD_Predicted_Payout__c = (dealerInc.Month__c == 'January') ? kpiAchievement.CE_Ratio_Predicted_Payout__c : prevMonthYTDPayout + kpiAchievement.CE_Ratio_Predicted_Payout__c ;

                    }
                }
            // }
        }
    }
    return kpiAchievement;
    }


function getMonth(month){
    let monthMap = {
            'January': 'December',
            'February' :'January',
            'March' : 'February',
            'April' : 'March',
            'May' : 'April',
            'June' : 'May',
            'July' :'June',
            'August' : 'July',
            'September' : 'August',
            'October' : 'September',
            'November' : 'October',
            'December' : 'November'
    };
    return monthMap[month];
}

function checkConditionLogic(conditionList, multiKpi, params, product) {
    if (multiKpi.conditionLogic == 'AND') {
        let isAnd = true;
        for (let k = 0; k < conditionList?.length; k++) {
            if (!conditionList[k]) {
                product[params.propertyName] = product[params.propertyName] ? product[params.propertyName] : 0;
                isAnd = false;
                break;
            }
        }
        if (isAnd) {
            let amt = params.grandTotalVolume > 0 ? parseFloat(params.grandTotalVolume * multiKpi.incentiveAmount) : 0;
            product[params.propertyName] = product[params.propertyName] ? product[params.propertyName] + amt : amt;
        }
    } else if (multiKpi.conditionLogic == 'OR') {
        let isOr = true;
        for (let k = 0; k < conditionList?.length; k++) {
            if (conditionList[k]) {
                let amt = params.grandTotalVolume > 0 ? parseFloat(params.grandTotalVolume * multiKpi.incentiveAmount) : 0;
                product[params.propertyName] = product[params.propertyName] ? product[params.propertyName] + amt : amt;
                isOr = false;
                break;
            }
        }
        if (isOr) {
            product[params.propertyName] = product[params.propertyName] ? product[params.propertyName] : 0;
        }
    }
    return product;
}

function validateTargetConditon(targetPercent, achieved) {
    achieved = achieved ? achieved : 0;
    targetPercent = targetPercent ? targetPercent : '';
    var hasRange = targetPercent.includes('to');
    var func;
    if (hasRange) {
        var range1 = targetPercent.substring(0, targetPercent.indexOf("to"));
        var range2 = targetPercent.substring(targetPercent.indexOf("to") + 2, targetPercent.length);
        func = "return " + achieved.toString() + range1 + "&&" + achieved.toString() + range2;
    } else {
        func = "return " + achieved.toString() + targetPercent;
    }
    return Function(func)();
}

function getPayoutAmount(product, kpiTarget, retailFields) {
    var subProducts = product.DI_SubCategory_Target_and_Achievements__r;
    var subProductsPayout = kpiTarget.productPayouts;
    var payoutAmt = 0;
    subProducts?.forEach(subProd => {
        let volume = subProd[retailFields.retail] ? subProd[retailFields.retail] : 0;
        let twoWD = subProd[retailFields.twoWD] ? subProd[retailFields.twoWD] : 0;
        let fourWD = subProd[retailFields.fourWD] ? subProd[retailFields.fourWD] : 0;
        if (volume) {
            let subProdPayout = subProductsPayout?.length > 0 ? subProductsPayout.find((kpIsbProd) => kpIsbProd.subProductId == subProd.Sub_Category__c) : null;
            if (subProdPayout) {
                if (subProdPayout.variesByRegion && subProdPayout.regionPayout?.length > 0) {
                    let regPay = subProdPayout.regionPayout.find((regionPay) => regionPay.region == dealerRegion);
                    if(subProdPayout.variesBy4WD) {
                        payoutAmt += regPay?.twoWDPayoutAmount ? twoWD * regPay.twoWDPayoutAmount : 0;
                        payoutAmt += regPay?.fourWDPayoutAmount ? fourWD * regPay.fourWDPayoutAmount : 0;
                    } else {
                        payoutAmt += regPay?.amount ? volume * regPay.amount : 0;
                    }
                } else {
                    if(subProdPayout.variesBy4WD) {
                        payoutAmt += subProdPayout?.twoWDPayoutAmount ? twoWD * subProdPayout.twoWDPayoutAmount : 0;
                        payoutAmt += subProdPayout?.fourWDPayoutAmount ? fourWD * subProdPayout.fourWDPayoutAmount : 0;
                    } else {
                        payoutAmt += subProdPayout?.payoutAmount ? volume * subProdPayout.payoutAmount : 0;
                    }
                }
            }
        } 
    });
    return payoutAmt;
}

function extractTargetNumValue(targetPercentValue, isStart) {
    var hasRange = targetPercentValue.includes('to');
    let target;
    if(isStart) {
        target = hasRange ? targetPercentValue.substring(0, targetPercentValue.indexOf("to")) : targetPercentValue;
    } else {
        target = hasRange ? targetPercentValue.substring(targetPercentValue.indexOf("to") + 2, targetPercentValue.length) : null;
    }
    if(target) {
        if (target.includes('<') && !target.includes('=')) {
            return parseInt(target.match(/\d+/g)) - 1;
        } else if (target.includes('>') && !target.includes('=')) {
            return parseInt(target.match(/\d+/g)) + 1;
        }
        else {
            return parseInt(target.match(/\d+/g))
        }
    } else {
        return target;
    }
}

function updateActualRetail(oppsAndRetails) {
    var dealersMap = oppsAndRetails['dealersMap'];
    var dealerList = oppsAndRetails['dealerList'];
    var prodTargetsMap = oppsAndRetails['prodTargetsMap'];
    var wonOpportunities = oppsAndRetails['wonOpps'];
    var lostOpportunities = oppsAndRetails['lostOpps'];
    var currlostOpportunities = oppsAndRetails['currentlostOpps'];
    var wonOrdersList = oppsAndRetails['wonOrders'];
    var lostOrdersList = oppsAndRetails['lostOrders'];
    var currlostOrdersList = oppsAndRetails['currentlostOrders'];
    var wonOrderItems = oppsAndRetails['wonOrderItems'];
    var lostOrderItems = oppsAndRetails['lostOrderItems'];
    var currlostOrderItems = oppsAndRetails['currentlostOrderItems'];

    var updatedDealers = [];
    var updatedProdTargets = [];
    var updatedSubTargets = [];

    for(let i = 0; i < dealerList.length; i++) {
        let productTargets = prodTargetsMap[dealerList[i].Id];
        let wonOpps = wonOpportunities[dealerList[i].Dealer_Account__c];
        let lostOpps = lostOpportunities[dealerList[i].Dealer_Account__c];
        let currlostOpps = currlostOpportunities[dealerList[i].Dealer_Account__c];

        let subTargetsMap = {};
        for(let j = 0; j < wonOpps?.length; j++) {
            let prodTarget = productTargets[wonOpps[j].Product_Category__c];
            for(let k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.length; k++) {
                let subTargetId = prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Id;
                let subMap = {};
                let subTarget = {};
                if(subTargetsMap.hasOwnProperty(wonOpps[j].Product_Category__c)) {
                    subMap = subTargetsMap[wonOpps[j].Product_Category__c];
                    if(subMap.hasOwnProperty(subTargetId)) {
                        subTarget = subMap[subTargetId];
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
                    subMap[subTargetId] = {};
                }
                if(prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Sub_Category__r?.Name == wonOpps[j].Product_Sub_Category__c) {
                    let wonOrder = wonOrdersList[wonOpps[j]?.Id];
                    let wonOrderItem = wonOrderItems[wonOrder];
                    if(wonOrderItem) {
                        if(wonOpps[j].Product_Category__c == 'BHL') {
                            if(wonOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.FourWD_Retail_Achieved__c += 1;
                            } else if(!wonOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.TwoWD_Retail_Achieved__c += 1;
                            }
                            subTarget.SubCategory_Retail_Achieved__c = subTarget.TwoWD_Retail_Achieved__c + subTarget.FourWD_Retail_Achieved__c;
                        } else {
                            subTarget.SubCategory_Retail_Achieved__c += 1;
                        }
                    }
                    subMap[subTargetId] = subTarget;
                    subTargetsMap[wonOpps[j].Product_Category__c] = subMap;
                    break;
                } else {
                    subMap[subTargetId] = subTarget;
                    subTargetsMap[wonOpps[j].Product_Category__c] = subMap;
                }
            }
        }
        for(let x = 0; x < lostOpps?.length; x++) {
            let prodTarget = productTargets[lostOpps[x].Product_Category__c];
            for(let k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.length; k++) {
                let subTargetId = prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Id;
                let subMap = {};
                let subTarget = {};
                if(subTargetsMap.hasOwnProperty(lostOpps[x].Product_Category__c)) {
                    subMap = subTargetsMap[lostOpps[x].Product_Category__c];
                    if(subMap.hasOwnProperty(subTargetId)) {
                        subTarget = subMap[subTargetId];
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
                }
                if(prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Sub_Category__r?.Name == lostOpps[x].Product_Sub_Category__c) {
                    let lostOrder = lostOrdersList[lostOpps[x]?.Id];
                    let lostOrderItem = lostOrderItems[lostOrder];
                    if(lostOrderItem) {
                        if(lostOpps[x].Product_Category__c == 'BHL') {
                            if(lostOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.FourWD_Retail_Achieved__c = subTarget?.FourWD_Retail_Achieved__c && subTarget.FourWD_Retail_Achieved__c > 0 ? subTarget.FourWD_Retail_Achieved__c - 1 : 0;
                            } else if(!lostOrderItem?.Product2?.Is_4WD__c) {
                                subTarget.TwoWD_Retail_Achieved__c = subTarget?.TwoWD_Retail_Achieved__c && subTarget.TwoWD_Retail_Achieved__c > 0 ? subTarget.TwoWD_Retail_Achieved__c - 1 : 0;
                            }
                            subTarget.SubCategory_Retail_Achieved__c = subTarget.TwoWD_Retail_Achieved__c + subTarget.FourWD_Retail_Achieved__c;
                        } else {
                            subTarget.SubCategory_Retail_Achieved__c = subTarget?.SubCategory_Retail_Achieved__c && subTarget.SubCategory_Retail_Achieved__c > 0 ? subTarget.SubCategory_Retail_Achieved__c - 1 : 0;
                        }
                    }
                    subMap[subTargetId] = subTarget;
                    subTargetsMap[lostOpps[x].Product_Category__c] = subMap;
                    break;
                } else {
                    subMap[subTargetId] = subTarget;
                    subTargetsMap[lostOpps[x].Product_Category__c] = subMap;
                }
            }
        }

        for(let x = 0; x < currlostOpps?.length; x++) {
            let prodTarget = productTargets[currlostOpps[x].Product_Category__c];
            for(let k = 0; k < prodTarget?.DI_SubCategory_Target_and_Achievements__r?.length; k++) {
                if(prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Sub_Category__r?.Name == currlostOpps[x].Product_Sub_Category__c) {
                    let subTargetId = prodTarget.DI_SubCategory_Target_and_Achievements__r[k].Id;
                    let subMap = {};
                    let subTarget = {};
                    if(subTargetsMap.hasOwnProperty(currlostOpps[x].Product_Category__c)) {
                        subMap = subTargetsMap[currlostOpps[x].Product_Category__c];
                        if(subMap.hasOwnProperty(subTargetId)) {
                            subTarget = subMap[subTargetId];
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
                        subMap[subTargetId] = {};
                    }
                    subMap[subTargetId] = subTarget;
                    subTargetsMap[currlostOpps[x].Product_Category__c] = subMap;
                    break;
                }
            }
        }

        let dealerInc = dealerList[i];
        dealerInc.Total_Retail_Achieved__c = 0;
        let isSubExist = false;

        for(const key in productTargets) {
            let prodTarget = productTargets[key];
            if(subTargetsMap.hasOwnProperty(key)) {
                prodTarget.Total_Retail_2WD_Achieved__c = 0;
                prodTarget.Total_Retail_4WD_Achieved__c = 0;
                prodTarget.Total_Retail_Achieved__c = 0;
                let subTargets = Object.values(subTargetsMap[key]);
                for(let m = 0; m < subTargets?.length; m++) {
                    prodTarget.Total_Retail_2WD_Achieved__c += subTargets[m].TwoWD_Retail_Achieved__c;
                    prodTarget.Total_Retail_4WD_Achieved__c += subTargets[m].FourWD_Retail_Achieved__c;
                    prodTarget.Total_Retail_Achieved__c += subTargets[m].SubCategory_Retail_Achieved__c;
                    updatedSubTargets.push(subTargets[m]);
                }
                if(subTargets?.length > 0) {
                    isSubExist = true;
                    updatedProdTargets.push(prodTarget);
                }
                dealerInc.Total_Retail_Achieved__c += prodTarget.Total_Retail_Achieved__c;
            } else {
                dealerInc.Total_Retail_Achieved__c += prodTarget.Total_Retail_Achieved__c;
            }
        }
        if(isSubExist) {
            updatedDealers.push(dealerInc);
        }
    }
    let updatedList = {
        productList : updatedProdTargets,
        dealerList : updatedDealers,
        subTargetList : updatedSubTargets,
        kpiAchievements : []
    };
    return updatedList;
}