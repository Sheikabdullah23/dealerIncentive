import getDealerAndProductTargetInfo from '@salesforce/apex/JCBDealerIncentiveController.getDealerAndProductTargetInfo';
import getProductsAndSubCategories from '@salesforce/apex/dIFormulaController.getProductsAndSubCategories';
import getUserDetails from '@salesforce/apex/JCBDealerIncentiveController.getUserDetails';
import getCalcPicklistValues from '@salesforce/apex/dIFormulaController.getCalcPicklistValues';
import jcbIcon from '@salesforce/resourceUrl/JCB_Logo';
import { LightningElement, track } from 'lwc';

export default class DIIncentiveCalculatorHelpPage extends LightningElement {
    @track productDetails = [];
    @track yearOptions = [];
    @track monthOptions = [];
    @track cloneMonthYear = {};
    @track year;
    @track month;
    @track monthToSelect;
    @track accountDet;
    @track dealerRegion;
    @track prodAndAcheive;
    @track kpiTarget = [];
    @track additional = {};
    @track addKpiDetails = [];
    @track growthKpiDetails = [];
    @track multiKpiTarget;
    @track salesTivKpi = [];
    @track item;
    @track dealerTarget;
    navSpinner = true;
    subCategoryProducts = [];
    newproductListData = [];
    icon = jcbIcon;

    connectedCallback() {
        this.navSpinner = true;
        this.getProductCategories(); //To get Product Categories.
        this.getUserDetails();
        const year = this.getYearAndMonth();
        this.getYears(year);
        if (this.year && this.month) {
            this.getSubProductInputs();
        }

    }

    getProductCategories() {
        getProductsAndSubCategories().then(result => {
            this.products = result;
        }).catch(error => {
            console.log('Error', error);
        });
    }

    getYearAndMonth() {
        const url = document.URL;
        const queryString = url.split('?')[1];
        const decodedQueryString = decodeURIComponent(queryString);
        // const params = decodedQueryString.split('/');
        const params = decodedQueryString.split('&');
        const paramsObj = {};
        params.forEach(param => {
            const [key, value] = param.split('=');
            paramsObj[key] = value;
        });
        this.monthToSelect = paramsObj['month'];
        return paramsObj['year'];
    }

    getYears(years) {
        this.navSpinner = false;
        getCalcPicklistValues().then(res => {
            if (res) {
                this.cloneMonthYear = res;
                let cloneYearOptions = Object.keys(this.cloneMonthYear);
                this.yearOptions = [];
                for (let i = 0; i < cloneYearOptions.length; i++) {
                    let year = (cloneYearOptions[i]).toString();
                    this.yearOptions.push({ label: year, value: year });
                }
            }
            for (const val of this.yearOptions) {
                if (val.value == years) {
                    this.year = years;
                }
            }
            this.getMonths(this.monthToSelect);
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    getMonths(months) {
        if (this.cloneMonthYear.hasOwnProperty(this.year)) {
            this.monthOptions = this.cloneMonthYear[this.year];
            this.monthOptions = this.monthOptions.map(month => {
                return { label: month, value: month };
            });
        }
        for (const val of this.monthOptions) {
            if (val.value == months) {
                this.month = months;
                this.getSubProductInputs();
            }
        }
    }

    handleChange(event) {
        if (event.target.name == 'year') {
            this.year = event.target.value;
            if (this.cloneMonthYear.hasOwnProperty(this.year)) {
                this.monthOptions = this.cloneMonthYear[this.year];
                this.monthOptions = this.monthOptions.map(month => {
                    return { label: month, value: month };
                });
            }
        } else if (event.target.name == 'month') {
            this.month = event.target.value;
            this.navSpinner = true;
        }
        if (this.year && this.month) {
            this.getSubProductInputs();
        }
    }

    getUserDetails() {
        getUserDetails({}).then(res => {
            if (res && res.Account) {
                this.accountDet = res.Account;
                this.dealerRegion = res.Account.India_Zone__c;
            } else {
                this.showToast('You have no access for Incentive Calculator Page', 'info');
            }
        }).catch(error => {
            console.log('Error: ', error);
        });
    }

    getSubProductInputs() {
        getDealerAndProductTargetInfo({
            month: this.month, year: this.year, dealerId: this.accountDet.Id
        })
            .then(result => {
                this.productDetails = [];
                this.kpiTarget = [];
                this.addKpiDetails = [];
                this.growthKpiDetails = [];
                this.salesTivKpi = [];
                this.subCategoryProducts = [];
                this.newproductListData = [];
                this.navSpinner = true;
                let productTarget = result['productTargetInfo'];
                this.dealerTarget = result['dealerTargetInfo'];
                this.multiKpiTarget = result['multiKpitargetInfo'];
                let allProductData = [];
                this.prodAndAcheive = this.dealerTarget['productTargetsAndAchievements'];
                let addIncentive = [];
                console.log('result', result);
                console.log('productTarget', productTarget);
                console.log('dealerTarget ', this.dealerTarget);
                console.log('multiKpiTarget', this.multiKpiTarget);
                console.log('prodAndAcheive', this.prodAndAcheive);
                for (let i = 0; i < productTarget.length; i++) {

                    if (productTarget[i].type == 'KPI Target') {
                        let cateSlabs = [];
                        if (!productTarget[i].hasSlabs) {
                            cateSlabs.push({ slabRange: productTarget[i].target });
                        }
                        else {
                            cateSlabs = productTarget[i]?.slabInfo.filter(slab => slab.slabType != 'Salesperson Incentive' && slab.slabType != 'Total Volume Industry Incentive');
                            let slno = 0;
                            for (let i = 0; i < cateSlabs?.length; i++) {
                                cateSlabs[i].slno = slno = slno + 1;
                                if (cateSlabs[i].payoutMode == 'Percent') {
                                    cateSlabs[i].isPercent = true;
                                    cateSlabs[i].isProrata = false;
                                    if (cateSlabs[i].payoutPercentage == '0') {
                                        cateSlabs[i].example = "If a dealer achieves " + cateSlabs[i].slabRange + ', they are not eligible for any Incentive payouts .';
                                    } else {
                                        cateSlabs[i].example = "If a dealer achieves " + cateSlabs[i].slabRange + ', they will be eligible for ' + cateSlabs[i].payoutPercentage + '% of Incentive payout.';
                                    }
                                } else if (cateSlabs[i].payoutMode == 'proRata') {
                                    cateSlabs[i].example = "If a dealer achieves " + cateSlabs[i].slabRange + ', they will be eligible to receive the percentage that the dealer has achieved as an incentive payout.';
                                    cateSlabs[i].isPercent = true;
                                    cateSlabs[i].isProrata = true;
                                } else {
                                    cateSlabs[i].example = "If a dealer achieves " + cateSlabs[i].slabRange + ', they will be eligible for Rs.' + cateSlabs[i].amount + ' as Incentive payout.';
                                    cateSlabs[i].isPercent = false;
                                    cateSlabs[i].isProrata = false;
                                }
                            }
                        }
                        let subCatData = [];
                        let totalVolIncentive = 0;
                        for (let j = 0; j < productTarget[i].productPayouts.length; j++) {

                            subCatData.push(productTarget[i].productPayouts[j]);
                        }
                        allProductData.push({ label: productTarget[i].productKPI.productName, type: productTarget[i].type, category: productTarget[i].productKPI.kpiName, sublistData: subCatData, prodSlabList: cateSlabs, totalKPIPayout: totalVolIncentive, kpiVisibility: productTarget[i].productKPI.kpiVisibility });

                        //storing salesman and TIV incentive
                        if (productTarget[i].isSalesmanIncentive || productTarget[i].isIndustryIncentive) {
                            let slabinfo = [];
                            for (let j = 0; j < productTarget[i].slabInfo.length; j++) {
                                if (productTarget[i].slabInfo[j].slabType === "Salesperson Incentive" || productTarget[i].slabInfo[j].slabType === "Total Volume Industry Incentive") {
                                    slabinfo.push(productTarget[i].slabInfo[j]);
                                }
                            }
                            this.salesTivKpi.push({ isIndustryIncentive: productTarget[i].isIndustryIncentive, isSalesmanIncentive: productTarget[i].isSalesmanIncentive, productName: productTarget[i].productKPI.productName, kpiName: productTarget[i].productKPI.kpiName + ' Incentive', salesPersonTarget: productTarget[i].salesPersonTarget, slabInfo: slabinfo, productKPI: productTarget[i].productKPI, productPayouts: productTarget[i].productPayouts, year: productTarget[i].year, month: productTarget[i].month });
                        }

                    }
                    else {
                        //storing addtional Incentive Target
                        addIncentive.push(productTarget[i]);
                    }
                }
                let allsplitData = [];
                for (let i = 0; i < allProductData.length; i++) {
                    if (allsplitData.length == 0) {
                        let newArray = [];
                        newArray.push({ label: allProductData[i].category + ' Incentive', subcategoryDataList: allProductData[i].sublistData, cateSlabsListData: allProductData[i].prodSlabList, totalKPIPayout: allProductData[i].totalKPIPayout, kpiVisibility: allProductData[i].kpiVisibility });
                        allsplitData.push({ label: allProductData[i].label, typeList: newArray });
                    }
                    else {
                        let find = true;
                        for (let j = 0; j < allsplitData.length; j++) {
                            if (allProductData[i].label == allsplitData[j].label) {
                                let newArray = [];
                                newArray = allsplitData[j].typeList;
                                newArray.push({ label: allProductData[i].category + ' Incentive', subcategoryDataList: allProductData[i].sublistData, cateSlabsListData: allProductData[i].prodSlabList, totalKPIPayout: allProductData[i].totalKPIPayout, kpiVisibility: allProductData[i].kpiVisibility });
                                allsplitData[j].typeList = newArray;
                                find = false;
                            }
                        }
                        if (find) {
                            let newArray = [];
                            newArray.push({ label: allProductData[i].category + ' Incentive', subcategoryDataList: allProductData[i].sublistData, cateSlabsListData: allProductData[i].prodSlabList, totalKPIPayout: allProductData[i].totalKPIPayout, kpiVisibility: allProductData[i].kpiVisibility });
                            allsplitData.push({ label: allProductData[i].label, typeList: newArray });
                        }
                    }

                }

                for (let i = 0; i < addIncentive.length; i++) {
                    let hasslab;
                    if (addIncentive[i].type == "Additional Incentive Target") {
                        let obj = {};
                        let slabData = [];
                        if (addIncentive[i].hasSlabs) {
                            hasslab = addIncentive[i].hasSlabs;
                            for (let j = 0; j < addIncentive[i].slabInfo.length; j++) {
                                slabData.push({ slabRange: addIncentive[i].slabInfo[j].slabRange, Amount: addIncentive[i].slabInfo[j].amount });
                            }
                        }
                        else {
                            hasslab = addIncentive[i].hasSlabs;
                            slabData.push({ slabRange: addIncentive[i].target, amount: addIncentive[i].incentiveAmount });

                        }
                        obj = { label: addIncentive[i].productKPI.kpiName, hasSlab: hasslab, slabinfo: slabData, productLabel: addIncentive[i].productKPI.productName, Month: addIncentive[i].month, Year: addIncentive[i].year, typelist: addIncentive[i].productKPI };

                        this.addKpiDetails.push(obj);
                    }
                    else if (addIncentive[i].type == "Growth Additional Incentive") {
                        let obj = {};
                        let slabData = [];
                        if (addIncentive[i].hasSlabs) {
                            hasslab = addIncentive[i].hasSlabs;
                            for (let j = 0; j < addIncentive[i].slabInfo.length; j++) {
                                slabData.push({ slabRange: addIncentive[i].slabInfo[j].slabRange, Amount: addIncentive[i].slabInfo[j].amount, growthRange: addIncentive[i].slabInfo[j].growthRange });
                            }
                        }
                        else {
                            hasslab = addIncentive[i].hasSlabs;
                            slabData.push({ slabRange: addIncentive[i].target, amount: addIncentive[i].incentiveAmount });
                        }
                        obj = { label: addIncentive[i].productKPI.kpiName, hasSlab: hasslab, slabinfo: slabData, productLabel: addIncentive[i].productKPI.productName, Month: addIncentive[i].month, Year: addIncentive[i].year, typelist: addIncentive[i].productKPI, prevYear: addIncentive[i].prevYear, prevMonth: addIncentive[i].prevMonth };
                        this.growthKpiDetails.push(obj);
                    }

                }

                for (let i = 0; i < this.products.length; i++) {
                    for (let j = 0; j < allsplitData.length; j++) {
                        if (this.products[i].Name === allsplitData[j].label) {
                            allsplitData[j].orderNo = this.products[i].Order_No__c;
                        }
                    }
                }
                this.newproductListData = allsplitData.sort((a, b) => a.orderNo - b.orderNo);

                let productlistData = [];
                for (let i = 0; i < allsplitData.length; i++) {
                    let tabClasslist = (i == 0) ? 'slds-vertical-tabs__nav-item slds-is-active' : 'slds-vertical-tabs__nav-item';
                    let contentClassList = (i == 0) ? 'slds-vertical-tabs__content slds-show' : 'slds-vertical-tabs__content slds-hide';
                    productlistData.push({ label: '', productClass: tabClasslist, id: 'slds-vertical-tabs-' + i, navbodyId: 'slds-vertical-tabs-' + i + '__nav', navBarClass: contentClassList, questionAnswer: [] });
                }
                this.productDetails = productlistData;
                this.storeQuestions();
            })
            .catch(error => {
                this.navSpinner = false;
                console.log('Error', error);
            });
    }

    storeQuestions() {
        for (let i = 0; i < this.productDetails.length; i++) {

            this.productDetails[i].label = this.newproductListData[i].label;
            let prodSubData = this.newproductListData[i].typeList;
            let questions = [];
            for (let j = 0; j < prodSubData.length; j++) {
                let subProductList = [];
                subProductList = prodSubData[j].subcategoryDataList;
                let targetlen = (prodSubData[j].cateSlabsListData.length > 1) ? false : true;
                if (prodSubData[j].kpiVisibility.includes('KPI Target')) {
                    questions.push({ label: prodSubData[j].label, answer: '', isQuestion: true, isAnswer: false, isBack: false, subProductListDetails: subProductList, slabsData: prodSubData[j].cateSlabsListData, isTarget: targetlen, kpiVisibility: prodSubData[j].kpiVisibility, isExample: false })
                }
            }

            for (let i = 0; i < questions.length; i++) {
                if (questions[i].slabsData.length > 1) {
                    for (let j = 0; j < questions[i].slabsData.length; j++) {
                        if (questions[i].slabsData[1].payoutMode === 'proRata') {
                            questions[i].exampleText = ' If dealer has achieved ' + questions[i].slabsData[1].slabRange + '% for the month Achieved percentage of incentive amount from total Volume incentive shall be eligible';
                            questions[i].isExample = true;
                        }
                        else if (questions[i].slabsData[1].payoutMode === 'Percent') {
                            questions[i].exampleText = ' If dealer has achieved ' + questions[i].slabsData[1].slabRange + '% for the month ' + questions[i].slabsData[1].payoutPercentage + '%  of incentive amount from total ' + questions[i].label + ' shall be eligible';
                            questions[i].isExample = true;
                        }
                        else if (questions[i].slabsData[1].payoutMode === 'Amt') {
                            questions[i].exampleText = ' If dealer has achieved ' + questions[i].slabsData[1].slabRange + '% for the month incentive of INR ' + questions[i].slabsData[1].amount + ' X all machine retails nos shall be eligible';
                            questions[i].isExample = true;
                        }
                    }

                }
            }
            this.productDetails[i].questionAnswer = questions;
            this.productDetails[i].isActual = false;
            this.productDetails[i] = this.setupSubProdPayouts(this.productDetails[i]);
            this.productDetails[i] = this.tableData(this.productDetails[i]);
            this.productDetails[i] = this.storeAddKpi(this.productDetails[i]);
            this.productDetails[i] = this.storeGrowthKpi(this.productDetails[i]);
            this.productDetails[i] = this.storeMultiKpi(this.productDetails[i]);
            this.productDetails[i] = this.storeSalesTiv(this.productDetails[i]);
            this.productDetails[i] = this.storeRetailTargets(this.productDetails[i]);
            this.productDetails[i] = this.storeActualAchievement(this.productDetails[i]);
            this.productDetails[i].isActive = i == 0 ? true : false;

        }

        console.log('ProductDetails:', this.productDetails);
        this.navSpinner = false;
    }


    storeRetailTargets(product) {
        for(let i = 0; i < product.subProductData.length; i++){
            for(let j = 0; j < this.prodAndAcheive.length; j++){
                for(let k = 0; k< this.prodAndAcheive[j].subTargetAndAchievement.length; k++){
                    if(product.label==this.prodAndAcheive[j].productName && product.subProductData[i].subProd==this.prodAndAcheive[j].subTargetAndAchievement[k].subProductName ){
                        product.subProductData[i].subCategoryRetailTarget=this.prodAndAcheive[j].subTargetAndAchievement[k].subCategoryRetailTarget;
                        product.subProductData[i].isRetailTarget=true;
                    }
                }
            }
        }
        return product;
    }

    storeActualAchievement(product) {
        for (let i = 0; i < this.dealerTarget.productTargetsAndAchievements.length; i++) {
            if (product.label == this.dealerTarget.productTargetsAndAchievements[i].productName) {
                let array = [];
                let obj = {};
                for (let j = 0; j < this.dealerTarget.productTargetsAndAchievements[i].productKPIAndAchievements.length; j++) {
                    let num = parseFloat(this.dealerTarget.productTargetsAndAchievements[i].productKPIAndAchievements[j].achievedKPIPerncentage).toFixed(2);
                    array.push({ kpiName: this.dealerTarget.productTargetsAndAchievements[i].productKPIAndAchievements[j].productKPI.kpiName, achievedKPIPerncentage: this.dealerTarget.productTargetsAndAchievements[i].productKPIAndAchievements[j].achievedKPIPerncentage?num:0 });
                }
                obj = { productName: this.dealerTarget.productTargetsAndAchievements[i].productName, actualAchieve: array, dealerName: this.dealerTarget.dealerName, month: this.dealerTarget.month, year: this.dealerTarget.year, dealerRegion: this.dealerTarget.dealerRegion};
                product.isActual=true;
                product.actualAchievement = obj;
            }
        }
        return product;
    }


    setupSubProdPayouts(product) {
        try {
            for (let i = 0; i < product.questionAnswer.length; i++) {
                let subProdList = [];
                product.questionAnswer[i].variesBy4WD = product.questionAnswer[i].subProductListDetails[0].variesBy4WD ? true : false;
                product.questionAnswer[i].variesByRegion = product.questionAnswer[i].subProductListDetails[0].variesByRegion ? true : false;
                product.questionAnswer[i].variesByBoth = product.questionAnswer[i].subProductListDetails[0].variesBy4WD && product.questionAnswer[i].subProductListDetails[0].variesByRegion ? true : false;
                for (let j = 0; j < product.questionAnswer[i].subProductListDetails.length; j++) {
                    let temp = product.questionAnswer[i].subProductListDetails[j];
                    let subProd = {};
                    subProd.label = temp.subProductName;
                    let reg = temp.regionPayout.find(reg => reg.region == this.dealerRegion)
                    if (product.questionAnswer[i].variesByBoth) {
                        subProd.twoWDPayoutAmount = reg?.twoWDPayoutAmount ? reg.twoWDPayoutAmount : 0 || 0;
                        subProd.fourWDPayoutAmount = reg?.fourWDPayoutAmount ? reg.fourWDPayoutAmount : 0 || 0;
                    } else if (product.questionAnswer[i].variesBy4WD) {
                        subProd.twoWDPayoutAmount = temp?.twoWDPayoutAmount ? temp.twoWDPayoutAmount : 0 || 0;
                        subProd.fourWDPayoutAmount = temp?.fourWDPayoutAmount ? temp.fourWDPayoutAmount : 0 || 0;
                    } else if (product.questionAnswer[i].variesByRegion) {
                        subProd.amount = reg?.amount ? reg.amount : 0 || 0;

                    } else {
                        subProd.amount = temp?.payoutAmount ? temp.payoutAmount : 0 || 0;
                    }
                    subProdList.push(subProd);
                    product.questionAnswer[i].subProductPayout = subProdList;
                    product.dataId = `payout-config-${product.label}`;
                }
            }
        } catch (error) {
            console.log('Error', error);
        }
        return product;
    }

    tableData(product) {
        let subProdList = [];
        for (let i = 0; i < product.questionAnswer[0].subProductPayout.length; i++) {
            subProdList.push({ subProd: product.questionAnswer[0].subProductPayout[i].label, productName: product.label,isRetailTarget:false});
        }
        for (let k = 0; k < subProdList.length; k++) {
            let array = [];
            for (let i = 0; i < product.questionAnswer.length; i++) {
                for (let j = 0; j < product.questionAnswer[i].subProductPayout.length; j++) {
                    if (product.questionAnswer[i].subProductPayout[j].label === subProdList[k].subProd) {
                        let subProd = {};
                        let temp = product.questionAnswer[i].subProductPayout[j];
                        subProd.kpiName = product.questionAnswer[i].label;
                        subProd.productName = product.label;
                        subProd.name = temp.label;
                        subProd.variesByTrue = (product?.questionAnswer[i]?.variesBy4WD || product?.questionAnswer[i]?.variesByBoth) ? true : false;
                        if (product.questionAnswer[i].variesBy4WD || product.questionAnswer[i].variesByBoth) {
                            subProd.fourWDPayoutAmount = temp?.fourWDPayoutAmount ? temp.fourWDPayoutAmount : 0 || 0;
                            subProd.twoWDPayoutAmount = temp?.twoWDPayoutAmount ? temp.twoWDPayoutAmount : 0 || 0;
                        } else {
                            subProd.amount = temp?.amount ? temp?.amount : 0 || 0;
                        }
                        array.push(subProd);
                    }
                }
            }
            subProdList[k].payout = array;
        }
        product.subProductData = subProdList;
        return product;
    }

    storeAddKpi(product) {
        let temp = [];
        for (let j = 0; j < this.addKpiDetails.length; j++) {
            if (product.label === this.addKpiDetails[j].productLabel) {
                temp.push(this.addKpiDetails[j] ? this.addKpiDetails[j] : null);
            }
        }
        for (let k = 0; k < temp.length; k++) {
            for (let i = 0; i < temp[k].slabinfo.length; i++) {

                temp[k].slabinfo[i].id = i + 1;
            }
        }
        product.additional = { label: product.label, addKpidetail: temp, isAdditional: temp.length > 0 ? true : false, dataId: `additional-incentive-${product.label}` };
        return product;
    }

    storeGrowthKpi(product) {
        let temp = [];
        for (let j = 0; j < this.growthKpiDetails.length; j++) {
            if (product.label === this.growthKpiDetails[j].productLabel) {
                temp.push(this.growthKpiDetails[j] ? this.growthKpiDetails[j] : null);
            }
        }
        for (let k = 0; k < temp.length; k++) {
            for (let i = 0; i < temp[k].slabinfo.length; i++) {

                temp[k].slabinfo[i].id = i + 1;
            }
        }
        product.growth = { label: product.label, growthKpidetail: temp, isGrowth: temp.length > 0 ? true : false, dataId: `growth-incentive-${product.label}` };
        return product;
    }
    storeMultiKpi(product) {
        for (let i = 0; i < this.multiKpiTarget.length; i++) {
            for (let j = 0; j < this.multiKpiTarget[i].multiKpi.length; j++) {

                this.multiKpiTarget[i].multiKpi[j].id = j + 1;
            }
        }

        for (let j = 0; j < this.multiKpiTarget.length; j++) {
            if (product.label === this.multiKpiTarget[j].productCategory.name) {

                product.multiKpi = { label: product.label, dataId: `multiple-kpi-${product.label}`, multiKpidetails: this.multiKpiTarget[j].multiKpi, year: this.multiKpiTarget[j].year, month: this.multiKpiTarget[j].month, productCategory: this.multiKpiTarget[j].productCategory };
            }
        }
        return product;
    }

    storeSalesTiv(product) {

        for (let i = 0; i < this.salesTivKpi.length; i++) {

            if (this.salesTivKpi[i].isIndustryIncentive && this.salesTivKpi[i].isSalesmanIncentive) {
                let m = 1;
                let n = 1
                for (let j = 0; j < this.salesTivKpi[i].slabInfo.length; j++) {

                    if (this.salesTivKpi[i].slabInfo[j].slabType === 'Total Volume Industry Incentive') {

                        this.salesTivKpi[i].slabInfo[j].id = m++;
                    }
                    else if (this.salesTivKpi[i].slabInfo[j].slabType === 'Salesperson Incentive') {
                        this.salesTivKpi[i].slabInfo[j].id = n++;
                    }
                }
            }
            else {
                let id = 1;
                for (let j = 0; j < this.salesTivKpi[i].slabInfo.length; j++) {

                    this.salesTivKpi[i].slabInfo[j].id = id++;
                }
            }
        }

        for (let i = 0; i < this.salesTivKpi.length; i++) {

            for (let k = 0; k < this.salesTivKpi[i].slabInfo.length; k++) {
                this.salesTivKpi[i].slabInfo[k].isSales = this.salesTivKpi[i].slabInfo[k].slabType == 'Salesperson Incentive' ? true : false;
            }
            if (product.label === this.salesTivKpi[i].productName) {
                for (let j = 0; j < product.questionAnswer.length; j++) {

                    if (this.salesTivKpi[i].kpiName === product.questionAnswer[j].label && this.salesTivKpi[i].isIndustryIncentive && this.salesTivKpi[i].isSalesmanIncentive) {


                        product.questionAnswer[j].tivSalesIncentive = this.salesTivKpi[i];
                        product.questionAnswer[j].isIndustryIncentive = true;
                        product.questionAnswer[j].isSalesmanIncentive = true;

                    }
                    else if (this.salesTivKpi[i].kpiName === product.questionAnswer[j].label && this.salesTivKpi[i].isIndustryIncentive) {
                        product.questionAnswer[j].tivSalesIncentive = this.salesTivKpi[i];
                        product.questionAnswer[j].isIndustryIncentive = true;
                        product.questionAnswer[j].isSalesmanIncentive = false;
                    }
                    else if (this.salesTivKpi[i].kpiName === product.questionAnswer[j].label && this.salesTivKpi[i].isSalesmanIncentive) {
                        product.questionAnswer[j].tivSalesIncentive = this.salesTivKpi[i];
                        product.questionAnswer[j].isSalesmanIncentive = true;
                        product.questionAnswer[j].isIndustryIncentive = false;
                    }
                }
            }
        }
        return product;
    }

    handleChangeProducts(event) {
        try {
            this.navSpinner = true;
            for (let i = 0; i < this.productDetails.length; i++) {
                if (event.target.dataset.id == i) {
                    this.productDetails[i].productClass = 'slds-vertical-tabs__nav-item slds-is-active';
                    this.productDetails[i].navBarClass = 'slds-vertical-tabs__content slds-show';
                }
                else {
                    this.productDetails[i].productClass = 'slds-vertical-tabs__nav-item';
                    this.productDetails[i].navBarClass = 'slds-vertical-tabs__content slds-hide';
                }
                for (let j = 0; j < this.productDetails[i].questionAnswer.length; j++) {
                    this.productDetails[i].questionAnswer[j].isQuestion = true;
                    this.productDetails[i].questionAnswer[j].isBack = false;
                    this.productDetails[i].questionAnswer[j].isAnswer = false;
                }
                this.productDetails[i].isActive = this.productDetails[i].label == event.target.dataset.name ? true : false;
            }
            this.navSpinner = false;


        } catch (error) {
            console.log('Error', error);
            this.navSpinner = false;
        }
    }

    // handlePDF() {
    //     window.print();
    // }
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    handleAdditionalNavigate() {
        this.item = this.productDetails.find(data => data.isActive ? data.label : '');
        const additionalIncentiveSection = this.template.querySelector(`[data-id="additional-incentive-${this.item.label}"]`);
        if (additionalIncentiveSection) {
            const sectionTop = additionalIncentiveSection.getBoundingClientRect().top + window.scrollY;
            const offset = 75;
            window.scrollTo({
                top: sectionTop - offset,
                behavior: 'smooth'
            });
        }
    }
    handleGrowthNavigate() {
        this.item = this.productDetails.find(data => data.isActive ? data.label : '');
        const growthAdditional = this.template.querySelector(`[data-id="growth-incentive-${this.item.label}"]`);
        if (growthAdditional) {
            const sectionTop = growthAdditional.getBoundingClientRect().top + window.scrollY;
            const offset = 75;
            window.scrollTo({
                top: sectionTop - offset,
                behavior: 'smooth'
            });
        }
    }

    handleMultipleKpiNavigate() {
        this.item = this.productDetails.find(data => data.isActive ? data.label : '');
        const multipleKpi = this.template.querySelector(`[data-id="multiple-kpi-${this.item.label}"]`);
        if (multipleKpi) {
            const sectionTop = multipleKpi.getBoundingClientRect().top + window.scrollY;
            const offset = 75;
            window.scrollTo({
                top: sectionTop - offset,
                behavior: 'smooth'
            });
        }
    }

    handlePayoutNavigate() {
        this.item = this.productDetails.find(data => data.isActive ? data.label : '');
        const payoutConfig = this.template.querySelector(`[data-id="payout-config-${this.item.label}"]`);
        if (payoutConfig) {
            const sectionTop = payoutConfig.getBoundingClientRect().top + window.scrollY;
            const offset = 75;
            window.scrollTo({
                top: sectionTop - offset,
                behavior: 'smooth'
            });
        }
    }

    @track activeSections = [];
    @track activeSectionsGrowth = [];
    @track activeKpiSection = [];
    expandAll() {
        this.activeKpiSection = this.kpiSections();
        this.activeSections = this.additionalSections();
        this.activeSectionsGrowth = this.growthSection();
    }
    collapseAll() {
        this.activeKpiSection = [];
        this.activeSections = [];
        this.activeSectionsGrowth = [];
    }
    kpiSections() {
        for (let i = 0; i < this.productDetails.length; i++) {
            if (this.productDetails[i].isActive) {
                return this.productDetails[i].questionAnswer.map(data => data.label);
            }
        }
    }
    additionalSections() {
        for (let i = 0; i < this.productDetails.length; i++) {
            if (this.productDetails[i].isActive) {
                return this.productDetails[i].additional.addKpidetail.map(data => data.label);
            }
        }
    }
    growthSection() {
        for (let i = 0; i < this.productDetails.length; i++) {
            if (this.productDetails[i].isActive) {
                return this.productDetails[i].growth.growthKpidetail.map(data => data.label)
            }
        }
    }
}