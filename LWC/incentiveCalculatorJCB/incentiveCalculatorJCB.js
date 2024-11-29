import { LightningElement, track, wire } from 'lwc';
import getDealerAndProductTargetInfo from '@salesforce/apex/JCBDealerIncentiveController.getDealerAndProductTargetInfo';
import getProductAndSubProducts from '@salesforce/apex/JCBDealerIncentiveController.getProductAndSubProducts';
import getProductsAndKPI from '@salesforce/apex/JCBDealerIncentiveController.getProductsAndKPI';
import saveIncentiveCalculations from '@salesforce/apex/JCBDealerIncentiveController.saveIncentiveCalculations';
import getUserDetails from '@salesforce/apex/JCBDealerIncentiveController.getUserDetails';
import getCalcPicklistValues from '@salesforce/apex/dIFormulaController.getCalcPicklistValues';
import maxPercentVal from '@salesforce/label/c.DIMaxPercentageValue';
import JCBIcon from '@salesforce/resourceUrl/JCBIcon';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import imageZip from '@salesforce/resourceUrl/images';
import getPdfcontent from '@salesforce/apex/IncentivePayoutReportController.getPdfcontent';
import deleteContentDocuments from '@salesforce/apex/IncentivePayoutReportController.deleteContentDocuments';
import { calculateMaximizeEarnings, calculateTotalProdEarnings, extractTargetNumValue, validateTargetConditon, calculateEarningsVolumeAmt, calculateEarningsAmount, getMinMaxAmount } from 'c/jCBIncentiveHelper';

export default class JCBIncentiveCalculator extends LightningElement {
    @track isLoading = false;
    @track productCategory = 'BHL';
    @track monthOptions = [];
    @track enableCalculator = false;
    @track selectedProduct = {}; //store's current selected product retail and Kpipayout info
    @track productsAndPayout = new Map(); //store's all the available products and its payoutInfo
    @track calculatedProducts = [];
    @track products = [];
    @track isExpand = false;
    @track yearOptions;
    @track currentQRetail;
    @track prevPayout;
    @track year;
    @track prevYear;
    @track month;
    @track showSubCategory = true;
    @track jcbIcon = JCBIcon + '#jcb';
    @track prodAndKpIData;//variable to store All products and its Applicable KPI Info
    @track productAndSubProducts;//variable to store All products and its subproduct Info
    @track dealerRegion;
    @track maxPercent = maxPercentVal;
    //below Variable holds the targets and formula's Informations of all products
    productKpiTargetInfo;
    productKpiPayoutInfo;
    productVolumeTargetInfo;
    product;
    // below variable holds the Additional Incentive formula's Information of all products
    @track addKPITargetAndPayout = [];
    @track addGrandTotalPayout = 0;
    @track isAddIncentive = false;
    addkpiTargetInfo;
    growthKPITargetInfo;
    ceTargetinfo;
    addProdPayoutInfo;
    selectedAddKpiTargets;
    selectedGrowthKpiTargets;
    selectedCERatioKpiTargets;
    selectedMultiKpiTargets;
    prevDealers = [];
    subProdAddPayouts = {};
    //below Variable holds the targets and formula's of selected products
    selectedProdKpiTargets;
    selectedProdKpiPayout;
    selectedProdVolTarget;
    prodGrandTotalPayout = 0;
    @track salesPersonGrandTotal = 0;
    @track dealerGrandTotalPayout = 0;
    @track grandTotalPayout = 0;
    @track grandTotalVolume = 0;
    @track calculatedCount;
    @track accountDet;
    @track isCalcSaved;
    @track changeGridSize = 'slds-grid  slds-wrap slds-max-small-size--1-of-1 slds-medium-size--9-of-12 slds-large-size--10-of-12 slds-clearfix scrollfix widthFix';
    @track subcategorySize = "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--6-of-12 subProduct_flex";
    @track kpiSize = "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--6-of-12 subProduct_flex slds-p-top_x-small";
    @track kpiClass = 'slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_3-of-6 slds-large-size_6-of-12 kpi-container';
    @track summaryClass = 'slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_3-of-6 slds-large-size_6-of-12 slds-p-around_x-small';
    //@track summaryCERClass = 'slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_3-of-6 slds-large-size_6-of-12 slds-p-around_x-small';
    @track incRecord = {};
    @track cloneMonthYear = {};
    @track currentDate;
    @track hasProduct = false;
    @track totalProdEarnings = [];
    @track productTargetPayouts = [];
    @track grandTargetPayout;
    @track grandActualPayout;
    @track grandRetailPercentage = 0;
    @track grandActualPercentage = 0;
    @track grandTotalTarget = 0;
    @track grandTotalActual = 0;
    @track reportUrl;
    @track showDiv = false;
    @track isProjectionMode = true;
    @track stockDisabled = false;
    @track buttonName = 'Check Details';
    @track projectedIncentive = 0;
    @track targetIncentive = 0;
    @track actualIncentive = 0;
    @track groupedAchievements;
    @track isShowCost = false;
    @track projectedSc = false;
    @track isBHL = false;
    @track showDownloadBtn = false;
    @track dealerActualPayout = 0;
    @track salesPersonActualPayout = 0;
    @track totalAddActualPayout = 0;
    @track additionalActualPayout = 0;
    @track growthActualPayout = 0;
    @track multiKpiActualPayout = 0;
    @track totalTIVActualPayout = 0;
    @track disableButton = true;
    @track tabs = [
        { id: 'sales', label: 'Sales', class: 'slds-tabs_default__item slds-active' },
        { id: 'afterMarket', label: 'After Market', class: 'slds-tabs_default__item' }
    ];
    isDownloadButtonEnabled = true;
    totalPayout = 0;
    @wire(getProductAndSubProducts) productAndSubProductInfo({ error, data }) {
        if (data) {
            this.productAndSubProducts = data;
            this.products = Object.keys(this.productAndSubProducts);
            for (const key in this.productAndSubProducts) {
                var prod = {};
                prod['productName'] = key;
                prod['totalPayout'] = 0;
                prod['imageUrl'] = imageZip + '/Images/' + key + '.png';
                this.calculatedProducts.push(prod);
            }
        } else if (error) {

        }
    }

    @wire(getProductsAndKPI) ProductAndKpIs({ error, data }) {
        if (data) {
            this.prodAndKpIData = data;
        } else if (error) {

        }
    }

    @track isDropdown = null;
    connectedCallback() {
        var dt = new Date();
        this.currentDate = dt.getDate() + ' - ' + (dt.getMonth() + 1) + ' - ' + dt.getFullYear();
        this.getUserDetails();
        this.getYears();
        document.addEventListener('click', this.close.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._handler);
        this.close();
    }

    close() {
        if (this.isDropdown == null) {
            this.showDiv = false;
            this.buttonName = 'Check Details';
        }
    }

    handleKpiMouseOver(event) {
        var key = event.target.dataset.key;
        this.isDropdown = key;
    }

    handleKpiLeave() {
        this.isDropdown = null;
    }

    getUserDetails() {
        getUserDetails({}).then(res => {
            if (res && res.Account) {
                this.accountDet = res.Account;
                this.dealerRegion = res.Account.JCB_India_Zone__c;
            } else {
                this.showToast('You have no access for Incentive Calculator Page', 'info');
            }
        }).catch(error => {

        });
    }

    getCalculatedCount() {
        let count = 0;
        this.calculatedProducts.forEach(ele => {
            if (ele.totalPayout > 0) {
                count += 1;
            }
        });
        this.calculatedCount = count;
    }
    
    handleCheckIncentive() {
        if (this.month && this.year) {
            this.getTargetInfo();
        }
    }

    showToast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title: title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    @track addMultiKpiTargetInfo;
    @track multiKpiTargetPayouts;
    dealerTargetInfo;
    getTargetInfo() {
        this.isLoading = true;
        getDealerAndProductTargetInfo({ month: this.month, year: this.year, dealerId: this.accountDet.Id }).then(result => {
            if (result['productTargetInfo'] != null && result['dealerTargetInfo'] != null) {
                this.prevDealers = result['prevDealerWrappers'];
                this.dealerTargetInfo = result['dealerTargetInfo'];
                this.productTargetPayouts = result['productTargetInfo'];
                this.multiKpiTargetPayouts = result['multiKpitargetInfo'];
                this.productKpiTargetInfo = new Map();
                this.productKpiPayoutInfo = new Map();
                this.addkpiTargetInfo = new Map();
                this.addMultiKpiTargetInfo = new Map();
                this.growthKPITargetInfo = new Map();
                this.ceTargetinfo = new Map();
                this.productsAndPayout = new Map();
                this.addKPITargetAndPayout = [];
                this.configuredProducts = [];
                this.calculatedProducts = this.calculatedProducts.map((prod) => {
                    prod.totalPayout = 0;
                    prod.totalActualPayout = 0;
                    return prod;
                });
                this.isAddIncentive = false;
                for (const key in this.prodAndKpIData) {
                    let prodKPIData = this.prodAndKpIData[key];
                    let productKPITarget = [];
                    let addKPITarget = [];
                    let growthKPITarget = [];
                    let growthCERatioTarget = [];
                    prodKPIData.forEach(kpiData => {
                        let prodTarget = Object.assign({}, result['productTargetInfo'].find((kpi) => kpi.productKPI.productKPIId == kpiData.Id && kpi.type == 'KPI Target'));
                        if (prodTarget && prodTarget.productKPI) {
                            prodTarget.kpiId = prodTarget.productKPI.kpiId;
                            if (prodTarget.productKPI.kpiName == 'Volume') {
                                prodTarget.kpiName = prodTarget.productKPI.kpiName + ' Incentive';
                            } else {
                                prodTarget.kpiName = prodTarget.productKPI.kpiName + ' Target';
                            }
                            if (prodTarget.hasSlabs && prodTarget.slabInfo?.length > 0) {
                                prodTarget.slabInfo = this.sortSlabs(prodTarget.slabInfo);
                            }
                            productKPITarget.push(prodTarget);
                        }
                        let addTarget = Object.assign({}, result['productTargetInfo'].find((kpi) => kpi.productKPI.productKPIId == kpiData.Id && kpi.type == 'Additional Incentive Target'));
                        if (addTarget && addTarget.productKPI) {
                            addTarget.kpiId = addTarget.productKPI.kpiId;
                            if (addTarget.productKPI.kpiName == 'Volume') {
                                addTarget.kpiName = addTarget.productKPI.kpiName + ' Incentive';
                            } else {
                                addTarget.kpiName = addTarget.productKPI.kpiName + ' Target';
                            }
                            if (addTarget.hasSlabs && addTarget.slabInfo?.length > 0) {
                                addTarget.slabInfo = this.sortSlabs(addTarget.slabInfo);
                            }
                            addKPITarget.push(addTarget);
                        }
                        let growthTarget = Object.assign({}, this.productTargetPayouts.find(kpi => kpi.productKPI.productKPIId == kpiData.Id && kpi.type == 'Growth Additional Incentive'));
                        if (growthTarget?.productKPI) {
                            growthTarget.kpiId = growthTarget.productKPI.kpiId;
                            if (growthTarget.productKPI.kpiName == 'Volume') {
                                growthTarget.kpiName = growthTarget.productKPI.kpiName + ' Incentive';
                            } else {
                                growthTarget.kpiName = growthTarget.productKPI.kpiName + ' Target';
                            }
                            growthKPITarget.push(growthTarget);
                        }

                        let growthCERatio = Object.assign({}, this.productTargetPayouts.find(kpi => kpi.productKPI.productKPIId == kpiData.Id && kpi.type == 'Product To CE Ratio'));
                        if (growthCERatio?.productKPI) {
                            growthCERatio.kpiId = growthCERatio.productKPI.kpiId;
                            if (growthCERatio.productKPI.kpiName == 'Volume') {
                                growthCERatio.kpiName = growthCERatio.productKPI.kpiName + ' Incentive';
                            } else {
                                growthCERatio.kpiName = growthCERatio.productKPI.kpiName + ' Target';
                            }
                            growthCERatioTarget.push(growthCERatio);  
                        }

                    });
                    if (productKPITarget?.length > 0) {
                        this.productKpiTargetInfo.set(key, productKPITarget);
                        let productKPIPayout = [];
                        productKPITarget.forEach(kpi => {
                            if (kpi && kpi.productPayouts) {
                                for (let z = 0; z < kpi.productPayouts?.length; z++) {
                                    let kpiPayout = Object.assign({}, kpi.productPayouts[z]);
                                    kpiPayout.kpiName = kpi.productKPI.kpiName + ' Incentive';
                                    kpiPayout.productKPIId = kpi.productKPI.productKPIId;
                                    kpiPayout.kpiId = kpi.productKPI.kpiId;
                                    kpiPayout.productName = kpi.productKPI.productName;
                                    let subPayout = productKPIPayout.find(prod => prod.subProductId == kpiPayout.subProductId);
                                    let index = productKPIPayout.find(prod => prod.subProductId == kpiPayout.subProductId)
                                    if (subPayout) {
                                        subPayout.payoutInfo.push(kpiPayout);
                                        productKPIPayout[index] = subPayout;
                                    } else {
                                        subPayout = { payoutInfo: [] };
                                        subPayout.subProductId = kpiPayout.subProductId;
                                        subPayout.subProductName = kpiPayout.subProductName;
                                        subPayout.payoutInfo.push(kpiPayout);
                                        productKPIPayout.push(subPayout);
                                    }
                                }
                            }
                        })
                        if (productKPIPayout?.length > 0) {
                            this.productKpiPayoutInfo.set(key, productKPIPayout);
                        }
                    }
                    if (addKPITarget && addKPITarget?.length > 0) {
                        this.addkpiTargetInfo.set(key, addKPITarget);
                    }
                    if (growthKPITarget?.length > 0) {
                        this.growthKPITargetInfo.set(key, growthKPITarget);
                    }
                    if (growthCERatioTarget?.length > 0) {
                        this.ceTargetinfo.set(key, growthCERatioTarget);
                    }
                }
                this.productVolumeTargetInfo = new Map();
                this.addProdPayoutInfo = new Map();
                this.isCalcSaved = result['dealerTargetInfo'].stage == 'Saved' ? true : false; // validates new calculator or existing
                if (this.isCalcSaved) {
                    this.isDownloadButtonEnabled = false;
                } else {
                    this.isDownloadButtonEnabled = true;
                }
                this.incRecord.recordId = result['dealerTargetInfo'].recordId;
                result['dealerTargetInfo'].productTargetsAndAchievements.forEach(prodVol => {
                    this.productVolumeTargetInfo.set(prodVol.productName, prodVol);
                })
                this.calculateMultiKpiIncentivePayout();
                this.setupProductsAndPayoutData();
                this.setProductNames();
                this.calculateTotalVolume();
                this.setupAddIncentiveData();
                this.calculateGrandTotal(true);
                this.calculatePotentialAmount();
                this.groupedAchievements = calculateTotalProdEarnings(this.configuredProducts);
                this.enableCalculator = true;
                this.setupSelectedProductData(this.products[0]);
                setTimeout(() => {
                    const activeCell = this.template.querySelector('.active');
                    if (activeCell) {
                        activeCell.classList.remove('active');
                    }
                    var dataQuery = '[data-prodname="' + this.products[0] + '"]';
                    var targetCell = this.template.querySelectorAll(dataQuery);
                    if (targetCell) {
                        targetCell[0].classList.add('active');
                    }
                }, 500);
                this.getCalculatedCount();
                console.log('this.productsAndPayout: ', this.productsAndPayout);
            } else {
                this.showToast('Incentive target not being configured for selected month', 'error');
                this.enableCalculator = false;
            }
            this.isLoading = false;
            this.showDownloadBtn = true;
        }).catch(error => {
            this.showToast('An error occurred while fetching incentive targets for the selected month and year.', 'error');
            console.log(error);
            this.enableCalculator = false;
            this.isLoading = false;
        })
    }

    parseRange(range) {
        let min = Number.NEGATIVE_INFINITY;
        let max = Number.POSITIVE_INFINITY;

        const match = range.match(/(<=?|>=?|==)\s?(\d+)/g);
        if (match) {
            match.forEach((condition) => {
                const [operator, value] = condition.split(/\s+/);
                const num = parseInt(value, 10);

                switch (operator) {
                    case '<':
                        max = Math.min(max, num - 1);
                        break;
                    case '<=':
                        max = Math.min(max, num);
                        break;
                    case '>':
                        min = Math.max(min, num + 1);
                        break;
                    case '>=':
                        min = Math.max(min, num);
                        break;
                    case '==':
                        min = num;
                        max = num;
                        break;
                }
            });
        }

        return { min, max };
    }

    sortSlabs(slabs) {
        return slabs.sort((a, b) => {
            const rangeA = this.parseRange(a.slabRange);
            const rangeB = this.parseRange(b.slabRange);

            return rangeA.min - rangeB.min || rangeA.max - rangeB.max;
        });
    }

    calculatePotentialAmount() {
        for (let [key, value] of this.productsAndPayout) {
            var product = value;
            let prodObj = {
                product,
                configuredProducts: this.configuredProducts,
                productKpiTargetInfo: this.productKpiTargetInfo,
                productVolumeTargetInfo: this.productVolumeTargetInfo,
                productKpiPayoutInfo: this.productKpiPayoutInfo,
                addkpiTargetInfo: this.addkpiTargetInfo,
                dealerRegion: this.dealerRegion,
                grandTotalVolume: this.grandTotalVolume,
                grandTotalActual: this.grandTotalActual
            };
            prodObj = calculateMaximizeEarnings(prodObj);
            product = prodObj.product;
            product = this.calculateTIVEarnings(product);
            this.setEarningBadgeIcon(product);
            this.configuredProducts = prodObj.configuredProducts;
            this.productsAndPayout.set(key, product);
        }
    }

    calculateTIVEarnings(product) {
        let tivTarget = this.productKpiTargetInfo.get(product.productName)?.find(kpi => kpi.isIndustryIncentive == true);
        let tivSlabs = tivTarget?.slabInfo?.filter(slab => slab.slabType == 'Total Volume Industry Incentive');
        product.tivEarningsMinCalc = 0;
        product.tivEarningsMaxCalc = 0;
        product.tivEarningsMinActual = 0;
        product.tivEarningsMaxActual = 0;
        product.tivTargetCalc = 0;
        product.tivPercentCalc = 0;
        product.tivTargetActual = 0;
        product.tivPercentActual = 0;
        product.showTIVWarningCalc = false;
        product.showTIVWarningActual = false;
        let tivEarningsMinCalc = 0;
        let tivEarningsMaxCalc = 0;
        let tivEarningsMinActual = 0;
        let tivEarningsMaxActual = 0;
        let tivTargetCalc = 0;
        let tivPercentCalc = 0;
        let tivTargetActual = 0;
        let tivPercentActual = 0;
        if (tivSlabs) {
            let payoutAmt = { minAmount: 0, maxAmount: 0 };
            let kpiAch = product.kpiAchivement?.find(kpi => kpi.kpiId == tivTarget.kpiId);
            let kpiIndex = product.kpiAchivement?.findIndex(kpi => kpi.kpiId == tivTarget.kpiId);
            let currPercentage = kpiAch?.predictedKPIPercentage || 0;
            for (let i = 0; i < tivSlabs.length; i++) {
                if (validateTargetConditon(tivSlabs[i].slabRange, currPercentage)) {
                    if (tivSlabs[i + 1]) {
                        let nextSlabPercent = extractTargetNumValue(tivSlabs[i + 1].slabRange, true);
                        let percentRemain = nextSlabPercent - currPercentage;
                        let targetRemain;
                        let nextSlabRetail;
                        tivPercentCalc = percentRemain;
                        if (tivTarget.kpiName.includes('Volume')) {
                            targetRemain = product.totalRetailTarget * (percentRemain / 100);
                            tivTargetCalc = targetRemain;
                            nextSlabRetail = product.totalRetail + targetRemain;
                            product.tivRetail = nextSlabRetail;
                            for (let j = 0; j < product?.kpiAchivement.length; j++) {
                                product.kpiAchivement[j].tivEarningsMinCalc = 0;
                                product.kpiAchivement[j].tivEarningsMaxCalc = 0;
                                product.kpiAchivement[j].tivTargetCalc = 0;
                                product.kpiAchivement[j].tivPercentCalc = 0;
                                product.kpiAchivement[j].showTIVWarningCalc = false;

                                if (product.kpiAchivement[j].Label.includes('Volume')) {
                                    payoutAmt = getMinMaxAmount(product.productName, tivTarget, this.productKpiPayoutInfo, this.dealerRegion);
                                    let calcObj = { slab: tivSlabs[i + 1], nextSlabPercent, payoutAmt, nextSlabRetail, product, currentPayout: 0, minName: 'tivMinAmountCalc', maxName: 'tivMaxAmountCalc' };
                                    product = calculateEarningsVolumeAmt(calcObj);
                                    product.kpiAchivement[j].tivMinAmountCalc = product.tivMinAmountCalc;
                                    product.kpiAchivement[j].tivMaxAmountCalc = product.tivMaxAmountCalc;

                                } else {
                                    product.kpiAchivement[j] = this.calculateAmount(product.kpiAchivement[j], 'predictedKPIPercentage', 'tivMinAmountCalc', 'tivMaxAmountCalc', product, 'totalRetail');
                                }
                            }
                        } else {
                            product.tivRetail = product.totalRetail;
                            for (let j = 0; j < product?.kpiAchivement.length; j++) {
                                product.kpiAchivement[j].tivEarningsMinCalc = 0;
                                product.kpiAchivement[j].tivEarningsMaxCalc = 0;
                                product.kpiAchivement[j].tivTargetCalc = 0;
                                product.kpiAchivement[j].tivPercentCalc = 0;
                                product.kpiAchivement[j].showTIVWarningActual = false;
                                if (product.kpiAchivement[j].kpiId == tivTarget.kpiId) {
                                    product.kpiAchivement[j] = this.calculateAmount(product.kpiAchivement[j], 'predictedKPIPercentage', 'tivMinAmountCalc', 'tivMaxAmountCalc', product, 'totalRetail');
                                }
                            }
                        }
                    }
                }
            }
            currPercentage = kpiAch?.actualKPIPercentage || 0;
            for (let i = 0; i < tivSlabs.length; i++) {
                if (validateTargetConditon(tivSlabs[i].slabRange, currPercentage)) {
                    if (tivSlabs[i + 1]) {
                        let nextSlabPercent = extractTargetNumValue(tivSlabs[i + 1].slabRange, true);
                        let percentRemain = nextSlabPercent - currPercentage;
                        let targetRemain;
                        let nextSlabRetail;
                        tivPercentActual = percentRemain;
                        if (tivTarget.kpiName.includes('Volume')) {
                            targetRemain = product.totalRetailTarget * (percentRemain / 100);
                            tivTargetActual = targetRemain;
                            nextSlabRetail = product.totalRetailActual + targetRemain;
                            for (let j = 0; j < product?.kpiAchivement.length; j++) {
                                product.kpiAchivement[j].tivEarningsMinActual = 0;
                                product.kpiAchivement[j].tivEarningsMaxActual = 0;
                                product.kpiAchivement[j].tivTargetActual = 0;
                                product.kpiAchivement[j].tivPercentActual = 0;
                                if (product.kpiAchivement[j].Label.includes('Volume')) {
                                    let calcObj = { slab: tivSlabs[i + 1], nextSlabPercent, payoutAmt, nextSlabRetail, product, currentPayout: 0, minName: 'tivMinAmountActual', maxName: 'tivMaxAmountActual' };
                                    product = calculateEarningsVolumeAmt(calcObj);
                                    product.kpiAchivement[j].tivMinAmountActual = product.tivMinAmountActual;
                                    product.kpiAchivement[j].tivMaxAmountActual = product.tivMaxAmountActual;

                                } else {
                                    product.kpiAchivement[j] = this.calculateAmount(product.kpiAchivement[j], 'actualKPIPercentage', 'tivMinAmountActual', 'tivMaxAmountActual', product, 'totalRetailActual');
                                }
                            }
                        } else {
                            product.tivRetail = product.totalRetail;
                            for (let j = 0; j < product?.kpiAchivement.length; j++) {
                                product.kpiAchivement[j].tivEarningsMinActual = 0;
                                product.kpiAchivement[j].tivEarningsMaxActual = 0;
                                product.kpiAchivement[j].tivTargetActual = 0;
                                product.kpiAchivement[j].tivPercentActual = 0;
                                if (product.kpiAchivement[j].kpiId == tivTarget.kpiId) {
                                    product.kpiAchivement[j] = this.calculateAmount(product.kpiAchivement[j], 'actualKPIPercentage', 'tivMinAmountActual', 'tivMaxAmountActual', product, 'totalRetailActual');
                                }
                            }
                        }
                    }
                }
            }
            for (let p = 0; p < product.kpiAchivement.length; p++) {
                let kpiAchieve = product.kpiAchivement[p];
                tivEarningsMinCalc += kpiAchieve.tivMinAmountCalc ? kpiAchieve.tivMinAmountCalc : 0;
                tivEarningsMaxCalc += kpiAchieve.tivMaxAmountCalc ? kpiAchieve.tivMaxAmountCalc : 0;
                tivEarningsMinActual += kpiAchieve.tivMinAmountActual ? kpiAchieve.tivMinAmountActual : 0;
                tivEarningsMaxActual += kpiAchieve.tivMaxAmountActual ? kpiAchieve.tivMaxAmountActual : 0;
            }
            if (tivTarget.kpiName.includes('Volume')) {
                product.tivEarningsMinCalc = tivEarningsMinCalc;
                product.tivEarningsMaxCalc = tivEarningsMaxCalc;
                product.tivEarningsMinActual = tivEarningsMinActual;
                product.tivEarningsMaxActual = tivEarningsMaxActual;
                product.tivTargetCalc = tivTargetCalc;
                product.tivPercentCalc = tivPercentCalc;
                product.tivTargetActual = tivTargetActual;
                product.tivPercentActual = tivPercentActual;
                if (product.tivEarningsMinCalc == product.tivEarningsMaxCalc) {
                    product.tivEarningsMinCalc = null;
                }
                product.showTIVWarningCalc = product.tivEarningsMaxCalc > 0 && product.tivTargetCalc > 0;
                if (product.tivEarningsMinActual == product.tivEarningsMaxActual) {
                    product.tivEarningsMinActual = null;
                }
                product.showTIVWarningActual = product.tivEarningsMaxActual > 0 && product.tivTargetActual > 0;
            } else if (kpiIndex >= 0) {
                kpiAch.tivEarningsMinCalc = tivEarningsMinCalc;
                kpiAch.tivEarningsMaxCalc = tivEarningsMaxCalc;
                kpiAch.tivEarningsMinActual = tivEarningsMinActual;
                kpiAch.tivEarningsMaxActual = tivEarningsMaxActual;
                kpiAch.tivTargetCalc = tivTargetCalc;
                kpiAch.tivPercentCalc = tivPercentCalc;
                kpiAch.tivTargetActual = tivTargetActual;
                kpiAch.tivPercentActual = tivPercentActual;
                if (kpiAch.tivEarningsMinCalc == kpiAch.tivEarningsMaxCalc) {
                    kpiAch.tivEarningsMinCalc = null;
                }
                kpiAch.showTIVWarningCalc = kpiAch.tivEarningsMaxCalc > 0 && kpiAch.tivPercentCalc > 0;
                if (kpiAch.tivEarningsMinActual == kpiAch.tivEarningsMaxActual) {
                    kpiAch.tivEarningsMinActual = null;
                }
                kpiAch.showTIVWarningActual = kpiAch.tivEarningsMaxActual > 0 && kpiAch.tivPercentActual > 0;
                product.kpiAchivement[kpiIndex] = kpiAch;
            }
        }
        return product
    }

    calculateAmount(kpiAch, propertyName, minName, maxName, product, retailName) {
        let kpiTarget = this.productKpiTargetInfo.get(product.productName)?.find(kpi => kpi.kpiId == kpiAch.kpiId);
        let payoutAmt = getMinMaxAmount(product.productName, kpiTarget, this.productKpiPayoutInfo, this.dealerRegion);
        if (kpiTarget.hasSlabs && kpiTarget.slabInfo?.length > 0) {
            let slabs = kpiTarget.slabInfo.filter(slab => slab.slabType == null);
            let isEligible = false;
            for (let s = 0; s < slabs?.length; s++) {
                if (validateTargetConditon(slabs[s].slabRange, kpiAch[propertyName])) {
                    isEligible = true;
                    if (slabs[s].payoutMode == 'Percent') {
                        let percent = slabs[s].payoutPercentage ? slabs[s].payoutPercentage / 100 : 0;
                        if (payoutAmt.minAmount == payoutAmt.maxAmount) {
                            kpiAch[minName] = null;
                            kpiAch[maxName] = (product[retailName] * payoutAmt.maxAmount) * percent;
                        } else {
                            kpiAch[minName] = (product[retailName] * payoutAmt.minAmount) * percent;
                            kpiAch[maxName] = (product[retailName] * payoutAmt.maxAmount) * percent;
                        }
                    } else if (slabs[s].payoutMode == 'proRata') {
                        let percent = kpiAch[propertyName] ? kpiAch[propertyName] / 100 : 0;
                        if (payoutAmt.minAmount == payoutAmt.maxAmount) {
                            kpiAch[minName] = null;
                            kpiAch[maxName] = (product[retailName] * payoutAmt.maxAmount) * percent;
                        } else {
                            kpiAch[minName] = (product[retailName] * payoutAmt.minAmount) * percent;
                            kpiAch[maxName] = (product[retailName] * payoutAmt.maxAmount) * percent;
                        }
                    } else if (slabs[s].payoutMode == 'Amt') {
                        kpiAch[minName] = null;
                        kpiAch[maxName] = product[retailName] * slabs[s].amount;
                    }
                }

            }
            if (!isEligible) {
                kpiAch[minName] = 0;
                kpiAch[maxName] = 0;
            }
        } else if (kpiTarget.target) {
            if (validateTargetConditon(kpiTarget.target, kpiAch[propertyName])) {
                if (payoutAmt.minAmount == payoutAmt.maxAmount) {
                    kpiAch[minName] = null;
                    kpiAch[maxName] = product[retailName] * payoutAmt.maxAmount;
                } else {
                    kpiAch[minName] = product[retailName] * payoutAmt.minAmount;
                    kpiAch[maxName] = product[retailName] * payoutAmt.maxAmount;
                }
            } else {
                kpiAch[minName] = 0;
                kpiAch[maxName] = 0;
            }
        }
        return kpiAch;
    }

    setupProductsAndPayoutData() {
        this.isLoading = true;
        for (let [key, value] of this.productVolumeTargetInfo) {
            var productInfo = value;
            var product = {};
            product.kpName = 'Volume Incentive';
            product.productName = productInfo.productName;
            product.productId = productInfo.productId;
            product.demoTarget = productInfo.demoTarget;
            product.demoConductedPredicted = productInfo.demoConductedPredicted;
            product.demoConductedActual = productInfo.demoConductedActual;
            product.subProducts = JSON.parse(JSON.stringify(this.getSubCategoryProducts(product.productName)));
            product.kpiPayouts = this.getProductKpiPayoutInfo(product.productName);
            product.totalRetailTarget = productInfo.totalRetailTarget ? productInfo.totalRetailTarget : 0;
            product.kpiAchivement = this.getProductKpiAchivementInputs(product);
            product.totalRetail = productInfo.totalRetailPredicted ? productInfo.totalRetailPredicted : 0;
            product.total4WDRetail = this.calculateTotalRetail(product, 'fourWd');
            product = this.calculate4wdPercentage(product);
            product.totalRetailActual = productInfo.totalRetailAchieved ? productInfo.totalRetailAchieved : 0;
            product.totalRetailPercentage = productInfo.totalRetailTarget > 0 && product.totalRetail > 0 ? (product.totalRetail / productInfo.totalRetailTarget * 100).toFixed(2) : 0;
            product.totalRetailActualPercentage = product.totalRetailActual > 0 && productInfo.totalRetailTarget > 0 ? (product.totalRetailActual / productInfo.totalRetailTarget * 100).toFixed(2) : 0;
            if (this.isCalcSaved) {
                product.totalProdPredictedPayout = productInfo.totalProductPredictedPayout ? productInfo.totalProductPredictedPayout : 0;
                product.totalAddPredictedPayout = productInfo.totalAddPredictedPayout ? productInfo.totalAddPredictedPayout : 0;
            }
            else {
                product.totalProdPredictedPayout = 0;
                product.totalAddPredictedPayout = 0;
            }
            product.totalProdActualPayout = productInfo.totalProductActualPayout ? productInfo.totalProductActualPayout : 0;
            product.additionalActualPayout = productInfo.additionalActualPayout ? productInfo.additionalActualPayout : 0;
            product.additionalPredictedPayout = productInfo.additionalPredictedPayout ? productInfo.additionalPredictedPayout : 0;
            product.multiKpiActualPayout = productInfo.multiKpiActualPayout ? productInfo.multiKpiActualPayout : 0;
            product.growthActualPayout = productInfo.growthActualPayout ? productInfo.growthActualPayout : 0;
            product.growthPredictedPayout = productInfo.growthPredictedPayout ? productInfo.growthPredictedPayout : 0;
            product.addActualPayout = productInfo.addActualPayout ? productInfo.addActualPayout : 0;
            product.totalAddActualPayout = productInfo.totalAddActualPayout ? productInfo.totalAddActualPayout : 0;
            product.totalDealerActualPayout = productInfo.totalDealerActualPayout ? productInfo.totalDealerActualPayout : 0;
            product.totalTIVActualPayout = productInfo.totalTIVActualPayout ? productInfo.totalTIVActualPayout : 0;
            product.totalSPersonActualPayout = productInfo.totalSPersonActualPayout ? productInfo.totalSPersonActualPayout : 0;
            product.totalActualPayout = productInfo.totalActualPayout ? productInfo.totalActualPayout : 0;
            
            this.selectedProdVolTarget = product.totalRetailTarget;
            for (let p = 0; p < product.kpiAchivement?.length; p++) {
                if (product.kpiAchivement[p].Label.includes('Volume')) {
                    product.kpiAchivement[p].predictedKPIPercentage = product.totalRetail > 0 && this.selectedProdVolTarget > 0 ? (product.totalRetail / this.selectedProdVolTarget) * 100 : 0;
                    break;
                }
            }
            product.subProdKPIPayout = new Map();
            product.subAddKPIPayout = new Map();
            product.isStockAchieved = productInfo.incentiveStatus == 'Eligible';
            product.isStockPredicted = productInfo.incentiveStatusPredicted ? productInfo.incentiveStatusPredicted == 'Eligible' : true;
            this.selectedProdKpiTargets = this.productKpiTargetInfo.get(product.productName);
            this.selectedProdKpiPayout = this.productKpiPayoutInfo.get(product.productName);
            this.calculateIncentivePayout(product, false);
            this.setPayoutForSubProducts(product);
            this.getSubProdPayouts(product);    //To calculate the earning potential and payout losses for individual Sub products.
            this.setKpiDisplayCard(product);    //To Assign showCard boolean for each kpiCard.
            product.totalProdTargetPayout = this.calculatePayout(product, 'targetPayoutAmount', true);
            product.totalSPersonTargetPayout = this.calculatePayout(product, 'targetPayoutAmount', false)
            product.totalAddTargetPayout = this.calculatePayout(product, 'addTargetKPIPayout', true);
            this.productsAndPayout.set(productInfo.productName, Object.assign({}, product));
        }
        this.grandActualPayout = this.dealerTargetInfo.totalPayoutReceived ? parseFloat(this.dealerTargetInfo.totalPayoutReceived).toFixed(2) : 0;
        this.dealerActualPayout = this.dealerTargetInfo.totalDealerPayoutAchieved ? parseFloat(this.dealerTargetInfo.totalDealerPayoutAchieved).toFixed(2) : 0;
        this.salesPersonActualPayout = this.dealerTargetInfo.totalSPersonPayoutAchieved ? parseFloat(this.dealerTargetInfo.totalSPersonPayoutAchieved).toFixed(2) : 0;
        this.totalAddActualPayout = this.dealerTargetInfo.totalAddPayoutAchieved ? parseFloat(this.dealerTargetInfo.totalAddPayoutAchieved).toFixed(2) : 0;
        this.additionalActualPayout = this.dealerTargetInfo.additionalPayoutAchieved ? parseFloat(this.dealerTargetInfo.additionalPayoutAchieved).toFixed(2) : 0;
        this.growthActualPayout = this.dealerTargetInfo.growthPayoutAchieved ? parseFloat(this.dealerTargetInfo.growthPayoutAchieved).toFixed(2) : 0;
        this.multiKpiActualPayout = this.dealerTargetInfo.multiKpiPayoutAchieved ? parseFloat(this.dealerTargetInfo.multiKpiPayoutAchieved).toFixed(2) : 0;
        this.totalTIVActualPayout = this.dealerTargetInfo.totalTIVPayoutAchieved ? parseFloat(this.dealerTargetInfo.totalTIVPayoutAchieved.toFixed(2)) : 0;
        this.isLoading = false;
    }

    getYears() {
        getCalcPicklistValues().then(res => {
            if (res) {
                this.cloneMonthYear = res;
                let cloneYearOptions = Object.keys(this.cloneMonthYear);
                this.yearOptions = [];
                for (let i = 0; i < cloneYearOptions?.length; i++) {
                    let year = (cloneYearOptions[i]).toString();
                    this.yearOptions.push({ label: year, value: year });
                }
            }
        }).catch(error => {

        });
    }

    currentTab;
    @track isTHProduct = false; // Initialize isTHProduct to false
    handleMenuSelection(event) {
        this.isAddIncentive = false;
        var prodName = event.target.getAttribute('data-name');
        if (this.selectedProduct) {
            this.productsAndPayout.set(this.selectedProduct.productName, Object.assign({}, this.selectedProduct));
        }
        this.selectedProduct = null;
        this.setupSelectedProductData(prodName);
        // To set currently active cell's background color and border-left color.
        this.currentTab = event.target.closest('lightning-vertical-navigation-item');
        const activeCell = this.template.querySelector('.active');
        if (activeCell) {
            activeCell.classList.remove('active');
        }
        const targetCell = event.target.closest('td');
        if (targetCell) {
            targetCell.classList.add('active');
        }
    }

    setupSelectedProductData(productName) {
        if (this.productsAndPayout.get(productName)) {
            this.hasProduct = true;
            this.selectedProduct = this.productsAndPayout.get(productName);
            this.selectedProdKpiTargets = this.productKpiTargetInfo.get(productName);
            this.selectedProdKpiPayout = this.productKpiPayoutInfo.get(productName);
            this.selectedProdVolTarget = this.selectedProduct.totalRetailTarget;
            this.isBHL = this.selectedProduct.productName === 'BHL'; // Check for BHL

            // Set isTHProduct to true if the selected product is 'TH', otherwise false
            this.isTHProduct = this.selectedProduct.productName === 'TH';

        } else {
            this.hasProduct = false;

            // Ensure isTHProduct is false if no product or a non-TH product is selected
            this.isTHProduct = false;
        }
        for (let i = 0; i < this.calculatedProducts.length; i++) {
            this.calculatedProducts[i].isActive = productName === this.calculatedProducts[i].productName;
        }
    }

    getProductKpiPayoutInfo(product) {
        var kpiPayouts = this.productVolumeTargetInfo.get(product).productKPIAndAchievements;
        var payoutInfo = [];
        var kpIs = this.prodAndKpIData[product];
        var prodKpiTarget = this.productKpiTargetInfo.get(product);
        var addProdKpiTarget = this.addkpiTargetInfo.get(product);
        var growthKpiTarget = this.growthKPITargetInfo.get(product);
        var ceRatioTarget = this.ceTargetinfo.get(product);
        for (let i = 0; i < kpIs?.length; i++) {
            let kpiTar = prodKpiTarget?.length > 0 ? prodKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let addKpiTar = addProdKpiTarget?.length > 0 ? addProdKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let growthKpiTar = growthKpiTarget?.length > 0 ? growthKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let ceRatioTar = ceRatioTarget?.length > 0 ? ceRatioTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;

            if ((kpiTar || addKpiTar || growthKpiTar || ceRatioTar) && kpIs[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout')) {
                let keyLabel = kpIs[i].KPI__r.Name + ' Incentive';
                var payout = { kpiId: kpIs[i].KPI__r.Id, kpIPayoutName: keyLabel, orderNo: kpIs[i].Order_No__c, isCalcPayout: kpIs[i].KPI__r.KPI_Visiblity__c.includes('CALC Payout') };
                if (kpiPayouts && kpiPayouts?.length > 0) {
                    for (let j = 0; j < kpiPayouts?.length; j++) {
                        if (kpiPayouts[j].productKPI?.kpiId == kpIs[i].KPI__r.Id) {
                            payout.payoutAmount = kpiPayouts[j].predictedKPIPayout ? kpiPayouts[j].predictedKPIPayout : 0;
                            payout.actualPayoutAmount = kpiPayouts[j].achievedKPIPayout ? kpiPayouts[j].achievedKPIPayout : 0;
                            payout.ceRatioActualPayout = kpiPayouts[j].ceRatioActualPayout ? kpiPayouts[j].ceRatioActualPayout : 0;
                            payout.ceRatioYTDActualPayout = kpiPayouts[j].ceRatioYTDActualPayout ? kpiPayouts[j].ceRatioYTDActualPayout : 0;
                            payout.targetPayoutAmount = kpiPayouts[j].targetPayoutAmount ? kpiPayouts[j].targetPayoutAmount : 0;
                            payout.addPredictedKPIPayout = kpiPayouts[j].addPredictedKPIPayout ? kpiPayouts[j].addPredictedKPIPayout : 0;
                            payout.addAchievedKPIPayout = kpiPayouts[j].addAchievedKPIPayout ? kpiPayouts[j].addAchievedKPIPayout : 0;
                            payout.growthPredictedPayout = kpiPayouts[j].growthPredictedPayout ? kpiPayouts[j].growthPredictedPayout : 0;
                            payout.growthActualPayout = kpiPayouts[j].growthAchievedKPIPayout ? kpiPayouts[j].growthAchievedKPIPayout : 0;
                            break;
                        }
                    }
                } else {
                    payout.payoutAmount = 0;
                    payout.addPredictedKPIPayout = 0;
                    payout.addAchievedKPIPayout = 0;
                    payout.growthPredictedPayout = 0;
                    payout.growthActualPayout = 0;
                }
                payoutInfo.push(payout);
            }
        }
        return payoutInfo.sort((a, b) => {
            return a.orderNo - b.orderNo;
        })
    }

    getProductKpiAchivementInputs(product) {
        var kpiAchievements = this.productVolumeTargetInfo.get(product.productName).productKPIAndAchievements;
        var prodKpiTarget = this.productKpiTargetInfo.get(product.productName);
        var addProdKpiTarget = this.addkpiTargetInfo.get(product.productName);
        var growthKpiTarget = this.growthKPITargetInfo.get(product.productName);
        var growthCERatioTarget = this.ceTargetinfo.get(product.productName);
        var multiKpiTarget = this.addMultiKpiTargetInfo.get(product.productName);
        var kpIs = this.prodAndKpIData[product.productName];
        var achiveMentInputInfo = [];
        for (let i = 0; i < kpIs?.length; i++) {
            let kpiTar = prodKpiTarget?.length > 0 ? prodKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let addKpiTar = addProdKpiTarget?.length > 0 ? addProdKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let growthKpiTar = growthKpiTarget?.length > 0 ? growthKpiTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let growthCETar = growthCERatioTarget?.length > 0 ? growthCERatioTarget.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
            let multiKpiTar;
            for (let k = 0; k < multiKpiTarget?.length; k++) {
                multiKpiTar = multiKpiTarget[k].multiKpSlabs?.length > 0 ? multiKpiTarget[k].multiKpSlabs.find(kpi => kpi.productKPI.kpiId == kpIs[i].KPI__c) : null;
                if (multiKpiTar) {
                    break;
                }
            }
            if (kpiTar || addKpiTar || growthKpiTar || multiKpiTar || growthCETar) {
                let isCalc = !kpIs[i].KPI__r.KPI_Visiblity__c.includes('CALC Target');
                let isIndent = kpIs[i].KPI__r.Name.includes('Indent');
                let isEditable = kpIs[i].KPI__r.Data_Source__c != 'Salesforce';
                let keyLabel = kpIs[i].KPI__r.Name != 'Demo' ? kpIs[i].KPI__r.Name + ' Achieved %' : kpIs[i].KPI__r.Name + ' Conducted';
                let perCentInput = kpIs[i].KPI__r.Name == 'Demo' ? false : true;
                let isProductToCE = kpIs[i].KPI__r.Name.includes('Product To CE Ratio');
                var payout = { productKPIId: kpIs[i].Id, kpiName: kpIs[i].KPI__r.Name, kpiId: kpIs[i].KPI__r.Id, Label: keyLabel, orderNo: kpIs[i].Order_No__c, isPercentage: perCentInput, isCalculated: isCalc, isEditable: isEditable, isIndent, showTarget: kpiTar ? true : false };
                payout.isProductToCE = isProductToCE;
                console.log('payout : ', payout);
                let isExist = false;
                if (kpiAchievements && kpiAchievements?.length > 0) {
                    for (let j = 0; j < kpiAchievements?.length; j++) {
                        if (kpiAchievements[j].productKPI?.kpiId == kpIs[i].KPI__r.Id) {
                            isExist = true;
                            payout.predictedKPIPercentage = kpiAchievements[j].predictedKPIPercentage ? kpiAchievements[j].predictedKPIPercentage : 0;
                            if (kpiAchievements[j].productKPI.kpiName.includes('Demo')) {
                                payout.achievedPercentage = product.demoConductedPredicted ? product.demoConductedPredicted : 0;
                                payout.actualPercentage = product.demoConductedActual ? product.demoConductedActual : 0;
                                payout.actualKPIPercentage = kpiAchievements[j].achievedKPIPerncentage ? parseFloat(parseFloat(kpiAchievements[j].achievedKPIPerncentage).toFixed(2)) : 0;
                            } else {
                                payout.achievedPercentage = kpiAchievements[j].predictedKPIPercentage ? kpiAchievements[j].predictedKPIPercentage : 0;
                                payout.actualPercentage = kpiAchievements[j].achievedKPIPerncentage ? parseFloat(parseFloat(kpiAchievements[j].achievedKPIPerncentage).toFixed(2)) : 0;
                                payout.actualKPIPercentage = kpiAchievements[j].achievedKPIPerncentage ? parseFloat(parseFloat(kpiAchievements[j].achievedKPIPerncentage).toFixed(2)) : 0;
                            }
                            if (isIndent) {
                                payout.indentOrder = kpiAchievements[j].indentOrder;
                                payout.indentWholesale = kpiAchievements[j].indentWholesale;
                            }
                            break;
                        }
                    }
                }
                if (!isExist) {
                    payout.predictedKPIPercentage = 0;
                    payout.achievedPercentage = 0;
                    if (payout.kpiName.includes('Demo')) {
                        payout.actualPercentage = product.demoConductedActual ? product.demoConductedActual : 0;
                        payout.actualKPIPercentage = product.demoConductedActual > 0 && product.demoTarget > 0 ? (product.demoConductedActual / product.demoTarget) * 100 : 0;
                    } else {
                        payout.actualKPIPercentage = 0;
                        payout.actualPercentage = 0;
                    }
                }
                let targetPercent;
                if (prodKpiTarget) {
                    targetPercent = prodKpiTarget.find((prodKpi) => prodKpi.kpiId == kpIs[i].KPI__r.Id);
                }
                if (targetPercent?.kpiName.includes('Volume')) {
                    payout.targetPercentageCalc = product.totalRetailTarget > 0 ? 100 : 0;
                    payout.targetPercentageActual = product.totalRetailTarget > 0 ? 100 : 0;
                } else {
                    if (targetPercent?.hasSlabs && targetPercent.slabInfo?.length > 0) {
                        let slabs = targetPercent.slabInfo.filter(slab => slab.slabType == null);
                        for (let i = 0; i < slabs?.length; i++) {
                            if ((slabs[i].payoutMode == 'Percent' && slabs[i].payoutPercentage != '0') || (slabs[i].payoutMode == 'Amt' && slabs[i].amount != 0) || (slabs[i].payoutMode == 'proRata')) {
                                payout.targetPercentageCalc = extractTargetNumValue(slabs[i].slabRange, true);
                                payout.targetPercentageActual = payout.targetPercentageCalc;
                                break;
                            }
                        }
                    } else if (targetPercent?.target) {
                        payout.targetPercentageCalc = targetPercent?.target ? extractTargetNumValue(targetPercent.target, true) : 0;
                        payout.targetPercentEndCalc = targetPercent?.target ? extractTargetNumValue(targetPercent.target, false) : 0;
                        payout.targetPercentageActual = payout.targetPercentageCalc;
                        payout.sz = payout.targetPercentEndCalc;
                    } else if (targetPercent?.kpiName.includes('Demo')) {
                        payout.targetPercentageCalc = product.demoTarget ? product.demoTarget : 0;
                        payout.targetPercentageActual = payout.targetPercentageCalc;
                    } else {
                        payout.targetPercentageCalc = 0;
                        payout.targetPercentageActual = 0;
                    }
                }
                achiveMentInputInfo.push(payout);
            }
        }
        return achiveMentInputInfo.sort((a, b) => {
            return a.orderNo - b.orderNo;
        })
    }

    handleChange(event) {
        if (event.target.name == 'year') {
            this.month = null;
            this.disableButton = true;
            this.enableCalculator = false;
            this.year = event.target.value;
            this.prevYear = this.year - 1;
            if (this.cloneMonthYear.hasOwnProperty(this.year)) {
                this.monthOptions = this.cloneMonthYear[this.year];
                this.monthOptions = this.monthOptions.map(month => {
                    return { label: month, value: month };
                });
            }
        } else if (event.target.name == 'month') {
            this.month = event.target.value;
            this.enableCalculator = false;
        }
        if (this.year && this.month) {
            this.disableButton = false;
        }
    }

    getSubCategoryProducts(productName) {
        var subProducts = [];
        var subCategoryList = this.productVolumeTargetInfo.get(productName).subTargetAndAchievement;
        subCategoryList.forEach(sub => {
            var subList = { subCategoryId: sub.subProductId, name: sub.subProductName, is4WDMachine: sub.is4WDMachine };
            if (this.isCalcSaved) {
                subList.volume = sub.subCategoryRetailPredicted ? sub.subCategoryRetailPredicted : 0;
                subList.fourWd = sub.fourWDRetailPredicted ? sub.fourWDRetailPredicted : 0;
                subList.twoWd = sub.twoWDRetailPredicted ? sub.twoWDRetailPredicted : 0;
            } else {
                subList.volume = 0;
                subList.fourWd = 0;
                subList.twoWd = 0;
            }
            subList.retailTarget = sub.subCategoryRetailTarget;
            subList.retailActual = sub.subCategoryRetailAchieved ? sub.subCategoryRetailAchieved : 0;
            subList.retail4WdActual = sub.fourWDRetailAchieved ? sub.fourWDRetailAchieved : 0;
            subList.retail2WdActual = sub.twoWDRetailAchieved ? sub.twoWDRetailAchieved : 0;
            subProducts.push(subList);
        });
        return subProducts;
    }

    handleSubProdInput(event) {
        let subprodId = event.target.dataset.subid;
        let subProd = this.selectedProduct.subProducts.find(subProd => subProd.subCategoryId === subprodId);
        if (this.selectedProduct.productName === 'BHL') {
            if (event.target.dataset.protype == '2wd') {
                subProd.twoWd = parseInt(this.validateInput(event)) ? parseInt(this.validateInput(event)) : 0;
                subProd.showCost2WDTotal = subProd.twoWd * subProd.payout;
            } else {
                subProd.fourWd = parseInt(this.validateInput(event)) ? parseInt(this.validateInput(event)) : 0;
                subProd.showCost4WDTotal = subProd.fourWd * subProd.payout;
            }
            subProd.volume = subProd.twoWd ? subProd.twoWd : 0;
            subProd.volume += subProd.fourWd ? subProd.fourWd : 0;
        } else {
            subProd.volume = parseInt(this.validateInput(event)) ? parseInt(this.validateInput(event)) : 0;
            subProd.showCostPredictedTotal = subProd.volume * subProd.payout;
        }
        this.selectedProduct.totalRetail = this.calculateTotalRetail(this.selectedProduct, 'volume');
        this.selectedProduct.total4WDRetail = this.calculateTotalRetail(this.selectedProduct, 'fourWd');
        this.selectedProduct = this.calculate4wdPercentage(this.selectedProduct);
        this.selectedProduct.total2WDRetail = this.calculateTotalRetail(this.selectedProduct, 'twoWd');
        this.selectedProduct.totalRetailPercentage = this.selectedProdVolTarget > 0 && this.selectedProduct.totalRetail > 0 ? ((this.selectedProduct.totalRetail / this.selectedProdVolTarget) * 100).toFixed(2) : 0;
        for (let i = 0; i < this.selectedProduct.kpiAchivement?.length; i++) {
            if (this.selectedProduct.kpiAchivement[i].Label.includes('Volume')) {
                this.selectedProduct.kpiAchivement[i].predictedKPIPercentage = this.selectedProduct.totalRetail > 0 && this.selectedProdVolTarget > 0 ? (this.selectedProduct.totalRetail / this.selectedProdVolTarget) * 100 : 0;
                break;
            }
        }
        this.calculateIncentivePayout(this.selectedProduct, true);
        this.calculateTotalVolume();
        for (let [key, value] of this.productsAndPayout) {
            this.calculateAddIncentivePayout(value, true);
            this.calculateGrowthIncentivePayout(value, true);
            this.calculateMultiKPIIncentive(value, true);
            //this.ceRatioPayout(value, true);
            if (this.ceTargetinfo.get(key)) {
                this.ceRatioPayout(value, false);
            }
        }
        this.selectedProduct = this.productsAndPayout.get(this.selectedProduct.productName);
        let prodObj = {
            product: this.selectedProduct, configuredProducts: this.configuredProducts, productKpiTargetInfo: this.productKpiTargetInfo, productVolumeTargetInfo: this.productVolumeTargetInfo,
            productKpiPayoutInfo: this.productKpiPayoutInfo,
            addkpiTargetInfo: this.addkpiTargetInfo,
            dealerRegion: this.dealerRegion,
            grandTotalVolume: this.grandTotalVolume,
            grandTotalActual: this.grandTotalActual
        };
        prodObj = calculateMaximizeEarnings(prodObj);
        this.selectedProduct = prodObj.product;
        this.selectedProduct = this.calculateTIVEarnings(this.selectedProduct);
        this.configuredProducts = prodObj.configuredProducts;
        this.productsAndPayout.set(this.selectedProduct.productName, this.selectedProduct);
        this.groupedAchievements = calculateTotalProdEarnings(this.configuredProducts);
        this.selectAdditionalProduct();
        this.calculateAddProductTotal();
        this.addGrandTotalPayout = this.calculateAddGrandTotal('additionalPredictedPayout');
        this.growthGrandTotalPayout = this.calculateAddGrandTotal('growthPredictedPayout');
        this.multiKpiGrandTotalPayout = this.calculateAddGrandTotal('multiKpiPredictedPayout');
        this.totalAddGrandTotalPayout = this.calculateAddGrandTotal('totalAddPredictedPayout');
        this.calculateGrandTotal(false);
        subProd.colorProj = subProd.targetRemain > 0 ? 'color: #FF0000; font-weight: 600;' : 'color: #16A42D; font-weight: 600;';
        this.setEarningBadgeIcon(this.selectedProduct);
    }

    setEarningBadgeIcon(prodObj) {
        for (let m = 0; m < this.calculatedProducts?.length; m++) {
            if (this.calculatedProducts[m].productName == prodObj.productName) {
                this.calculatedProducts[m].showBadgeProjected = prodObj.totalEarningPotentialCalc > 0;
                this.calculatedProducts[m].showBadgeActual = prodObj.totalEarningPotentialActual > 0;
            }
        }
    }

    validateInput(event) {
        var expression = new RegExp('^[0-9]+$');
        if (expression.test(parseInt(event.target.value))) {
            return parseInt(parseInt(event.target.value))
        } else {
            event.target.value = '';
            return '';
        }
    }
    calculateIncentivePayout(product, isCalcOrTarget) {
        this.selectedProdKpiTargets = this.productKpiTargetInfo.get(product.productName);
        product.kpiAchivement.forEach(kpiAch => {
            if (isCalcOrTarget) {
                this.calculateKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
            } else {
                this.calculateKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
                this.calculateKpiPayout(kpiAch.kpiId, kpiAch.targetPercentageCalc, product, false)
            }
            this.getSubProdPayouts(product);
        });
    }

    calculateTIVPayout(product, isCalcOrTarget) {
        let totalPayout = isCalcOrTarget ? product.totalDealerPredictedPayout ? product.totalDealerPredictedPayout : 0 : product.totalDealerTargetPayout ? product.totalDealerTargetPayout : 0;
        let tivTarget;
        if (this.selectedProdKpiTargets?.length > 0) {
            tivTarget = this.selectedProdKpiTargets.find(kpi => kpi.isIndustryIncentive);
        }
        if (tivTarget) {
            let kpiAch = product.kpiAchivement.find(kpi => kpi.kpiId == tivTarget.kpiId);
            if (kpiAch) {
                let coverageAchieved;
                let coverageActual = kpiAch.actualKPIPercentage ? kpiAch.actualKPIPercentage : 0;
                if (isCalcOrTarget) {
                    coverageAchieved = kpiAch.predictedKPIPercentage ? kpiAch.predictedKPIPercentage : 0;
                } else {
                    coverageAchieved = kpiAch.targetPercentageCalc ? kpiAch.targetPercentageCalc : 0;
                }
                if (coverageAchieved) {
                    if (tivTarget.slabInfo?.length > 0) {
                        product.isTIVConfigured = true;
                        let slabs = tivTarget.slabInfo;
                        let isEligible = false;
                        if (coverageAchieved > 0) {
                            for (let s = 0; s < slabs?.length; s++) {
                                if (slabs[s].slabType == 'Total Volume Industry Incentive') {
                                    if (validateTargetConditon(slabs[s].slabRange, coverageAchieved)) {
                                        if (isCalcOrTarget) {
                                            product.tivPercentageCalc = slabs[s].payoutPercentage ? slabs[s].payoutPercentage : 0;
                                        }
                                        isEligible = true;
                                        let percent = slabs[s].payoutPercentage > 0 ? slabs[s].payoutPercentage : 0;
                                        if (isCalcOrTarget) {
                                            product.totalTIVPredictedPayout = parseFloat((totalPayout * (parseFloat(percent) / 100)).toFixed(2));
                                        } else {
                                            product.totalTIVTargetPayout = parseFloat((totalPayout * (parseFloat(percent) / 100)).toFixed(2));
                                        }
                                    }
                                    if (!isCalcOrTarget) {
                                        if (validateTargetConditon(slabs[s].slabRange, coverageActual)) {
                                            product.tivPercentageActual = coverageActual;
                                        }
                                    }
                                }
                            }
                        }
                        if (!isEligible) {
                            if (isCalcOrTarget) {
                                product.totalTIVPredictedPayout = 0;
                            } else {
                                product.totalTIVTargetPayout = 0;
                            }
                        }
                    } else {
                        product.isTIVConfigured = false;
                    }
                }
            }
        } else {
            if (isCalcOrTarget) {
                product.totalTIVPredictedPayout = 0;
            } else {
                product.totalTIVTargetPayout = 0;
            }
        }
        return product;
    }

    //Method calculate's total retail sale
    calculateTotalRetail(product, propertyName) {
        var totalRetail = product.subProducts.reduce((total, subProduct) => {
            if (subProduct.volume) {
                return total + subProduct[propertyName];
            } else {
                return total;
            }
        }, 0);
        return totalRetail;
    }

    calculatePayout(product, propertyName, isCalcPayout) {
        var totalPayout = product.kpiPayouts.reduce((totalPay, kpiPay) => {
            let amt = kpiPay.isCalcPayout == isCalcPayout ? kpiPay[propertyName] ? kpiPay[propertyName] : 0 : 0;
            return totalPay + parseFloat(amt);
        }, 0)
        return totalPayout.toFixed(2);
    }

    calculateCERPayout(product, propertyName) {
        var totalPayout = product.kpiPayouts.reduce((totalPay, kpiPay) => {
            let amt = kpiPay.kpIPayoutName.includes('Product To CE Ratio') ? kpiPay[propertyName] ? kpiPay[propertyName] : 0 : 0;
            return totalPay + parseFloat(amt);
        }, 0)
        return totalPayout.toFixed(2);
    }

    setupPayoutInNavbar(product) {
        this.calculatedProducts = this.calculatedProducts.map((prod) => {
            if (prod.productName == product.productName) {
                prod.totalPayout = product.totalPredictedPayout ? product.totalPredictedPayout : 0;
                prod.totalActualPayout = product.totalActualPayout ? product.totalActualPayout : 0;
                prod.actualCSS = this.productsAndPayout.get(product.productName).isStockAchieved ? '' : 'totalProductpayout';
                prod.predictCSS = this.productsAndPayout.get(product.productName).isStockPredicted ? '' : 'totalProductpayout';
            }
            return prod;
        });
        this.getCalculatedCount();
    }

    calculateGrandTotal(isInitial) {
        this.grandTotalPayout = 0;
        this.grandTargetPayout = 0;
        this.prodGrandTotalPayout = 0;
        this.salesPersonGrandTotal = 0;
        this.dealerGrandTotalPayout = 0;
        this.tivGrandTotalPayout = 0;

        if (isInitial) {
            for (let [key, value] of this.productsAndPayout) {
                // projectionMode
                value.totalDealerPredictedPayout = value.totalProdPredictedPayout ? parseFloat(value.totalProdPredictedPayout) : 0;
                value.totalDealerPredictedPayout += value.totalAddPredictedPayout ? parseFloat(value.totalAddPredictedPayout) : 0;
                this.selectedProdKpiTargets = this.productKpiTargetInfo.get(key);
                value = this.calculateTIVPayout(value, true);
                value.totalPredictedPayout = value.isTIVConfigured ? value.totalTIVPredictedPayout : value.totalDealerPredictedPayout;
                value.totalPredictedPayout += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
                

                // targetMode
                value.totalDealerTargetPayout = value.totalProdTargetPayout ? parseFloat(value.totalProdTargetPayout) : 0;
                value.totalDealerTargetPayout += value.totalAddTargetPayout ? parseFloat(value.totalAddTargetPayout) : 0;
                value = this.calculateTIVPayout(value, false);
                value.totalTargetPayout = value.isTIVConfigured ? value.totalTIVTargetPayout : value.totalDealerTargetPayout;
                value.totalTargetPayout += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
                

                if (value.isStockPredicted) {
                    this.dealerGrandTotalPayout = parseFloat(this.dealerGrandTotalPayout) + parseFloat(value.totalDealerPredictedPayout);
                    this.tivGrandTotalPayout += value.totalTIVPredictedPayout ? parseFloat(value.totalTIVPredictedPayout) : 0;
                    this.prodGrandTotalPayout = parseFloat(this.prodGrandTotalPayout) + parseFloat(value.totalProdPredictedPayout);
                    this.grandTotalPayout += value.isTIVConfigured ? value.totalTIVPredictedPayout ? parseFloat(value.totalTIVPredictedPayout) : 0 : value.totalDealerPredictedPayout ? parseFloat(value.totalDealerPredictedPayout) : 0;
                }
                this.grandTotalPayout += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
                this.salesPersonGrandTotal += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
                if(this.month == 'December') {
                    this.grandTotalPayout += value.ceRatioYTDPredictedPayout ? parseFloat(value.ceRatioYTDPredictedPayout) : 0;
                }
                

                this.grandTargetPayout += value.totalTargetPayout ? parseFloat(value.totalTargetPayout) : 0;
                this.productsAndPayout.set(key, value);
                this.setupPayoutInNavbar(value);
            }
            this.animateNumber('actualIncentive', this.grandActualPayout, 1500);
            this.animateNumber('projectedIncentive', this.grandTotalPayout, 1500);
            this.animateNumber('targetIncentive', this.grandTargetPayout, 1500);
        } else {
            for (let [key, value] of this.productsAndPayout) {
                value.totalDealerPredictedPayout = value.totalProdPredictedPayout ? parseFloat(value.totalProdPredictedPayout) : 0;
                value.totalDealerPredictedPayout += value.totalAddPredictedPayout ? parseFloat(value.totalAddPredictedPayout) : 0;
                this.selectedProdKpiTargets = this.productKpiTargetInfo.get(key);
                value = this.calculateTIVPayout(value, true);
                value.totalPredictedPayout = value.isTIVConfigured ? value.totalTIVPredictedPayout : value.totalDealerPredictedPayout;
                value.totalPredictedPayout += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
               
                if (value.isStockPredicted) {
                    this.dealerGrandTotalPayout = parseFloat(this.dealerGrandTotalPayout) + parseFloat(value.totalDealerPredictedPayout);
                    this.tivGrandTotalPayout += value.totalTIVPredictedPayout ? parseFloat(value.totalTIVPredictedPayout) : 0;
                    this.prodGrandTotalPayout = parseFloat(this.prodGrandTotalPayout) + parseFloat(value.totalProdPredictedPayout);
                    this.grandTotalPayout += value.isTIVConfigured ? value.totalTIVPredictedPayout ? parseFloat(value.totalTIVPredictedPayout) : 0 : value.totalDealerPredictedPayout ? parseFloat(value.totalDealerPredictedPayout) : 0;
                }
                this.grandTotalPayout += value.totalSPersonPredictedPayout ? parseFloat(value.totalSPersonPredictedPayout) : 0;
                this.salesPersonGrandTotal = parseFloat(this.salesPersonGrandTotal) + parseFloat(value.totalSPersonPredictedPayout)
                //this.grandTotalPayout += value.ceRatioPredictedPayout ? parseFloat(value.ceRatioPredictedPayout) : 0;
                this.salesPersonGrandTotal = parseFloat(this.salesPersonGrandTotal) + parseFloat(value.ceRatioPredictedPayout)
                this.productsAndPayout.set(key, value);
                this.setupPayoutInNavbar(value);
            }
            this.animateNumber('projectedIncentive', this.grandTotalPayout, 1500);
        }
    }

    calculateTotalVolume() {
        this.grandTotalVolume = 0;
        this.grandTotalTarget = 0;
        this.grandTotalActual = 0;
        for (let [key, value] of this.productsAndPayout) {
            this.grandTotalVolume = parseFloat(this.grandTotalVolume) + parseFloat(value.totalRetail);
            this.grandTotalTarget = parseFloat(this.grandTotalTarget) + parseFloat(value.totalRetailTarget);
            this.grandTotalActual = parseFloat(this.grandTotalActual) + parseFloat(value.totalRetailActual);
        }
        this.grandRetailPercentage = this.grandTotalVolume > 0 && this.grandTotalTarget > 0 ? (parseFloat(this.grandTotalVolume / this.grandTotalTarget) * 100).toFixed(2) : 0;
        this.grandActualPercentage = this.grandTotalActual > 0 && this.grandTotalTarget > 0 ? (parseFloat(this.grandTotalActual / this.grandTotalTarget) * 100).toFixed(2) : 0;
    }

    handleKpiAchiveMentInput(event) {
        let kpiId = event.target.dataset.kpid;
        let achieved = parseFloat(event.target.value) || 0;
        let percentage = 0;
        this.selectedProdKpiTargets = this.productKpiTargetInfo.get(this.selectedProduct.productName);
        var kpiTarget = this.selectedProdKpiTargets.find(kpi => kpi.kpiId == kpiId);
        for (let i = 0; i < this.selectedProduct.kpiAchivement?.length; i++) {
            let kpiAch = this.selectedProduct.kpiAchivement[i];
            if (kpiAch.kpiId == kpiId) {
                if (kpiAch.Label.includes('Demo')) {
                    this.selectedProduct.demoConductedPredicted = achieved;
                    percentage = achieved > 0 && this.selectedProduct.demoTarget > 0 ? (achieved / this.selectedProduct.demoTarget) * 100 : 0;
                    kpiAch.predictedKPIPercentage = percentage;
                } else {
                    kpiAch.predictedKPIPercentage = achieved;
                    percentage = achieved;
                }
                kpiAch.achievedPercentage = achieved;
                this.selectedProduct.kpiAchivement[i] = kpiAch;
                break;
            }
        }
        this.calculateKpiPayout(kpiId, percentage, this.selectedProduct, true);
        if (kpiTarget?.isSalesmanIncentive && kpiTarget?.salesPersonTarget != null) {
            let salesTarget = this.selectedProdKpiTargets.find(kpi => kpi.kpiName.includes('Sales Person'));
            if (salesTarget) {
                this.calculateKpiPayout(salesTarget.kpiId, 0, this.selectedProduct, true);
            }
        }
        let cepercentage;
        let ceRatioKPIId;
        this.selectedCERatioKpiTargets = this.ceTargetinfo.get(this.selectedProduct.productName);
        var kpiceTarget = this.selectedCERatioKpiTargets.find(kpiTar => kpiTar.type == 'Product To CE Ratio' && kpiTar.kpiId == kpiId);
        for (let i = 0; i < this.selectedProduct.kpiAchivement?.length; i++) {
            let kpiAch = this.selectedProduct.kpiAchivement[i];
            if (kpiAch.kpiName == 'Product To CE Ratio') {
                cepercentage = kpiAch.predictedKPIPercentage;
                ceRatioKPIId = kpiAch.kpiId;
                break;
            }
        }
        if (kpiceTarget) {
            this.calculateCERatioPayout(ceRatioKPIId, cepercentage, this.selectedProduct, true);
        }

        this.calculateTotalVolume(this.selectedProduct, true);
        this.calculateAddIncentivePayout(this.selectedProduct, true);
        this.ceRatioPayout(this.selectedproduct, true);
        this.calculateGrowthIncentivePayout(this.selectedProduct, true);
        this.calculateMultiKPIIncentive(this.selectedProduct, true);
        this.selectedProduct.earningRetailLoss = 0;
        this.selectedProduct.earningPotential = 0;
        let prodObj = {
            product: this.selectedProduct,
            configuredProducts: this.configuredProducts,
            productKpiTargetInfo: this.productKpiTargetInfo,
            productVolumeTargetInfo: this.productVolumeTargetInfo,
            productKpiPayoutInfo: this.productKpiPayoutInfo,
            addkpiTargetInfo: this.addkpiTargetInfo,
            dealerRegion: this.dealerRegion,
            grandTotalVolume: this.grandTotalVolume,
            grandTotalActual: this.grandTotalActual
        };
        prodObj = calculateMaximizeEarnings(prodObj);
        this.selectedProduct = prodObj.product;
        this.selectedProduct = this.calculateTIVEarnings(this.selectedProduct);
        this.setEarningBadgeIcon(this.selectedProduct);
        this.configuredProducts = prodObj.configuredProducts;
        this.productsAndPayout.set(this.selectedProduct.productName, this.selectedProduct);
        this.groupedAchievements = calculateTotalProdEarnings(this.configuredProducts);
        this.selectAdditionalProduct();
        this.calculateAddProductTotal();
        this.addGrandTotalPayout = this.calculateAddGrandTotal('additionalPredictedPayout');
        this.growthGrandTotalPayout = this.calculateAddGrandTotal('growthPredictedPayout');
        this.multiKpiGrandTotalPayout = this.calculateAddGrandTotal('multiKpiPredictedPayout');
        this.totalAddGrandTotalPayout = this.calculateAddGrandTotal('totalAddPredictedPayout');
        this.calculateGrandTotal(false);
    }

    handleIndentInput(event) {
        let kpiId = event.target.dataset.kpid;
        let value = event.target.value;
        let name = event.target.name;
        if (!value || isNaN(value)) {
            value = 0;
        }
        for (let i = 0; i < this.selectedProduct.kpiAchivement?.length; i++) {
            let kpiAch = this.selectedProduct.kpiAchivement[i];
            if (kpiAch.kpiId == kpiId) {
                kpiAch[name] = parseInt(value);
                kpiAch.predictedKPIPercentage = kpiAch.indentOrder > 0 && kpiAch.indentWholesale > 0 ? (kpiAch.indentOrder / kpiAch.indentWholesale) * 100 : 0;
                kpiAch.achievedPercentage = kpiAch.predictedKPIPercentage.toFixed(2);
                this.selectedProduct.kpiAchivement[i] = kpiAch;
                this.selectedProdKpiTargets = this.productKpiTargetInfo.get(this.selectedProduct.productName);
                var kpiTarget = this.selectedProdKpiTargets.find(kpi => kpi.kpiId == kpiId);
                this.calculateKpiPayout(kpiId, kpiAch.predictedKPIPercentage, this.selectedProduct, true);
                if (kpiTarget?.isSalesmanIncentive && kpiTarget?.salesPersonTarget != null) {
                    let salesTarget = this.selectedProdKpiTargets.find(kpi => kpi.kpiName.includes('Sales Person'));
                    if (salesTarget) {
                        this.calculateKpiPayout(salesTarget.kpiId, 0, this.selectedProduct, true);
                    }
                }
                this.calculateTotalVolume();
                this.calculateAddIncentivePayout(this.selectedProduct, true);
                this.ceRatioPayout(this.selectedProduct, true);
                this.calculateGrowthIncentivePayout(this.selectedProduct, true);
                this.calculateMultiKPIIncentive(this.selectedProduct, true);
                this.selectedProduct.earningRetailLoss = 0;
                this.selectedProduct.earningPotential = 0;
                let prodObj = {
                    product: this.selectedProduct,
                    configuredProducts: this.configuredProducts,
                    productKpiTargetInfo: this.productKpiTargetInfo,
                    productVolumeTargetInfo: this.productVolumeTargetInfo,
                    productKpiPayoutInfo: this.productKpiPayoutInfo,
                    addkpiTargetInfo: this.addkpiTargetInfo,
                    dealerRegion: this.dealerRegion,
                    grandTotalVolume: this.grandTotalVolume,
                    grandTotalActual: this.grandTotalActual
                };
                prodObj = calculateMaximizeEarnings(prodObj);
                this.selectedProduct = prodObj.product;
                this.selectedProduct = this.calculateTIVEarnings(this.selectedProduct);
                this.configuredProducts = prodObj.configuredProducts;
                this.productsAndPayout.set(this.selectedProduct.productName, this.selectedProduct);
                this.groupedAchievements = calculateTotalProdEarnings(this.configuredProducts);
                this.selectAdditionalProduct();
                this.calculateAddProductTotal();
                this.addGrandTotalPayout = this.calculateAddGrandTotal('additionalPredictedPayout');
                this.growthGrandTotalPayout = this.calculateAddGrandTotal('growthPredictedPayout');
                this.multiKpiGrandTotalPayout = this.calculateAddGrandTotal('multiKpiPredictedPayout');
                this.totalAddGrandTotalPayout = this.calculateAddGrandTotal('totalAddPredictedPayout');
                this.calculateGrandTotal(false);
                break;
            }
        }
    }

    handleBlur(event) {
        let achieved = event.target.value;
        if (!achieved || isNaN(achieved)) {
            achieved = 0;
        }
    }


    calculateKpiPayout(kpiId, achieved, product, isCalcOrTarget) {
        let kpiTar;
        if (this.selectedProdKpiTargets && this.selectedProdKpiTargets?.length > 0) {
            kpiTar = this.selectedProdKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        let kpiIndex = product.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        if (kpiIndex >= 0) {
            var demoTarget = product.demoTarget;
            let achPercent = achieved;
            if (kpiTar && !kpiTar.kpiName.includes('Sales Person')) {
                if (kpiTar.hasSlabs && kpiTar.slabInfo?.length > 0) {
                    var slabs = kpiTar.slabInfo?.filter(slab => slab.slabType == null);
                    let isEligible = false;
                    if (achPercent > 0) {
                        for (let i = 0; i < slabs?.length; i++) {
                            if (validateTargetConditon(slabs[i].slabRange, achPercent)) {
                                isEligible = true;
                                if (slabs[i].payoutMode != 'Amt') {
                                    if (slabs[i].payoutMode != 'proRata') {
                                        let percent = slabs[i].payoutPercentage > 0 ? parseFloat(slabs[i].payoutPercentage) / 100 : 0;
                                        if (isCalcOrTarget) {
                                            product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * percent).toFixed(2));
                                            product = this.calculateSubProdPayout(percent, kpiId, product);
                                        } else {
                                            product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * percent).toFixed(2));
                                        }
                                    } else {
                                        let kpiTarget = product.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpiId);
                                        if (isCalcOrTarget) {
                                            let proRataPercent = kpiTarget ? kpiTarget.predictedKPIPercentage > 0 ? parseFloat(kpiTarget.predictedKPIPercentage) / 100 : 0 : 0;
                                            product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * proRataPercent).toFixed(2));
                                            product = this.calculateSubProdPayout(proRataPercent, kpiId, product);
                                        } else {
                                            let proRataPercent = kpiTarget ? kpiTarget.targetPercentage > 0 ? parseFloat(kpiTarget.targetPercentage) / 100 : 0 : 0;
                                            product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * proRataPercent).toFixed(2));
                                        }
                                    }
                                } else {
                                    if (isCalcOrTarget) {
                                        product.kpiPayouts[kpiIndex].payoutAmount = parseFloat(product.totalRetail * slabs[i].amount);
                                    } else {
                                        product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat(product.totalRetailTarget * slabs[i].amount);
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (!isEligible) {
                        if (isCalcOrTarget) {
                            product.kpiPayouts[kpiIndex].payoutAmount = 0;
                        } else {
                            product.kpiPayouts[kpiIndex].targetPayoutAmount = 0;
                        }
                    }
                } else {
                    if (kpiTar.target && achPercent > 0) {
                        if (validateTargetConditon(kpiTar.target, achPercent)) {
                            if (isCalcOrTarget) {
                                product.kpiPayouts[kpiIndex].payoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                            } else {
                                product.kpiPayouts[kpiIndex].targetPayoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                            }
                        } else {
                            product.kpiPayouts[kpiIndex].payoutAmount = 0;
                            product.kpiPayouts[kpiIndex].targetPayoutAmount = 0;
                        }
                    } else if (kpiTar && kpiTar.kpiName.includes('Demo')) {
                        var expr;
                        if (demoTarget > 0 && achieved > 0 && isCalcOrTarget) {
                            expr = '>=' + demoTarget;
                            if (validateTargetConditon(expr, achieved)) {
                                product.kpiPayouts[kpiIndex].payoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                            } else {
                                product.kpiPayouts[kpiIndex].payoutAmount = 0;
                            }
                        } else if (demoTarget > 0 && !isCalcOrTarget) {
                            product.kpiPayouts[kpiIndex].targetPayoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                        } else {
                            product.kpiPayouts[kpiIndex].payoutAmount = 0;
                            product.kpiPayouts[kpiIndex].targetPayoutAmount = 0;
                        }
                    } else {
                        product.kpiPayouts[kpiIndex].payoutAmount = 0;
                        product.kpiPayouts[kpiIndex].targetPayoutAmount = 0;
                    }
                }
            } else if (kpiTar && kpiTar.kpiName.includes('Sales Person')) {
                let salesKpiTarget = this.selectedProdKpiTargets.find(kpi => kpi.isSalesmanIncentive && kpi.salesPersonTarget != null);
                if (salesKpiTarget) {
                    let kpiAch = product.kpiAchivement.find(kpi => kpi.kpiId == salesKpiTarget.kpiId);
                    if (kpiAch) {
                        let salesTarget = extractTargetNumValue(salesKpiTarget.salesPersonTarget, true);
                        let salesAchieved;
                        if (isCalcOrTarget) {
                            salesAchieved = kpiAch.predictedKPIPercentage > 0 && salesTarget > 0 ? (kpiAch.predictedKPIPercentage / salesTarget) * 100 : 0;
                        } else {
                            salesAchieved = kpiAch.targetPercentageCalc > 0 && salesTarget > 0 ? (kpiAch.targetPercentageCalc / salesTarget) * 100 : 0;
                        }
                        if (salesKpiTarget.slabInfo?.length > 0) {
                            let slabs = salesKpiTarget.slabInfo;
                            let isEligible = false;
                            if (salesAchieved > 0) {
                                for (let s = 0; s < slabs?.length; s++) {
                                    if (slabs[s].slabType == 'Salesperson Incentive') {
                                        if (validateTargetConditon(slabs[s].slabRange, salesAchieved)) {
                                            isEligible = true;
                                            if (slabs[s].payoutMode != 'Amt') {
                                                if (slabs[s].payoutMode != 'proRata') {
                                                    let percent = slabs[s].payoutPercentage > 0 ? slabs[s].payoutPercentage : 0;
                                                    if (isCalcOrTarget) {
                                                        product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * (parseFloat(percent) / 100)).toFixed(2));
                                                        product = this.calculateSubProdPayout(percent, kpiId, product);
                                                    } else {
                                                        product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * (parseFloat(percent) / 100)).toFixed(2));
                                                    }
                                                } else {
                                                    let achieve = product.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpiId);
                                                    if (isCalcOrTarget) {
                                                        let proRataPercent = achieve ? achieve.predictedKPIPercentage ? parseFloat(achieve.predictedKPIPercentage) / 100 : 0 : 0;
                                                        product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * proRataPercent).toFixed(2));
                                                        product = this.calculateSubProdPayout(proRataPercent, kpiId, product);
                                                    } else {
                                                        let proRataPercent = achieve ? achieve.targetPercentage ? parseFloat(achieve.targetPercentage) / 100 : 0 : 0;
                                                        product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, isCalcOrTarget) * proRataPercent).toFixed(2));
                                                    }
                                                }
                                            } else {
                                                if (isCalcOrTarget) {
                                                    product.kpiPayouts[kpiIndex].payoutAmount = parseFloat(product.totalRetail * slabs[s].amount);
                                                } else {
                                                    product.kpiPayouts[kpiIndex].targetPayoutAmount = parseFloat(product.totalRetailTarget * slabs[s].amount);
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!isEligible) {
                                if (isCalcOrTarget) {
                                    product.kpiPayouts[kpiIndex].payoutAmount = 0;
                                } else {
                                    product.kpiPayouts[kpiIndex].targetPayoutAmount = 0;
                                }
                            }
                        }
                    }
                } else {
                    if (isCalcOrTarget) {
                        product.kpiPayouts[kpiIndex].payoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                    } else {
                        product.kpiPayouts[kpiIndex].targetPayoutAmount = this.getPayoutAmount(kpiId, product, isCalcOrTarget);
                    }
                }
            }
            if (isCalcOrTarget) {
                product.totalProdPredictedPayout = this.calculatePayout(product, 'payoutAmount', true);
                product.totalSPersonPredictedPayout = this.calculatePayout(product, 'payoutAmount', false);
            }
            this.productsAndPayout.set(product.productName, Object.assign({}, product));
        }
    }

    calculateSubProdPayout(percentage, kpiId, product) {
        var subProductPayout = product.subProdKPIPayout.get(kpiId);
        if (subProductPayout) {
            subProductPayout.forEach(sub => {
                sub.payout = parseFloat(sub.payout * percentage);
                return sub;
            })
            product.subProdKPIPayout.set(kpiId, subProductPayout);
        }
        return product;
    }

    getPayoutAmount(kpiId, product, isCalcOrTarget) {
        product.subProdKPIPayout = product.subProdKPIPayout ? product.subProdKPIPayout : new Map();
        var subProducts = product.subProducts;
        var subProductsPayout = this.selectedProdKpiPayout;
        var payoutAmt = 0;
        var subPayout = [];
        subProducts.forEach(subProd => {
            let volume;
            let twoWDVolume;
            let fourWDVolume;
            if (isCalcOrTarget) {
                volume = subProd.volume;
                twoWDVolume = subProd.twoWd;
                fourWDVolume = subProd.fourWd;
            } else {
                volume = subProd.retailTarget;
                twoWDVolume = 0;
                fourWDVolume = 0;
            }
            let kpiPayoutAmount = 0;
            let twoWDPayoutAmount = 0;
            let fourWDPayoutAmount = 0;
            let kpiPayout;
            if (volume) {
                let subProdPayout = subProductsPayout?.length > 0 ? subProductsPayout.find((kpIsbProd) => kpIsbProd.subProductId == subProd.subCategoryId) : null;
                let payoutInfo;
                if (subProdPayout) {
                    payoutInfo = subProdPayout.payoutInfo;
                }
                if (payoutInfo) {
                    kpiPayout = payoutInfo.find(py => py.kpiId == kpiId);
                }
                if (kpiPayout) {
                    if (kpiPayout.variesByRegion && kpiPayout.regionPayout?.length > 0) {
                        let regionPay = kpiPayout.regionPayout.find((regionPay) => regionPay.region == this.dealerRegion);
                        if (regionPay) {
                            if (kpiPayout.variesBy4WD) {
                                twoWDPayoutAmount = regionPay.twoWDPayoutAmount ? regionPay.twoWDPayoutAmount : 0;
                                fourWDPayoutAmount = regionPay.fourWDPayoutAmount ? regionPay.fourWDPayoutAmount : 0;
                                if (isCalcOrTarget) {
                                    payoutAmt += twoWDVolume > 0 ? twoWDVolume * twoWDPayoutAmount : 0;
                                    payoutAmt += fourWDVolume > 0 ? fourWDVolume * fourWDPayoutAmount : 0;
                                    let subAmt = twoWDVolume > 0 ? twoWDVolume * twoWDPayoutAmount : 0;
                                    subAmt += fourWDVolume > 0 ? fourWDVolume * fourWDPayoutAmount : 0;
                                    subPayout.push({ 'subProductId': subProd.subCategoryId, 'payout': subAmt });
                                } else {
                                    payoutAmt += volume * twoWDPayoutAmount;
                                }
                            } else {
                                kpiPayoutAmount = regionPay.amount ? regionPay.amount : 0;
                                payoutAmt += volume * kpiPayoutAmount;
                                if (isCalcOrTarget) {
                                    let subAmt = volume > 0 ? volume * kpiPayoutAmount : 0;
                                    subPayout.push({ 'subProductId': subProd.subCategoryId, 'payout': subAmt });
                                }
                            }
                        }
                    } else {
                        if (kpiPayout.variesBy4WD) {
                            kpiPayoutAmount = 0;
                            twoWDPayoutAmount = kpiPayout.twoWDPayoutAmount ? kpiPayout.twoWDPayoutAmount : 0;
                            fourWDPayoutAmount = kpiPayout.fourWDPayoutAmount ? kpiPayout.fourWDPayoutAmount : 0;
                            if (isCalcOrTarget) {
                                payoutAmt += twoWDVolume > 0 ? twoWDVolume * twoWDPayoutAmount : 0;
                                payoutAmt += fourWDVolume > 0 ? fourWDVolume * fourWDPayoutAmount : 0;
                                let subAmt = twoWDVolume > 0 ? twoWDVolume * twoWDPayoutAmount : 0;
                                subAmt += fourWDVolume > 0 ? fourWDVolume * fourWDPayoutAmount : 0;
                                subPayout.push({ 'subProductId': subProd.subCategoryId, 'payout': subAmt });
                            } else {
                                payoutAmt += volume * twoWDPayoutAmount;
                            }
                        } else {
                            twoWDPayoutAmount = 0;
                            fourWDPayoutAmount = 0;
                            kpiPayoutAmount = kpiPayout.payoutAmount ? kpiPayout.payoutAmount : 0;
                            payoutAmt += volume * kpiPayoutAmount;
                            if (isCalcOrTarget) {
                                let subAmt = volume > 0 ? volume * kpiPayoutAmount : 0;
                                subPayout.push({ 'subProductId': subProd.subCategoryId, 'payout': subAmt });
                            }
                        }
                    }
                }
            }
        });
        if (isCalcOrTarget) product.subProdKPIPayout.set(kpiId, subPayout);
        return payoutAmt;
    }


    downloadReport() {
        this.isLoading = true;
        getPdfcontent({ month: this.month, year: this.year, dealerId: this.accountDet.Id })
            .then((res) => {
                this.reportUrl = res;
                const link = document.createElement('a');
                link.href = this.reportUrl.split('+++')[1];
                link.target = '_blank';
                link.download = 'Incentive Payout Report';
                link.click();
                setTimeout(() => {
                    this.deleteIds();
                }, 6000);
                this.isLoading = false;
            })
            .catch((e) => {
                this.isLoading = false;
            })
    }
    deleteIds() {
        deleteContentDocuments({ contentDocumentId: this.reportUrl.split('+++')[0] })
            .then((res) => {

            })
            .catch((err) => {

            })
    }

    handleSave() {
        this.isLoading = true;
        try {
            var productInfos = [];
            for (let [key, value] of this.productsAndPayout) {
                var productTargetInfo = {};
                productTargetInfo.productId = this.productVolumeTargetInfo.get(value.productName).productId;
                productTargetInfo.productName = this.productVolumeTargetInfo.get(value.productName).productName;
                productTargetInfo.productTargetAndAchievementId = this.productVolumeTargetInfo.get(value.productName).productTargetAndAchievementId;
                productTargetInfo.subTargetAndAchievement = Object.assign([], this.productVolumeTargetInfo.get(value.productName).subTargetAndAchievement);
                productTargetInfo.productKPIAndAchievements = this.productVolumeTargetInfo.get(value.productName).productKPIAndAchievements;
                productTargetInfo.totalRetailTarget = this.productVolumeTargetInfo.get(value.productName).totalRetailTarget;
                productTargetInfo.totalProductPredictedPayout = value.totalProdPredictedPayout;
                productTargetInfo.totalPredictedPayout = value.totalPredictedPayout;
                productTargetInfo.totalRetailPredicted = value.totalRetail;
                productTargetInfo.total4WDRetailPredicted = value.total4WDRetail;
                productTargetInfo.total2WDRetailPredicted = value.total2WDRetail;
                productTargetInfo.incentiveStatusPredicted = value.isStockPredicted ? 'Eligible' : 'InEligible';
                productTargetInfo.totalSPersonPredictedPayout = value.totalSPersonPredictedPayout;
                productTargetInfo.ceRatioPredictedPayout = value.ceRatioPredictedPayout;
                productTargetInfo.totalDealerPredictedPayout = value.totalDealerPredictedPayout;
                productTargetInfo.additionalPredictedPayout = value.additionalPredictedPayout;
                productTargetInfo.growthPredictedPayout = value.growthPredictedPayout;
                productTargetInfo.multiKpiPredictedPayout = value.multiKpiPredictedPayout;
                productTargetInfo.totalTIVPredictedPayout = value.totalTIVPredictedPayout;
                productTargetInfo.demoConductedPredicted = value.demoConductedPredicted;
                let addPayout = this.addKPITargetAndPayout.find(addKPI => addKPI.productId == productTargetInfo.productId);
                if (addPayout) {
                    productTargetInfo.totalAddPredictedPayout = addPayout.totalAddPredictedPayout;
                }
                value.subProducts.forEach(sub => {
                    for (let i = 0; i < productTargetInfo.subTargetAndAchievement?.length; i++) {
                        let subProd = productTargetInfo.subTargetAndAchievement[i];
                        if (sub.subCategoryId == subProd.subProductId) {
                            var subTarget = {};
                            subTarget.subCategoryRetailTarget = productTargetInfo.subTargetAndAchievement[i].subCategoryRetailTarget;
                            subTarget.subProductId = productTargetInfo.subTargetAndAchievement[i].subProductId;
                            subTarget.subProductName = productTargetInfo.subTargetAndAchievement[i].subProductName;
                            subTarget.subTargetAndAchievementId = productTargetInfo.subTargetAndAchievement[i].subTargetAndAchievementId;
                            subTarget.subCategoryRetailPredicted = sub.volume;
                            subTarget.fourWDRetailPredicted = sub.fourWd;
                            subTarget.twoWDRetailPredicted = sub.twoWd;
                            subTarget.subCategoryPredictedPayout = 0;
                            subTarget.subCategoryAddPredictedPayout = value.subAddKPIPayout.get(subTarget.subProductId);
                            if (value.subProdKPIPayout) {
                                for (let [key, subTar] of value.subProdKPIPayout) {
                                    for (let m = 0; m < subTar?.length; m++) {
                                        if (subTar[m].subProductId == subTarget.subProductId) {
                                            subTarget.subCategoryPredictedPayout += parseFloat(subTar[m].payout);
                                            break;
                                        }
                                    }
                                }
                                subTarget.subCategoryPredictedPayout = parseFloat(subTarget.subCategoryPredictedPayout).toFixed(2);
                            }
                            productTargetInfo.subTargetAndAchievement[i] = subTarget;
                            break;
                        }
                    }
                });
                var productKPIAndAchievements = [];
                this.prodAndKpIData[value.productName].forEach(kpi => {
                    var kpiAch = {};
                    let kpiAchieve = value.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpi.KPI__c);
                    let kpiPay = value.kpiPayouts.find((kpiPay) => kpiPay.kpiId == kpi.KPI__c);
                    if (productTargetInfo.productKPIAndAchievements && productTargetInfo.productKPIAndAchievements?.length > 0) {
                        let isExist = false;
                        for (let j = 0; j < productTargetInfo.productKPIAndAchievements?.length; j++) {
                            if (productTargetInfo?.productKPIAndAchievements[j]?.productKPI?.productKPIId == kpi.Id) {
                                let achieve = productTargetInfo.productKPIAndAchievements[j];
                                kpiAch.kpiAchievementId = achieve.kpiAchievementId;
                                kpiAch.predictedKPIPercentage = kpiAchieve ? kpiAchieve.predictedKPIPercentage : 0;
                                kpiAch.quarterPredictedPercentage = kpiAchieve ? kpiAchieve.quarterPredictedPercentage : 0;
                                kpiAch.ceRatioPredictedPayout = kpiPay ? kpiPay.ceRatioPredictedPayout : 0;
                                kpiAch.ceRatioYTDPredictedPayout = kpiPay ? kpiPay.ceRatioYTDPredictedPayout : 0;
                                kpiAch.predictedKPIPayout = kpiPay ? kpiPay.payoutAmount : 0;
                                kpiAch.productTargetandAchivementId = productTargetInfo.productTargetAndAchievementId;
                                kpiAch.productKPI = achieve.productKPI;
                                if (kpiAchieve?.isIndent) {
                                    kpiAch.indentOrder = kpiAchieve.indentOrder;
                                    kpiAch.indentWholesale = kpiAchieve.indentWholesale;
                                }
                                if (addPayout) {
                                    let kpiPayout = addPayout.kpiPayouts.find(kpiPay => kpiPay.kpiId == kpi.KPI__c);
                                    if (kpiPayout) {
                                        kpiAch.addPredictedKPIPayout = kpiPayout.addPredictedKPIPayout;
                                        kpiAch.growthPredictedKPIPayout = kpiPayout.growthPredictedPayout;
                                    }
                                }
                                let prod = this.calculatedProducts.find(prod => prod.productName == key);
                                if (prod?.kpiAchievement?.length > 0) {
                                    let kpiAchieve = prod.kpiAchievement.find(achieve => achieve.kpiId == kpi.KPI__c);
                                    kpiAch.predictedPotentialAmount = kpiAchieve ? kpiAchieve.earningPotentialCalc : 0;
                                }
                                isExist = true;
                                break;
                            }
                        }
                        if (!isExist) {
                            kpiAch.productTargetandAchivementId = productTargetInfo.productTargetAndAchievementId;
                            kpiAch.predictedKPIPercentage = kpiAchieve ? kpiAchieve.predictedKPIPercentage : 0;
                            kpiAch.quarterPredictedPercentage = kpiAchieve ? kpiAchieve.quarterPredictedPercentage : 0;
                            kpiAch.predictedKPIPayout = kpiPay ? kpiPay.payoutAmount : 0;
                            kpiAch.ceRatioPredictedPayout = kpiPay ? kpiPay.ceRatioPredictedPayout : 0;
                            kpiAch.ceRatioYTDPredictedPayout = kpiPay ? kpiPay.ceRatioYTDPredictedPayout : 0;
                            var kpiInfo = { productKPIId: kpi.Id, kpiId: kpi.KPI__c, productId: kpi.Product_Category__c };
                            kpiAch.productKPI = kpiInfo;
                            if (kpiAchieve?.isIndent) {
                                kpiAch.indentOrder = kpiAchieve.indentOrder;
                                kpiAch.indentWholesale = kpiAchieve.indentWholesale;
                            }
                        }
                    } else {
                        kpiAch.productTargetandAchivementId = productTargetInfo.productTargetAndAchievementId;
                        kpiAch.predictedKPIPercentage = kpiAchieve ? kpiAchieve.predictedKPIPercentage : 0;
                        kpiAch.quarterPredictedPercentage = kpiAchieve ? kpiAchieve.quarterPredictedPercentage : 0;
                        kpiAch.predictedKPIPayout = kpiPay ? kpiPay.payoutAmount : 0;
                        kpiAch.ceRatioPredictedPayout = kpiPay ? kpiPay.ceRatioPredictedPayout : 0;
                        kpiAch.ceRatioYTDPredictedPayout = kpiPay ? kpiPay.ceRatioYTDPredictedPayout : 0;
                        var kpiInfo = { productKPIId: kpi.Id, kpiId: kpi.KPI__c, productId: kpi.Product_Category__c };
                        kpiAch.productKPI = kpiInfo;
                        if (kpiAchieve?.isIndent) {
                            kpiAch.indentOrder = kpiAchieve.indentOrder;
                            kpiAch.indentWholesale = kpiAchieve.indentWholesale;
                        }
                    }
                    productKPIAndAchievements.push(kpiAch);
                })
                productTargetInfo.productKPIAndAchievements = productKPIAndAchievements;
                productTargetInfo.dealerIncentiveId = this.productVolumeTargetInfo.get(value.productName).dealerIncentiveId;
                productInfos.push(productTargetInfo);
            }
            this.incRecord.totalRetailPredicted = this.grandTotalVolume;
            this.incRecord.totalProdPayoutPredicted = this.prodGrandTotalPayout;
            this.incRecord.totalAddPayoutPredicted = this.totalAddGrandTotalPayout;
            this.incRecord.totalSPersonPayoutPredicted = this.salesPersonGrandTotal;
            this.incRecord.totalDealerPayoutPredicted = this.dealerGrandTotalPayout;
            this.incRecord.totalPayoutPredicted = parseFloat(this.grandTotalPayout);
            this.incRecord.additionalPredictedPayout = parseFloat(this.addGrandTotalPayout);
            this.incRecord.growthPayoutPredicted = parseFloat(this.growthGrandTotalPayout);
            this.incRecord.multiKpiPayoutPredicted = parseFloat(this.multiKpiGrandTotalPayout);
            this.incRecord.totalTIVPayoutPredicted = parseFloat(this.tivGrandTotalPayout);
            saveIncentiveCalculations({ productInfos: productInfos, incentiveRec: this.incRecord }).then((result) => {
                if (result == 'SUCCESS') {
                    this.isLoading = false;
                    this.showToast('Dealer Incentive Updated Successfully !', 'success');
                    this.handleCheckIncentive();
                    this.isDownloadButtonEnabled = false;
                } else {
                    this.isLoading = false;
                }
            }).catch(error => {
                this.isLoading = false;
                this.showToast('An error occurred while saving the calculations. Please contact your system administrator for assistance !', 'error');
            })
        } catch (error) {
            console.error('save error ', error);
        }
    }

    handleAddSelection(event) {
        this.isAddIncentive = true;
        this.hasProduct = true;
        const activeCell = this.template.querySelector('.active');
        if (activeCell) {
            activeCell.classList.remove('active');
        }
        const targetCell = event.target.closest('td');
        if (targetCell) {
            targetCell.classList.add('active');
        }
    }

    calculateAddIncentivePayout(product, isCalcOrTarget) {
        this.selectedAddKpiTargets = this.addkpiTargetInfo.get(product.productName);
        product.kpiAchivement.forEach(kpiAch => {
            if (isCalcOrTarget) {
                product = this.calculateAddKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
            } else {
                product = this.calculateAddKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
                product = this.calculateAddKpiPayout(kpiAch.kpiId, kpiAch.targetPercentageCalc, product, false);
            }
        })
        return product;
    }

    calculateGrowthIncentivePayout(product, isCalcOrTarget) {
        this.selectedGrowthKpiTargets = this.growthKPITargetInfo.get(product.productName);
        product.kpiAchivement.forEach(kpiAch => {
            if (isCalcOrTarget) {
                this.calculateGrowthKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
            } else {
                this.calculateGrowthKpiPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
                this.calculateGrowthKpiPayout(kpiAch.kpiId, kpiAch.targetPercentageCalc, product, false);
            }
        })
    }

    ceRatioPayout(product, isCalcOrTarget) {
        this.selectedCERatioKpiTargets = this.ceTargetinfo.get(product.productName);
        product.kpiAchivement.forEach(kpiAch => {
            if(kpiAch.kpiName == 'Product To CE Ratio'){
                if (isCalcOrTarget) {
                    this.calculateCERatioPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
                } else {
                    this.calculateCERatioPayout(kpiAch.kpiId, kpiAch.predictedKPIPercentage, product, true);
                    this.calculateCERatioPayout(kpiAch.kpiId, kpiAch.targetPercentageCalc, product, false);
                }
            }
        })
        return product;
    }

    setupAddIncentiveData() {
        for (let [key, value] of this.productsAndPayout) {
            if (this.addkpiTargetInfo.get(key)) {
                this.calculateAddIncentivePayout(value, false);
            }
            if (this.growthKPITargetInfo.get(key)) {
                this.calculateGrowthIncentivePayout(value, false);
            }

            if (this.ceTargetinfo.get(key)) {
                this.ceRatioPayout(value, false);
            }

            if (this.addMultiKpiTargetInfo.get(key)) {
                this.calculateMultiKpiPayout(value, false);
                this.calculateMultiKpiPayout(value, true);
            }
        }
        this.selectAdditionalProduct();
        this.addGrandTotalPayout = this.calculateAddGrandTotal('additionalPredictedPayout');
        this.growthGrandTotalPayout = this.calculateAddGrandTotal('growthPredictedPayout');
        this.multiKpiGrandTotalPayout = this.calculateAddGrandTotal('multiKpiPredictedPayout');
        this.calculateAddProductTotal();
        this.totalAddGrandTotalPayout = this.calculateAddGrandTotal('totalAddPredictedPayout');
        this.addGrandTotalPayoutTarget = this.calculateAddGrandTotal('totalAddTargetPayout');
    }


    calculateAddKpiPayout(kpiId, achieved, product, isCalcOrTarget) {
        var kpiTar;
        if (this.selectedAddKpiTargets && this.selectedAddKpiTargets?.length > 0) {
            kpiTar = this.selectedAddKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        let kpiIndex = product.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        if (kpiIndex >= 0) {
            if (kpiTar) {
                if (kpiTar.hasSlabs && kpiTar.slabInfo?.length > 0) {
                    var slabs = kpiTar.slabInfo;
                    let isEligible = false;
                    if (achieved > 0) {
                        for (let i = 0; i < slabs?.length; i++) {
                            if (validateTargetConditon(slabs[i].slabRange, achieved)) {
                                if (isCalcOrTarget) {
                                    product.kpiPayouts[kpiIndex].addPredictedKPIPayout = parseFloat(this.grandTotalVolume * slabs[i].amount);
                                    this.calculateAddSubPayout(slabs[i].amount, kpiTar?.productKPI?.productKPIId, slabs[i].allMachineRetail ? 'All' : product.productName);
                                } else {
                                    product.kpiPayouts[kpiIndex].addTargetKPIPayout = parseFloat(this.grandTotalTarget * slabs[i].amount);
                                }
                                isEligible = true;
                                break;
                            }
                        }
                    }
                    if (!isEligible) {
                        if (isCalcOrTarget) {
                            product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                            this.calculateAddSubPayout(0, kpiTar.productKPI?.productKPIId, 'All');
                        } else {
                            product.kpiPayouts[kpiIndex].addTargetKPIPayout = 0;
                        }
                    }
                } else {
                    if (kpiTar.target && achieved) {
                        let percentage;
                        if (kpiTar.kpiName.includes('Demo')) {
                            percentage = product.demoTarget > 0 && achieved > 0 ? achieved / product.demoTarget * 100 : 0;
                        } else {
                            percentage = achieved;
                        }
                        if (validateTargetConditon(kpiTar.target, percentage)) {
                            if (isCalcOrTarget) {
                                product.kpiPayouts[kpiIndex].addPredictedKPIPayout = parseFloat(this.grandTotalVolume * kpiTar.incentiveAmount);
                                this.calculateAddSubPayout(kpiTar.incentiveAmount, kpiTar.productKPI?.productKPIId, 'All');
                            } else {
                                product.kpiPayouts[kpiIndex].addTargetKPIPayout = parseFloat(this.grandTotalTarget * kpiTar.incentiveAmount);
                            }
                        } else if (kpiTar.machineTarget?.length > 0) {
                            let predictedDiff;
                            let targetDiff;
                            if (kpiTar.kpiName == 'Volume Incentive') {
                                predictedDiff = product.totalRetail - product.totalRetailTarget;
                                targetDiff = product.totalRetailTarget - product.totalRetailTarget;
                            } else {
                                predictedDiff = achieved - product.demoTarget;
                                targetDiff = product.demoTarget - product.demoTarget;
                            }
                            let isEligible = false;
                            if (percentage > 0) {
                                for (let m = 0; m < kpiTar.machineTarget?.length; m++) {
                                    if (isCalcOrTarget) {
                                        if (validateTargetConditon(kpiTar.machineTarget[m].slabRange, predictedDiff)) {
                                            isEligible = true;
                                            product.kpiPayouts[kpiIndex].addPredictedKPIPayout = parseFloat(this.grandTotalVolume * kpiTar.machineTarget[m].amount);
                                            this.calculateAddSubPayout(kpiTar.machineTarget[m].amount, kpiTar.productKPI?.productKPIId, 'All');
                                            break;
                                        }
                                    } else {
                                        if (validateTargetConditon(kpiTar.machineTarget[m].slabRange, targetDiff)) {
                                            product.kpiPayouts[kpiIndex].addTargetKPIPayout = parseFloat(this.grandTotalTarget * kpiTar.machineTarget[m].amount);
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!isEligible) {
                                if (isCalcOrTarget) {
                                    product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                                    this.calculateAddSubPayout(0, kpiTar.productKPI?.productKPIId, 'All');
                                } else {
                                    product.kpiPayouts[kpiIndex].addTargetKPIPayout = 0;
                                }
                            }
                        } else {
                            if (isCalcOrTarget) {
                                product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                                this.calculateAddSubPayout(0, kpiTar.productKPI?.productKPIId, 'All');
                            } else {
                                product.kpiPayouts[kpiIndex].addTargetKPIPayout = 0;
                            }
                        }
                    } else {
                        if (isCalcOrTarget) {
                            product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                            this.calculateAddSubPayout(0, kpiTar.productKPI?.productKPIId, 'All');
                        } else {
                            product.kpiPayouts[kpiIndex].addTargetKPIPayout = 0;
                        }
                    }
                }
            } else {
                if (isCalcOrTarget) {
                    product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                    this.calculateAddSubPayout(0, kpiTar?.productKPI?.productKPIId, 'All');
                } else {
                    product.kpiPayouts[kpiIndex].addTargetKPIPayout = 0;
                }
            }
            if (isCalcOrTarget) {
                product.additionalPredictedPayout = this.calculatePayout(product, 'addPredictedKPIPayout', true);
            } else {
                product.totalAddTargetPayout = this.calculatePayout(product, 'addTargetKPIPayout', true);
            }
            this.productsAndPayout.set(product.productName, Object.assign({}, product));
        }
        return product;
    }

    calculateGrowthKpiPayout(kpiId, achieved, product, isCalcOrTarget) {
        var kpiTar;
        if (this.selectedGrowthKpiTargets && this.selectedGrowthKpiTargets?.length > 0) {
            kpiTar = this.selectedGrowthKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        let kpiIndex = product.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        if (kpiIndex >= 0) {
            if (kpiTar) {
                let prevDealer = this.prevDealers?.length > 0 ? this.prevDealers.find(dealer => dealer.month == kpiTar.prevMonth) : {};
                if (prevDealer?.productTargetsAndAchievements) {
                    let prevProdTarget = prevDealer.productTargetsAndAchievements.find(prod => prod.productId == product.productId);
                    if (prevProdTarget?.productKPIAndAchievements) {
                        let kpiAch = prevProdTarget.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == kpiId);
                        if (kpiAch) {
                            let growthDiff = achieved ? achieved - kpiAch.achievedKPIPerncentage : 0;
                            if (kpiTar.hasSlabs && kpiTar.slabInfo?.length > 0) {
                                var slabs = kpiTar.slabInfo;
                                let isEligible = false;
                                for (let i = 0; i < slabs?.length; i++) {
                                    if (validateTargetConditon(slabs[i].slabRange, kpiAch.achievedKPIPerncentage) && validateTargetConditon(slabs[i].growthRange, growthDiff)) {
                                        if (isCalcOrTarget) {
                                            product.kpiPayouts[kpiIndex].growthPredictedPayout = parseFloat(this.grandTotalVolume * slabs[i].amount);
                                        } else {
                                            product.kpiPayouts[kpiIndex].growthTargetPayout = parseFloat(this.grandTotalTarget * slabs[i].amount);
                                        }
                                        isEligible = true;
                                        break;
                                    }
                                }
                                if (!isEligible) {
                                    if (isCalcOrTarget) {
                                        product.kpiPayouts[kpiIndex].growthPredictedPayout = 0;
                                    } else {
                                        product.kpiPayouts[kpiIndex].growthTargetPayout = 0;
                                    }
                                }
                            } else {
                                if (isCalcOrTarget) {
                                    product.kpiPayouts[kpiIndex].growthPredictedPayout = 0;
                                } else {
                                    product.kpiPayouts[kpiIndex].growthTargetPayout = 0;
                                }
                            }
                        }
                    }
                }
            } else {
                if (isCalcOrTarget) {
                    product.kpiPayouts[kpiIndex].growthPredictedPayout = 0;
                } else {
                    product.kpiPayouts[kpiIndex].growthTargetPayout = 0;
                }
            }
            if (isCalcOrTarget) {
                product.growthPredictedPayout = this.calculatePayout(product, 'growthPredictedPayout', true);
            } else {
                product.growthTargetPayout = this.calculatePayout(product, 'growthTargetPayout', true);
            }
            this.productsAndPayout.set(product.productName, Object.assign({}, product));
        }
    }

    // calculateAddSubPayout(amount) {
    //     for (let [key, value] of this.productsAndPayout) {
    //         let subAddPayout = value.subAddKPIPayout
    //         value.subProducts.forEach(ele => {
    //             let payout = subAddPayout.get(ele.subCategoryId) ? subAddPayout.get(ele.subCategoryId) : 0;
    //             payout += ele.volume * amount;
    //             subAddPayout.set(ele.subCategoryId, payout);
    //         })
    //         value.subAddKPIPayout = subAddPayout;
    //     }
    // }

    calculateCERatioPayout(kpiId, achieved, product, isCalcOrTarget) {
        var kpiTar;
        if (this.selectedCERatioKpiTargets && this.selectedCERatioKpiTargets?.length > 0) {
            kpiTar = this.selectedCERatioKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        var addKPITar = this.selectedCERatioKpiTargets.find((kpiTar) => kpiTar.type == 'Product To CE Ratio' && kpiTar.target != null && !kpiTar.hasSlabs);
        var addKPIAch = product.kpiAchivement.find(kpiAch => kpiAch.kpiId == addKPITar?.kpiId);

        var addKPIPercentage;
        if(isCalcOrTarget) {
            addKPIPercentage = addKPIAch?.predictedKPIPercentage ? addKPIAch.predictedKPIPercentage : 0;
        } else {
            addKPIPercentage = addKPIAch?.targetPercentageCalc ? addKPIAch.targetPercentageCalc : 0;
        }
        let kpiIndex = product?.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        let prevMonth = this.getMonth(this.month);
        // let previousYear = this.month == 'January' ? this.year - 1 : this.year;
        if (kpiIndex >= 0) {
            if (kpiTar) {
                let prevQuarterMonths = ['October', 'November', 'December'];
                let prevDealer = this.prevDealers?.length > 0 ? this.prevDealers.filter(dealer => prevQuarterMonths.includes(dealer.month) && dealer.year == this.prevYear) : {};
                let prevDealerPayout = this.prevDealers?.length > 0 ? this.prevDealers.find(dealer => dealer.month == prevMonth && dealer.year == this.year) : {};
                if (prevDealer?.length > 0) {
                    // let prevProdTarget = prevDealer.productTargetsAndAchievements.find(prod => prod.productId == product.productId);
                    let prevQPercentage = 0;
                    for(let i = 0; i < prevDealer.length; i++) {
                        let prevProdTarget = prevDealer[i]?.productTargetsAndAchievements.find(prod => prod.productId == product.productId);
                        let kpiAch = prevProdTarget?.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == kpiId);
                        if(kpiAch) {
                            prevQPercentage += kpiAch.achievedKPIPerncentage ? kpiAch.achievedKPIPerncentage : 0;
                        }
                    }
                    prevQPercentage = prevQPercentage / prevDealer.length;
                    // if (prevProdTarget?.productKPIAndAchievements) {
                        // let kpiAch = prevProdTarget.productKPIAndAchievements.find(kpi => kpi.productKPI.kpiId == kpiId);
                        let prevProd = prevDealerPayout?.productTargetsAndAchievements?.find(prod => prod.productId == product.productId);
                        let kpiAchPayout = prevProd?.productKPIAndAchievements?.find(kpi => kpi.productKPI.kpiId == kpiId);
                        let payout = kpiAchPayout?.ceRatioYTDActualPayout || 0;
                        if (prevQPercentage > 0) { // kpiAch
                            achieved = achieved || 0;
                            // let prevQPercentage = kpiAch?.quarterActualPercentage ? kpiAch.quarterActualPercentage : 0;
                            let currentQPercentPredicted = achieved;
                            let growthDiffPredicted = currentQPercentPredicted > 0 ? currentQPercentPredicted - prevQPercentage : 0;
                            
                            if(isCalcOrTarget) {
                                for(let a = 0; a < product.kpiAchivement?.length; a++) {
                                    if(product.kpiAchivement[a].kpiId == kpiId) {
                                        product.kpiAchivement[a].growthDiffPredicted = growthDiffPredicted > 0 ? growthDiffPredicted.toFixed(2) : 0;
                                        product.kpiAchivement[a].quarterPredictedPercentage = currentQPercentPredicted;
                                        let actualAchieved = product.kpiAchivement[a].actualKPIPercentage ? product.kpiAchivement[a].actualKPIPercentage : 0;
                                        let currentQPercentActual = actualAchieved;
                                        product.kpiAchivement[a].growthDiffActual = (currentQPercentActual - prevQPercentage).toFixed(2);
                                        product.kpiAchivement[a].quarterActualPercentage = currentQPercentActual;
                                        product.kpiAchivement[a].prevQuarterActualPercentage = prevQPercentage.toFixed(2);
                                        break;
                                    }
                                }
                            }
                             this.currentQRetail = this.month == 'January' ? product.totalRetail : product.totalRetail > 0 && prevProd.totalRetailAchieved > 0 ? product.totalRetail + prevProd.totalRetailAchieved : product.totalRetail;
                             this.prevPayout = this.month == 'January' ? 0 : kpiAchPayout?.ceRatioYTDActualPayout ? kpiAchPayout?.ceRatioYTDActualPayout : 0;
                        
                            if (kpiTar.hasSlabs && kpiTar.slabInfo?.length > 0) {
                                var slabs = kpiTar.slabInfo;
                                let isEligible = false;
                                if(growthDiffPredicted > 0) {
                                    for (let i = 0; i < slabs?.length; i++) {
                                        if (validateTargetConditon(kpiTar.growth, growthDiffPredicted) && validateTargetConditon(slabs[i].slabRange, growthDiffPredicted)) {
                                            if(addKPITar == null || (addKPITar && addKPITar?.target && addKPIPercentage > 0 && validateTargetConditon(addKPITar?.target, addKPIPercentage))) {
                                                if (isCalcOrTarget) {
                                                    //product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = (this.month == 'January') ? parseFloat(product.totalRetail * slabs[i].amount) : parseFloat((product.totalRetail + prevMonth.product.totalRetail) * slabs[i].amount);
                                                    product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = parseFloat(this.currentQRetail * slabs[i].amount) - this.prevPayout;
                                                    product.kpiPayouts[kpiIndex].ceRatioYTDPredictedPayout = (this.month == 'January') ? product.kpiPayouts[kpiIndex].ceRatioPredictedPayout : payout + product.kpiPayouts[kpiIndex].ceRatioPredictedPayout;
                                                } else {
                                                    product.kpiPayouts[kpiIndex].ceRatioTargetPayout = parseFloat(product.totalRetailTarget * slabs[i].amount);
                                                    //product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = (this.month == 'January') ? parseFloat(product.totalRetail * slabs[i].amount) : parseFloat((product.totalRetail + prevMonth.product.totalRetail) * slabs[i].amount);
                                                }
                                                isEligible = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (!isEligible) {
                                    if (isCalcOrTarget) {
                                        product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = 0 - this.prevPayout;
                                        product.kpiPayouts[kpiIndex].ceRatioYTDPredictedPayout = (this.month == 'January') ? product.kpiPayouts[kpiIndex].ceRatioPredictedPayout : payout + product.kpiPayouts[kpiIndex].ceRatioPredictedPayout;
                                    } else {
                                        product.kpiPayouts[kpiIndex].ceRatioTargetPayout = 0;
                                    }
                                }
                            } else {
                                if (isCalcOrTarget) {
                                    product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = 0 - this.prevPayout;
                                    product.kpiPayouts[kpiIndex].ceRatioYTDPredictedPayout = 0;
                                } else {
                                    product.kpiPayouts[kpiIndex].ceRatioTargetPayout = 0;
                                }
                            }
                        }
                    // }
                }
            } else {
                if (isCalcOrTarget) {
                    product.kpiPayouts[kpiIndex].ceRatioPredictedPayout = 0;
                } else {
                    product.kpiPayouts[kpiIndex].ceRatioTargetPayout = 0;
                }
            }
            if (isCalcOrTarget) {
                product.ceRatioPredictedPayout = this.calculateCERPayout(product, 'ceRatioPredictedPayout', true);
                product.ceRatioYTDPredictedPayout = this.calculateCERPayout(product, 'ceRatioYTDPredictedPayout', true);
            } else {
                product.ceRatioTargetPayout = this.calculateCERPayout(product, 'ceRatioTargetPayout', true);
                product.ceRatioActualPayout = this.calculateCERPayout(product, 'ceRatioActualPayout', true);
                product.ceRatioYTDActualPayout = this.calculateCERPayout(product, 'ceRatioYTDActualPayout', true);
            }
            this.productsAndPayout.set(product.productName, Object.assign({}, product));
        }
        console.log('CE Ratio', product.kpiPayouts);
    }

getMonth(month){
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

    calculateAddSubPayout(amount, productKPIId, productName) {
        for (let [key, value] of this.productsAndPayout) {
            if (productName == key || productName == 'All') {
                let subAddKPIPayout = value.subAddKPIPayout
                let subPayout = subAddKPIPayout.hasOwnProperty(productKPIId) ? subAddKPIPayout[productKPIId] : {};
                value.subProducts.forEach(ele => {
                    subPayout[ele.subCategoryId] = ele?.volume > 0 && amount > 0 ? ele.volume * amount : 0;
                })
                subAddKPIPayout[productKPIId] = subPayout;
                value.subAddKPIPayout = subAddKPIPayout;
            }
        }
    }

    @track noAddIncTargets = false;
    calculateAddGrandTotal(propertyName) {
        var totalPayout = this.addKPITargetAndPayout.reduce((totalPay, kpiPay) => {
            let amt = kpiPay.isStockPredicted && kpiPay.isVisible ? parseFloat(kpiPay[propertyName]) : 0;
            return totalPay + amt;
        }, 0)
        return totalPayout;
    }

    selectAdditionalProduct() {
        this.addKPITargetAndPayout = [];
        for (let [key, value] of this.productsAndPayout) {
            let product = value;
            if (this.noAddIncTargets == false) {
                this.noAddIncTargets = this.addkpiTargetInfo.get(key) ? true : false;
            }
            product.isVisible = this.addkpiTargetInfo.get(key) || this.growthKPITargetInfo.get(key) || this.ceTargetinfo.get(key) ? true : false;
            this.addKPITargetAndPayout.push(product);
        }
        let visible = this.addKPITargetAndPayout.find(prod => prod.isVisible == true);
        this.noAddIncTargets = visible ? true : false;
    }

    calculateTotalPayout(propertyName) {
        var totalPayout = this.addKPITargetAndPayout.reduce((totalPay, kpiPay) => {
            let amt = kpiPay[propertyName] ? kpiPay[propertyName] : 0;
            return totalPay + parseFloat(amt);
        }, 0)
        return totalPayout;
    }

    imageszip = imageZip;
    jcbImg = imageZip + '/Images/BHL.jpg';
    jcbImg1 = imageZip + '/Images/projectedInc.svg';
    jcbImg2 = imageZip + '/Images/actualInc.svg';
    jcbImg3 = imageZip + '/Images/targetInc.svg';
    jcbImg4 = imageZip + '/Images/projected.svg';
    jcbImg5 = imageZip + '/Images/actual.svg';
    jcbImg6 = imageZip + '/Images/target.svg';
    jcbImg7 = imageZip + '/Images/earning.svg';
    addInc = imageZip + '/Images/additionalInc.png';
    backImg = imageZip + '/Images/back.jpg';
    handMoney = imageZip + '/Images/addInc.svg';
    ellipse = imageZip + '/Images/Ellipse.png';
    afterMarketVisible = false;
    activeTab = 'sales';
    isFlipped = false;


    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.id;
        this.template.querySelectorAll('.slds-tabs_default__item').forEach(element => {
            element.classList.remove('slds-active');
        });
        event.currentTarget.parentElement.classList.add('slds-active');
    }

    toggleDiv() {
        this.showDiv = !this.showDiv;
        this.buttonName = this.showDiv == true ? 'Close' : 'Check Details';
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
    }

    get flipClass() {
        return this.isFlipped ? 'flip-card-inner flipped flip-card-inner' : 'flip-card-inner';
    }

    toggleMode(event) {
        let key = event.target.dataset.key;
        this.isLoading = true;
        this.isProjectionMode = key == 'projection' ? true : false;
        this.stockDisabled = !this.isProjectionMode;
        setTimeout(() => {
            this.isLoading = false;
        }, 500);
    }

    getSubProdPayouts(product) {
        let subProductList = product.subProducts;
        for (let i = 0; i < subProductList?.length; i++) {
            subProductList[i].targetRemain = subProductList[i].retailTarget > subProductList[i].volume ? Math.ceil(subProductList[i].retailTarget - subProductList[i].volume) : 0;
            subProductList[i].actualTargetRemain = subProductList[i].retailTarget > subProductList[i].retailActual ? subProductList[i].retailTarget - subProductList[i].retailActual : 0;

            subProductList[i].payoutLoss = subProductList[i].targetRemain != 0 ? Math.ceil(subProductList[i].targetRemain * subProductList[i].payout) : 0;
            subProductList[i].actualPayoutLoss = subProductList[i].actualTargetRemain != 0 ? subProductList[i].actualTargetRemain * subProductList[i].payout : 0;

            subProductList[i].actualShowPayout = subProductList[i].retailActual * subProductList[i].payout ? subProductList[i].payout : 0;
            subProductList[i].targetShowPayout = subProductList[i].retailTarget * subProductList[i].payout ? subProductList[i].payout : 0;

            subProductList[i].showWarningCalc = subProductList[i].targetRemain > 0 && subProductList[i].payoutLoss > 0 && subProductList[i].loss > 0 ? true : false;
            subProductList[i].showWarningActual = subProductList[i].actualTargetRemain > 0 && subProductList[i].actualPayoutLoss > 0 && subProductList[i].actualLoss > 0 ? true : false;

            if (product.productName === 'BHL') {
                let fourWD = subProductList[i].variesBy4WD ? subProductList[i].fourWDPayoutAmount ? subProductList[i].fourWDPayoutAmount : 0 : subProductList[i].payout ? subProductList[i].payout : 0;
                let twoWD = subProductList[i].variesBy4WD ? subProductList[i].twoWDPayoutAmount ? subProductList[i].twoWDPayoutAmount : 0 : subProductList[i].payout ? subProductList[i].payout : 0;
                subProductList[i].showCost4WDTotal = subProductList[i].fourWd * fourWD;
                subProductList[i].showCost4WDActual = subProductList[i].retail4WdActual * fourWD;
                subProductList[i].showCost2WDTotal = subProductList[i].twoWd * twoWD;
                subProductList[i].showCost2WDActual = subProductList[i].retail2WdActual * twoWD;
                subProductList[i].colorProj = subProductList[i].targetRemain > 0 ? 'color: #FF0000; font-weight: 600;' : 'color: #16A42D; font-weight: 600;';
                subProductList[i].colorAct = subProductList[i].actualTargetRemain > 0 ? 'color: #FF0000; font-weight: 600;' : 'color: #16A42D; font-weight: 600;';
            } else {
                subProductList[i].showCostProjTotal = subProductList[i].volume * subProductList[i].payout ? subProductList[i].payout : 0;
                subProductList[i].colorProj = subProductList[i].targetRemain > 0 ? 'color: #FF0000; font-weight: 600;' : 'color: #16A42D; font-weight: 600;';
                subProductList[i].colorAct = subProductList[i].actualTargetRemain > 0 ? 'color: #FF0000; font-weight: 600;' : 'color: #16A42D; font-weight: 600;';
            }
        }
    }

    setPayoutForSubProducts(product) {
        let kpiInfo;
        kpiInfo = product.kpiAchivement.find(name => name.kpiName.includes('Volume'));
        if (kpiInfo) {
            let kpiId = kpiInfo.kpiId;
            for (let k = 0; k < product.subProducts?.length; k++) {
                for (let i = 0; i < this.productTargetPayouts?.length; i++) {
                    if (this.productTargetPayouts[i].productKPI.kpiId == kpiId) {
                        let temp = this.productTargetPayouts[i].productPayouts;
                        for (let j = 0; j < temp?.length; j++) {
                            if (product.subProducts[k].subCategoryId == temp[j].subProductId) {
                                if (temp[j].variesByRegion) {
                                    let amt = temp[j].regionPayout.find(amt => amt.region == this.dealerRegion);
                                    product.subProducts[k].payout = amt ? amt.amount : 0;
                                    product.subProducts[k].twoWDPayoutAmount = amt ? amt.twoWDPayoutAmount ? amt.twoWDPayoutAmount : 0 : 0;
                                    product.subProducts[k].fourWDPayoutAmount = amt ? amt.fourWDPayoutAmount ? amt.fourWDPayoutAmount : 0 : 0;
                                } else {
                                    product.subProducts[k].payout = temp[j].payoutAmount ? temp[j].payoutAmount : 0;
                                    product.subProducts[k].twoWDPayoutAmount = temp[j].twoWDPayoutAmount ? temp[j].twoWDPayoutAmount : 0;
                                    product.subProducts[k].fourWDPayoutAmount = temp[j].fourWDPayoutAmount ? temp[j].fourWDPayoutAmount : 0;
                                }
                                product.subProducts[k].variesBy4WD = temp[j].variesBy4WD;
                                product.subProducts[k].totalRetailPercentage = product.totalRetailPercentage;
                                product.subProducts[k].totalRetailActualPercentage = product.totalRetailActualPercentage;
                                break;
                            }
                        }
                    }
                }
            }
        } else {
            for (let k = 0; k < product.subProducts?.length; k++) {
                product.subProducts[k].payout = 0;
                product.subProducts[k].twoWDPayoutAmount = 0;
                product.subProducts[k].fourWDPayoutAmount = 0;
            }
        }
    }


    //Money Counter Animations JavaScript Handler 
    animateNumber(property, target, duration) {
        const startValue = this[property];
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            this[property] = Math.floor(startValue + (target - startValue) * progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    //Maximize your earnings Carousel JS
    contentTransform = 'transform:translateX(0%)';
    percentage = 0;
    isDisplay = '';
    isVisible = '❯';

    renderedCallback() {
        if (this.percentage === 0) {
            this.updateIndicator();
        }
    }

    showNext() {
        if (this.percentage != (100 * (this.groupedAchievements?.length - 1))) {
            this.percentage += 100;
            this.contentTransform = `transform: translateX(-${this.percentage}%)`;
            this.isDisplay = '❮'; // Update display of previous arrow
            this.updateIndicator();

            if (this.percentage == (100 * (this.groupedAchievements?.length - 1))) {
                this.isVisible = ''; // Hide the next arrow if on the last slide
            }
        }
    }

    showPrev() {
        if (this.percentage != 0) {
            this.percentage -= 100;
            this.contentTransform = `transform: translateX(-${this.percentage}%)`;
            this.isVisible = '❯';
            this.updateIndicator();

            if (this.percentage == 0) {
                this.isDisplay = '';
            }
        }
    }

    updateIndicator() {
        const indicators = this.template.querySelectorAll('.slds-carousel__indicator-action');
        indicators.forEach((indicator, index) => {
            if (index === this.percentage / 100) {
                indicator.classList.add('slds-is-active');
                indicator.style.background = 'black';
            } else {
                indicator.classList.remove('slds-is-active');
                indicator.style.background = 'transparent';
            }
        });
    }

    handleIndicatorClick(event) {
        const index = [...event.target.parentElement.parentElement.children].indexOf(event.target.parentElement);
        this.percentage = index * 100;
        this.contentTransform = `transform: translateX(-${this.percentage}%)`;
        this.updateIndicator();
        if (this.percentage == 0) {
            this.isDisplay = '';
            this.isVisible = '❯';
        } else if (this.percentage == (100 * (this.groupedAchievements?.length - 1))) {
            this.isDisplay = '❮';
            this.isVisible = '';
        } else {
            this.isDisplay = '❮';
            this.isVisible = '❯';
        }
    }

    @track showKpis = true;
    handleShowCost(event) {
        let checkbox = event.target;
        this.isShowCost = checkbox.checked ? true : false;
        this.projectedSc = checkbox.checked ? true : false;
        this.showKpis = checkbox.checked ? false : true;
        this.subcategorySize = checkbox.checked ? "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--8-of-12 subProduct_flex" : "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--6-of-12 subProduct_flex";
        this.kpiSize = checkbox.checked ? "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--4-of-12 subProduct_flex slds-p-top_x-small" : "slds-max-small-size--1-of-1 slds-medium-size--12-of-12 slds-large-size--6-of-12 subProduct_flex slds-p-top_x-small";
        this.summaryClass = checkbox.checked ? "slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_3-of-6 slds-large-size_12-of-12 slds-p-around_xx-small" : "slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_6-of-12 slds-p-around_xx-small";
       // this.summaryCERClass = checkbox.checked ? "slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_3-of-6 slds-large-size_12-of-12 slds-p-around_xx-small" : "slds-grid slds-wrap slds-size_1-of-1 slds-medium-size_12-of-12 slds-large-size_6-of-12 slds-p-around_xx-small";
    }

    handleStockConditionToggle(event) {
        let isChecked = event.target;
        let prodName = event.target.dataset.prod;
        if (isChecked.checked) {
            this.selectedProduct.isStockPredicted = isChecked.checked;
            let prodPayoutdiv = this.template.querySelectorAll(`div[data-prod="${prodName}"]`);
            prodPayoutdiv.forEach(input => {
                input.classList.remove('totalProductpayout');
            });
        } else {
            this.selectedProduct.isStockPredicted = isChecked.checked;
            let prodPayoutdiv = this.template.querySelectorAll(`div[data-prod="${prodName}"]`);
            prodPayoutdiv.forEach(input => {
                input.classList.add('totalProductpayout');
            });
        }
        this.calculateGrandTotal(false);
    }

    //Calculate Total 4WD Retail Volume
    calculate4wdPercentage(product) {
        for (let i = 0; i < product.kpiAchivement?.length; i++) {
            if (product.kpiAchivement[i].kpiName.includes('4WD')) {
                product.kpiAchivement[i].predictedKPIPercentage = product.totalRetail > 0 ? (parseFloat((product.total4WDRetail / product.totalRetail) * 100)).toFixed(0) : 0;
                product.kpiAchivement[i].achievedPercentage = product.kpiAchivement[i].predictedKPIPercentage;
            }
        }
        return product;
    }

    get allSectionNames() {
        return this.calculatedProducts.map(product => product.productName);
    }

    handleKeyPress(event) {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode !== 8 && charCode !== 46 && charCode !== 9 && charCode !== 27 && charCode !== 13 && !(charCode >= 37 && charCode <= 40) && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
        }
    }

    handlePaste(event) {
        event.preventDefault();
    }

    @track configuredProducts = [];
    @track arrowPoiting = false;
    setProductNames() {
        for (let [key, value] of this.productsAndPayout) {
            var product = {};
            product.productName = key;
            this.configuredProducts.push(product);
        }
    }

    handleArrow(event) {
        let id = event.target.dataset.kpid;
        this.arrowPoiting = !this.arrowPoiting;
        let showKpi = this.selectedProduct.kpiAchivement.find(kpi => kpi.productKPIId == id);
        showKpi.showWarning = !showKpi.showWarning;
    }

    setKpiDisplayCard(product) {
        for (let i = 0; i < product.kpiAchivement?.length; i++) {
            product.kpiAchivement[i].showWarning = true;
        }
    }

    @track multiKPIPayouts = new Map();
    calculateMultiKpiIncentivePayout() {
        for (let i = 0; i < this.multiKpiTargetPayouts?.length; i++) {
            let prodName = this.multiKpiTargetPayouts[i]?.productCategory?.name;
            this.addMultiKpiTargetInfo.set(prodName, this.multiKpiTargetPayouts[i].multiKpi);
        }
    }

    calculateMultiKPIIncentive(product, isCalcOrTarget) {
        this.calculateMultiKpiPayout(product, isCalcOrTarget);
    }

    calculateAddProductTotal() {
        for (let i = 0; i < this.addKPITargetAndPayout?.length; i++) {
            this.addKPITargetAndPayout[i].totalAddPredictedPayout = parseFloat(this.addKPITargetAndPayout[i].multiKpiPredictedPayout ? this.addKPITargetAndPayout[i].multiKpiPredictedPayout : 0) + parseFloat(this.addKPITargetAndPayout[i].additionalPredictedPayout) + parseFloat(this.addKPITargetAndPayout[i].growthPredictedPayout ? this.addKPITargetAndPayout[i].growthPredictedPayout : 0);
            this.addKPITargetAndPayout[i].totalAddTargetPayout = parseFloat(this.addKPITargetAndPayout[i].multiKpiTargetPayout ? this.addKPITargetAndPayout[i].multiKpiTargetPayout : 0) + parseFloat(this.addKPITargetAndPayout[i].additionalTargetPayout) + parseFloat(this.addKPITargetAndPayout[i].growthTargetPayout ? this.addKPITargetAndPayout[i].growthTargetPayout : 0);
        }
    }

    calculateMultiKpiPayout(product, isCalcOrTarget) {
        product.multiKpiPredictedPayout = 0;
        this.selectedMultiKpiTargets = this.addMultiKpiTargetInfo.get(product.productName);
        let kpiAch = this.productsAndPayout.get(product.productName)?.kpiAchivement;
        for (let i = 0; i < this.selectedMultiKpiTargets?.length; i++) {
            let slabs = this.selectedMultiKpiTargets[i].multiKpSlabs;
            let conditionList = [];
            for (let j = 0; j < slabs?.length; j++) {
                let kpi = kpiAch.find(kpi => kpi.kpiId == slabs[j].productKPI?.kpiId);
                let achieved;
                if (isCalcOrTarget) {
                    achieved = kpi ? kpi.predictedKPIPercentage : 0;
                } else {
                    achieved = kpi ? kpi.targetPercentageCalc : 0;
                }
                conditionList.push(validateTargetConditon(slabs[j].slabRange, achieved));
            }
            if (conditionList?.length > 0) {
                if (this.selectedMultiKpiTargets[i].conditionLogic == 'AND') {
                    let isAnd = true;
                    for (let k = 0; k < conditionList?.length; k++) {
                        if (!conditionList[k]) {
                            if (isCalcOrTarget) {
                                product.multiKpiPredictedPayout = product.multiKpiPredictedPayout ? product.multiKpiPredictedPayout : 0;
                            } else {
                                product.multiKpiTargetPayout = product.multiKpiTargetPayout ? product.multiKpiTargetPayout : 0;
                            }
                            isAnd = false;
                            break;
                        }
                    }
                    if (isAnd) {
                        let amt;
                        if (isCalcOrTarget) {
                            amt = this.grandTotalVolume > 0 ? this.grandTotalVolume * this.selectedMultiKpiTargets[i].incentiveAmount : 0;
                            product.multiKpiPredictedPayout = product.multiKpiPredictedPayout ? product.multiKpiPredictedPayout + amt : amt;
                        } else {
                            amt = this.grandTotalTarget > 0 ? this.grandTotalTarget * this.selectedMultiKpiTargets[i].incentiveAmount : 0;
                            product.multiKpiTargetPayout = product.multiKpiTargetPayout ? product.multiKpiTargetPayout + amt : amt;
                        }
                    }
                } else if (this.selectedMultiKpiTargets[i].conditionLogic == 'OR') {
                    let isOr = true;
                    for (let k = 0; k < conditionList?.length; k++) {
                        if (conditionList[k]) {
                            let amt;
                            if (isCalcOrTarget) {
                                amt = this.grandTotalVolume > 0 ? this.grandTotalVolume * this.selectedMultiKpiTargets[i].incentiveAmount : 0;
                                product.multiKpiPredictedPayout = product.multiKpiPredictedPayout ? product.multiKpiPredictedPayout + amt : amt;
                            } else {
                                amt = this.grandTotalTarget > 0 ? this.grandTotalTarget * this.selectedMultiKpiTargets[i].incentiveAmount : 0;
                                product.multiKpiTargetPayout = product.multiKpiTargetPayout ? product.multiKpiTargetPayout + amt : amt;
                            }
                            isOr = false;
                            break;
                        }
                    }
                    if (isOr) {
                        if (isCalcOrTarget) {
                            product.multiKpiPredictedPayout = product.multiKpiPredictedPayout ? product.multiKpiPredictedPayout : 0;
                        } else {
                            product.multiKpiTargetPayout = product.multiKpiTargetPayout ? product.multiKpiTargetPayout : 0;
                        }
                    }
                }
            }
        }
        this.productsAndPayout.set(product.productName, Object.assign({}, product));
    }

    handleInputValidation(event) {
        let datatype = event.target.dataset.type;
        if (datatype == 'retail') {
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
        } else if (datatype == 'decimal') {
            event.target.value = event.target.value.replace(/[^0-9.]/g, '');
        }
    }

    handleKeyPressValidation(event) {
        let datatype = event.target.dataset.type;
        if (datatype == 'retail') {
            if (event.key.match(/[^0-9]/)) {
                event.preventDefault();
            }
            if (event.key == '.' && event.target.value.includes('.')) {
                event.preventDefault();
            }
        } else if (datatype == 'decimal') {
            if (event.key.match(/[^0-9.]/)) {
                event.preventDefault();
            }
            if (event.key == '.' && event.target.value.includes('.')) {
                event.preventDefault();
            }
        }

    }

    handlePasteValidation(event) {
        let datatype = event.target.dataset.type;
        if (datatype == 'retail') {
            const clipboardData = event.clipboardData?.getData('text');
            if (clipboardData?.match(/[^0-9]/)) {
                event.preventDefault();
            }
        } else if (datatype == 'decimal') {
            const clipboardData = event.clipboardData?.getData('text');
            if (clipboardData?.match(/[^0-9.]/)) {
                event.preventDefault();
            }
        }
    }

    //New Codes for Mobile View Functionality
    // @track chevronDown = true;
    @track chevronDown = false;
    @track showTargetSection = true;
    // @track targetSectionLabel = "View Target Incentive";
    @track targetSectionLabel = "Close Target Incentive";
    handleTargetChevron() {
        this.chevronDown = !this.chevronDown;
        this.showTargetSection = !this.showTargetSection;
        // this.targetSectionLabel = !this.chevronDown ? "Close Target Incentive" : "View Target Incentive";
        this.targetSectionLabel = !this.chevronDown ? "View Target Incentive" : "Close Target Incentive";
    }

    handleNavigateHelpPage() {
        const orgUrl = window.location.origin;
        const mapAsObject = Object.fromEntries(this.productsAndPayout);
        sessionStorage.setItem('productsAndPayout', JSON.stringify(mapAsObject));
        //console.log('json',JSON.stringify(mapAsObject));
        window.open(orgUrl + '/JCBIndiaDealer/s/helppage?month=' + this.month + '&year=' + this.year, '_blank');
       
    }
    @track initialMessage = 'Select the above fields to load the respective incentive configuration';
}