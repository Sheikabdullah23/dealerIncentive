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
//import getPdfPageUrl from '@salesforce/apex/ReadFileData.getPdfPageUrl';
import getDetails from '@salesforce/apex/IncentivePayoutReportController.getDetails';
import getPdfcontent from '@salesforce/apex/IncentivePayoutReportController.getPdfcontent';
import deleteContentDocuments from '@salesforce/apex/IncentivePayoutReportController.deleteContentDocuments';

export default class IncentiveCalculator extends LightningElement {
    @track isLoading = false;
    @track productCategory = 'BHL';
    @track monthOptions = [];
    @track enableCalculator = false;

    @track selectedProduct = {}; //store's current selected product retail and Kpipayout info
    @track productsAndPayout = new Map(); //store's all the available products and its payoutInfo
    @track calculatedProducts = [];

    @track products = [];
    @track isExpand = false;
    @track nav = "menu-container-collapsed slds-max-small-size--3-of-12 slds-medium-size--2-of-12 slds-large-size--1-of-12 slds-show_small slds-show_large expand_transition";
    @track rowIcon = "slds-size_1-of-4 iconClick slds-p-top_small slds-p-left_large expand_transition";
    @track yearOptions;
    @track year;
    @track month;
    @track showSubCategory = true;
    @track jcbIcon = JCBIcon + '#jcb';
    @track prodAndKpIData;//variable to store All products and its Applicable KPI Info
    @track productAndSubProducts;//variable to store All products and its subproduct Info

    @track dealerRegion;
    @track maxPercent = maxPercentVal;
    // @track subProdKPIPayout = new Map();
    //below Variable holds the targets and formula's Informations of all products
    productKpiTargetInfo;
    productKpiPayoutInfo;
    productVolumeTargetInfo;
    product;
    // below variable holds the Additional Incentive formula's Information of all products
    // productAdditionalKpiTarget;
    @track addKPITargetAndPayout = [];
    @track addGrandTotalPayout = 0;
    @track isAddIncentive = false;
    addkpiTargetInfo;
    addProdPayoutInfo;
    selectedAddKpiTargets;
    //below Variable holds the targets and formula's of selected products
    selectedProdKpiTargets;
    selectedProdKpiPayout;
    selectedProdVolTarget;
    @track grandTotalPayout = 0;
    @track grandTotalVolume = 0;
    @track calculatedCount;
    @track accountDet;
    @track isCalcSaved;
    @track changeGridSize = 'slds-grid  slds-wrap slds-max-small-size--1-of-1 slds-medium-size--9-of-12 slds-large-size--11-of-12 slds-clearfix scrollfix widthFix';
    @track subcategorySize = "slds-max-small-size--1-of-1 slds-medium-size--3-of-12 slds-large-size--5-of-12 subProduct_flex";
    @track kpiSize = "slds-max-small-size--1-of-1 slds-medium-size--4-of-12 slds-large-size--6-of-12 subProduct_flex";
    @track incRecord = {};
    @track cloneMonthYear = {};
    @track currentDate;
    @track hasProduct = false;
    @wire(getProductAndSubProducts) productAndSubProductInfo({ error, data }) {
        if (data) {
            this.productAndSubProducts = data;
            this.products = Object.keys(this.productAndSubProducts);
            for (const key in this.productAndSubProducts) {
                var prod = {};
                prod['productName'] = key;
                prod['totalPayout'] = 0;
                this.calculatedProducts.push(prod);
            }
        } else if (error) {
            // console.error('*** wire error ', error);
        }
    }

    @wire(getProductsAndKPI) ProductAndKpIs({ error, data }) {
        if (data) {
            this.prodAndKpIData = data;
        } else if (error) {
            // console.error('*** wire error ', error);
        }
    }

    connectedCallback() {
        var dt = new Date();
        this.currentDate = dt.getDate() + ' - ' + (dt.getMonth() + 1) + ' - ' + dt.getFullYear();
        this.getUserDetails();
        this.getYears();
        // this.getCalculatedCount();
        // this.calculateGrandTotal();
    }

    getUserDetails() {
        getUserDetails({}).then(res => {
            // console.log('Result', res);
            if (res && res.Account) {
                this.accountDet = res.Account;
                this.dealerRegion = res.Account.India_Zone__c;
            } else {
                this.showToast('You have no access for Incentive Calculator Page', 'info');
            }
            // console.log(' this.accountDet ', this.accountDet);
        }).catch(error => {
            // console.log('error ====>   ', error);
        });
    }

    getCalculatedCount() {
        let count = 0;
        this.calculatedProducts.forEach(ele => {
            if (ele.totalPayout > 0) {
                count += 1;
            }
        });
        // this.calculatedCount = count + '/' + this.calculatedProducts.length;
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

    getTargetInfo() {
        this.isLoading = true;
        getDealerAndProductTargetInfo({ month: this.month, year: this.year, dealerId: this.accountDet.Id }).then(result => {
            if (result['productTargetInfo'] != null && result['dealerTargetInfo'] != null) {
                this.productKpiTargetInfo = new Map();
                this.productKpiPayoutInfo = new Map();
                this.addkpiTargetInfo = new Map();
                this.addKPITargetAndPayout = [];
                this.isAddIncentive = false;
                for (const key in this.prodAndKpIData) {
                    let prodKPIData = this.prodAndKpIData[key];
                    let productKPITarget = [];
                    let addKPITarget = [];
                    prodKPIData.forEach(kpiData => {
                        let prodTarget = Object.assign({}, result['productTargetInfo'].find((kpi) => kpi.productKPI.productKPIId == kpiData.Id && kpi.type == 'KPI Target'));
                        if (prodTarget && prodTarget.productKPI) {
                            prodTarget.kpiId = prodTarget.productKPI.kpiId;
                            if (prodTarget.productKPI.kpiName == 'Volume') {
                                prodTarget.kpiName = prodTarget.productKPI.kpiName + ' Incentive';
                            } else {
                                prodTarget.kpiName = prodTarget.productKPI.kpiName + ' Target';
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
                            addKPITarget.push(addTarget);
                        }
                    });
                    if (productKPITarget.length > 0) {
                        this.productKpiTargetInfo.set(key, productKPITarget);
                        let productKPIPayout = [];
                        productKPITarget.forEach(kpi => {
                            if (kpi && kpi.productPayouts) {
                                for (let z = 0; z < kpi.productPayouts.length; z++) {
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
                        if (productKPIPayout.length > 0) {
                            this.productKpiPayoutInfo.set(key, productKPIPayout);
                        }
                    }
                    if (addKPITarget && addKPITarget.length > 0) {
                        this.addkpiTargetInfo.set(key, addKPITarget);
                    }
                }
                this.productVolumeTargetInfo = new Map();
                this.addProdPayoutInfo = new Map();
                this.isCalcSaved = result['dealerTargetInfo'].stage == 'Saved' ? true : false; // validates new calculator or existing
                if (this.isCalcSaved) {
                    this.isDownloadButtonEnabled = false;
                    // this.handleDownloadReport();
                } else {
                    this.isDownloadButtonEnabled = true;
                }
                this.incRecord.recordId = result['dealerTargetInfo'].recordId;
                result['dealerTargetInfo'].productTargetsAndAchievements.forEach(prodVol => {
                    this.productVolumeTargetInfo.set(prodVol.productName, prodVol);
                })
                this.setupProductsAndPayoutData();
                this.setupAddIncentiveData();
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
            } else {
                this.showToast('Incentive target not being configured for selected month', 'error');
            }
            this.isLoading = false;
        }).catch(error => {
            this.showToast('Error Occured While fetching Incentive targets for selected month', 'error');
            this.isLoading = false;
        })
    }

    setupProductsAndPayoutData() {
        this.isLoading = true;
        for (let [key, value] of this.productVolumeTargetInfo) {
            var productInfo = value
            var product = {}
            product.productName = productInfo.productName;
            product.productId = productInfo.productId;
            product.subProducts = JSON.parse(JSON.stringify(this.getSubCategoryProducts(product.productName)));
            product.kpiPayouts = this.getProductKpiPayoutInfo(product.productName);
            product.kpiAchivement = this.getProductKpiAchivementInputs(product.productName);
            product.totalRetailTarget = productInfo.totalRetailTarget;
            if (this.isCalcSaved) {
                product.totalRetail = productInfo.totalRetailPredicted ? productInfo.totalRetailPredicted : 0;
            } else {
                product.totalRetail = this.calculateTotalRetail(product)
            }
            product.totalRetailPercentage = (product.totalRetail / productInfo.totalRetailTarget * 100).toFixed(2);
            if (this.isCalcSaved) {
                product.totalPayout = productInfo.totalProductPredictedPayout ? productInfo.totalProductPredictedPayout : 0;
                product.totalAddPredictedPayout = productInfo.totalAddPredictedPayout ? productInfo.totalAddPredictedPayout : 0;
            }
            else {
                product.totalPayout = this.calculateProductTotalPayout(product);
                product.totalAddPredictedPayout = this.calculateAddTotalPayout(product);
            }
            this.selectedProdVolTarget = product.totalRetailTarget;
            product.kpiAchivement.find((kpiAch) => kpiAch.Label.includes('Volume')).achievedPercentage = (product.totalRetail / this.selectedProdVolTarget) * 100;
            product.subProdKPIPayout = new Map();
            this.selectedProdKpiTargets = this.productKpiTargetInfo.get(product.productName);
            this.selectedProdKpiPayout = this.productKpiPayoutInfo.get(product.productName);
            this.calculateIncentivePayout(product);
            this.setupPayoutInNavbar(product);
            this.productsAndPayout.set(productInfo.productName, Object.assign({}, product));
        }
        this.isLoading = false;
    }

    getYears() {
        getCalcPicklistValues().then(res => {
            if (res) {
                this.cloneMonthYear = res;
                // console.log('picklist month and year ***', this.cloneMonthYear);
                let cloneYearOptions = Object.keys(this.cloneMonthYear);
                this.yearOptions = [];
                for (let i = 0; i < cloneYearOptions.length; i++) {
                    let year = (cloneYearOptions[i]).toString();
                    this.yearOptions.push({ label: year, value: year });
                }
            }
        }).catch(error => {
            // console.log('picklist month and year error ***   ', error);
        });
    }


    handleExpandCollapse() {
        var naveclick = this.template.querySelector('[data-name="Click"]');
        if (naveclick.classList.contains('iconClick')) {
            this.changeGridSize = 'slds-grid slds-wrap slds-max-small-size--1-of-1 slds-medium-size--8-of-12 slds-large-size--10-of-12 slds-clearfix scrollfix';
            this.subcategorySize = "slds-max-small-size--1-of-1 slds-medium-size--3-of-12 slds-large-size--5-of-12 subProduct_flex";
            this.kpiSize = "slds-max-small-size--1-of-1 slds-medium-size--3-of-12 slds-large-size--5-of-12 subProduct_flex";
            this.nav = "nav-expanded slds-max-small-size--4-of-12 slds-medium-size--3-of-12 slds-large-size--2-of-12 slds-show_small slds-show_large expand_transition";
            this.rowIcon = "slds-size_1-of-4 slds-p-left_large slds-p-top_small expand_transition";
            naveclick.classList.remove('iconClick');
            naveclick.classList.toggle('row');
            setTimeout(() => {
                this.isExpand = true;
            }, 450);
        }
        else {
            this.changeGridSize = 'slds-grid slds-wrap slds-max-small-size--1-of-1 slds-medium-size--9-of-12 slds-large-size--11-of-12 slds-clearfix scrollfix';
            this.subcategorySize = "slds-max-small-size--1-of-1 slds-medium-size--3-of-12 slds-large-size--5-of-12 subProduct_flex";
            this.kpiSize = "slds-max-small-size--1-of-1 slds-medium-size--4-of-12 slds-large-size--6-of-12 subProduct_flex";
            this.nav = "menu-container-collapsed slds-max-small-size--3-of-12 slds-medium-size--2-of-12 slds-large-size--1-of-12 slds-show_small slds-show_large expand_transition";
            this.isExpand = false;
            this.rowIcon = "slds-size_1-of-4 iconClick slds-p-top_small slds-p-left_large expand_transition";
            naveclick.classList.remove('row');
            naveclick.classList.toggle('iconClick');
        }
    }

    currentTab;
    handleMenuSelection(event) {
        this.isOpen = false;
        this.isAddIncentive = false;
        var prodName = event.target.getAttribute('data-name');
        if (this.selectedProduct) {
            this.productsAndPayout.set(this.selectedProduct.productName, Object.assign({}, this.selectedProduct));
        }
        this.selectedProduct = null;
        this.setupSelectedProductData(prodName);
        //To set currently active cell's background color and borderleft color.
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
        } else {
            this.hasProduct = false;
        }
    }

    getProductKpiPayoutInfo(product) {
        var kpiPayouts = this.productVolumeTargetInfo.get(product).productKPIAndAchievements;
        var payoutInfo = [];
        var kpIs = this.prodAndKpIData[product];
        for (let i = 0; i < kpIs.length; i++) {
            let keyLabel = kpIs[i].KPI__r.Name + ' Incentive';
            var payout = { kpiId: kpIs[i].KPI__r.Id, kpIPayoutName: keyLabel, orderNo: kpIs[i].Order_No__c };
            if (kpiPayouts && kpiPayouts.length > 0) {
                for (let j = 0; j < kpiPayouts.length; j++) {
                    if (kpiPayouts[j].productKPI.kpiId == kpIs[i].KPI__r.Id) {
                        payout.payoutAmount = kpiPayouts[j].predictedKPIPayout;
                        payout.addPredictedKPIPayout = kpiPayouts[j].addPredictedKPIPayout;
                        break;
                    }
                }
            } else {
                payout.payoutAmount = 0;
                payout.addPredictedKPIPayout = 0;
            }
            payoutInfo.push(payout);
        }
        return payoutInfo.sort((a, b) => {
            return a.orderNo - b.orderNo;
        })
    }

    getProductKpiAchivementInputs(product) {
        var kpiAchievements = this.productVolumeTargetInfo.get(product).productKPIAndAchievements;
        var prodKpiTarget = this.productKpiTargetInfo.get(product);
        var kpIs = this.prodAndKpIData[product];
        var achiveMentInputInfo = [];
        for (let i = 0; i < kpIs.length; i++) {
            let isCalc = kpIs[i].KPI__r.Name == 'Volume' ? true : false;
            let keyLabel = kpIs[i].KPI__r.Name != 'Demo' ? kpIs[i].KPI__r.Name + ' Achieved %' : kpIs[i].KPI__r.Name + ' Conducted';
            let perCentInput = kpIs[i].KPI__r.Name == 'Demo' ? false : true;
            var payout = { kpiId: kpIs[i].KPI__r.Id, Label: keyLabel, orderNo: kpIs[i].Order_No__c, isPercentage: perCentInput, isCalculated: isCalc };
            if (this.isCalcSaved) {
                if (kpiAchievements && kpiAchievements.length > 0) {
                    for (let j = 0; j < kpiAchievements.length; j++) {
                        if (kpiAchievements[j].productKPI.kpiId == kpIs[i].KPI__r.Id) {
                            payout.achievedPercentage = kpiAchievements[j].predictedKPIPercentage;
                            break;
                        }
                    }
                } else {
                    payout.achievedPercentage = 0;
                }
            } else {
                if (kpIs[i].KPI__r.Name != 'Volume' && kpIs[i].KPI__r.Name != 'Demo') {
                    // console.log(" kpIs[i].KPI__r.Name", kpIs[i].KPI__r.Name);
                    // console.log('prodKpiTarget ', prodKpiTarget);
                    let targetPercentValue;
                    if (prodKpiTarget) {
                        targetPercentValue = prodKpiTarget.find((prodKpi) => prodKpi.kpiId == kpIs[i].KPI__r.Id) ? prodKpiTarget.find((prodKpi) => prodKpi.kpiId == kpIs[i].KPI__r.Id).target : 0;
                    }
                    // console.log('targetPercentValue ', targetPercentValue);
                    payout.achievedPercentage = targetPercentValue ? this.extractTargetNumValue(targetPercentValue) : 0;
                }
            }
            achiveMentInputInfo.push(payout);
            // console.log('achiveMentInputInfo', achiveMentInputInfo);
        }
        return achiveMentInputInfo.sort((a, b) => {
            return a.orderNo - b.orderNo;
        })
    }

    extractTargetNumValue(targetPercentValue) {
        var hasRange = targetPercentValue.includes('to');
        let target = hasRange ? targetPercentValue.substring(0, targetPercentValue.indexOf("to")) : targetPercentValue;
        if (target.includes('<') && !target.includes('=')) {
            return parseInt(target.match(/\d+/g)) - 1;
        } else {
            return parseInt(target.match(/\d+/g))
        }
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;
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
        }
    }

    getSubCategoryProducts(productName) {
        var subProducts = [];
        var subCategoryList = this.productVolumeTargetInfo.get(productName).subTargetAndAchievement;
        subCategoryList.forEach(sub => {
            var subList = { subCategoryId: sub.subProductId, name: sub.subProductName, is4WDMachine: sub.is4WDMachine };
            if (this.isCalcSaved) {
                subList.volume = sub.subCategoryRetailPredicted;
            } else {
                subList.volume = sub.subCategoryRetailTarget;
            }

            subProducts.push(subList);
        });
        return subProducts;
    }

    handleSubProdInupt(event) {
        let subprodId = event.target.dataset.subid;
        this.selectedProduct.subProducts.find(subProd => subProd.subCategoryId === subprodId).volume = parseInt(this.validateInput(event));
        this.selectedProduct.totalRetail = this.calculateTotalRetail(this.selectedProduct);
        this.selectedProduct.totalRetailPercentage = ((this.selectedProduct.totalRetail / this.selectedProdVolTarget) * 100).toFixed(2);
        this.selectedProduct.kpiAchivement.find((kpiAch) => kpiAch.Label.includes('Volume')).achievedPercentage = (this.selectedProduct.totalRetail / this.selectedProdVolTarget) * 100;
        this.calculateIncentivePayout(this.selectedProduct);
        this.setupPayoutInNavbar(this.selectedProduct);
        this.calculateAddIncentivePayout(this.selectedProduct);
        // for(let[key, value] of this.productsAndPayout) {
        //     this.addKPITargetAndPayout.push(this.productsAndPayout.get(key));
        // }
        this.addGrandTotalPayout = this.calculateAddGrandTotal();
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
    calculateIncentivePayout(product) {
        product.kpiAchivement.forEach(kpiAch => {
            this.calculateKpiPayout(kpiAch.kpiId, kpiAch.achievedPercentage, product);
            // return kpiAch;
        });
    }
    //Method calculate's total retail sale
    calculateTotalRetail(product) {
        var totalRetail = product.subProducts.reduce((total, subProduct) => {
            if (subProduct.volume) {
                return total + subProduct.volume
            } else {
                return total;
            }
        }, 0);
        return totalRetail;
    }

    //Method calculate's total Payout of Selected Product
    calculateProductTotalPayout(product) {
        var totalPayout = product.kpiPayouts.reduce((totalPay, kpiPay) => {
            return totalPay + kpiPay.payoutAmount;
        }, 0)
        return totalPayout;
    }

    calculateAddTotalPayout(product) {
        var totalPayout = product.kpiPayouts.reduce((totalPay, kpiPay) => {
            return totalPay + parseFloat(kpiPay.addPredictedKPIPayout);
        }, 0)
        return totalPayout;
    }

    setupPayoutInNavbar(product) {
        this.calculatedProducts = this.calculatedProducts.map((prod) => {
            if (prod.productName == product.productName) {
                prod.totalPayout = product.totalPayout;
            }
            return prod;
        });
        this.getCalculatedCount();
    }

    calculateGrandTotal() {
        this.grandTotalPayout = 0;
        for (let [key, value] of this.productsAndPayout) {
            this.grandTotalPayout = parseFloat(this.grandTotalPayout) + parseFloat(value.totalPayout);
        }
        this.grandTotalPayout = this.grandTotalPayout.toFixed(2);
    }

    calculateTotalVolume() {
        this.grandTotalVolume = 0;
        for (let [key, value] of this.productsAndPayout) {
            this.grandTotalVolume = parseFloat(this.grandTotalVolume) + parseFloat(value.totalRetail);
        }
    }


    handleKpiAchiveMentInput(event) {
        let kpiId = event.target.dataset.kpid;
        let achieved = event.target.value;
        this.selectedProduct.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpiId).achievedPercentage = achieved;
        this.calculateKpiPayout(kpiId, achieved, this.selectedProduct);
        this.setupPayoutInNavbar(this.selectedProduct);
        this.calculateAddIncentivePayout(this.selectedProduct);
        // for(let[key, value] of this.productsAndPayout) {
        //     this.addKPITargetAndPayout.push(this.productsAndPayout.get(key));
        // }
        this.addGrandTotalPayout = this.calculateAddGrandTotal();
    }

    calculateKpiPayout(kpiId, achieved, product) {
        var kpiTar;
        if (this.selectedProdKpiTargets && this.selectedProdKpiTargets.length > 0) {
            kpiTar = this.selectedProdKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        let kpiIndex = product.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        if (kpiTar && !kpiTar.kpiName.includes('Demo')) {
            if (kpiTar.hasSlabs && kpiTar.slabs.length > 0) {
                var slabs = kpiTar.slabs;
                var isValidate = false;
                for (let i = 0; i < slabs.length; i++) {
                    if (this.validateTargetConditon(slabs[i].slabRange, achieved)) {
                        isValidate = true;
                        // console.log('payoutPercentage', slabs[i].payoutPercentage)
                        if (slabs[i].payoutMode != 'Amt') {
                            if (slabs[i].payoutPercentage != 'Pro-rata-basis') {
                                product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, kpiTar.kpiName) * (parseFloat(slabs[i].payoutPercentage) / 100)).toFixed(2)); //4
                                product = this.calculateSubProdPayout(slabs[i].payoutPercentage, kpiId, product);
                            } else {
                                let proRataPercent = parseFloat(product.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpiId).achievedPercentage) / 100;
                                product.kpiPayouts[kpiIndex].payoutAmount = parseFloat((this.getPayoutAmount(kpiId, product, kpiTar.kpiName) * proRataPercent).toFixed(2)); //*(parseInt(proRataPercent)/100); //4
                                product = this.calculateSubProdPayout(proRataPercent, kpiId, product);
                            }

                        } else {
                            product.kpiPayouts[kpiIndex].payoutAmount = parseFloat(product.totalRetail * slabs[i].amount);
                        }
                        break;
                    }
                }
                if (!isValidate) {
                    product.kpiPayouts[kpiIndex].payoutAmount = 0;
                }

            } else {
                if (kpiTar.target && achieved) {
                    if (this.validateTargetConditon(kpiTar.target, achieved)) {
                        product.kpiPayouts[kpiIndex].payoutAmount = this.getPayoutAmount(kpiId, product, kpiTar.kpiName);

                    } else {
                        product.kpiPayouts[kpiIndex].payoutAmount = 0;
                    }
                } else {
                    product.kpiPayouts[kpiIndex].payoutAmount = 0;
                }
            }
        } else if (kpiTar && kpiTar.kpiName.includes('Demo')) { //product.kpiPayouts[kpiIndex].kpIPayoutName == 'Demo Incentive'
            var demoTarget = this.productVolumeTargetInfo.get(product.productName).demoTarget;
            var expr;
            if (demoTarget && achieved) {
                expr = '>=' + demoTarget;
                if (this.validateTargetConditon(expr, achieved)) {
                    product.kpiPayouts[kpiIndex].payoutAmount = this.getPayoutAmount(kpiId, product, kpiTar.kpiName);
                } else {
                    product.kpiPayouts[kpiIndex].payoutAmount = 0;
                }
            } else {
                product.kpiPayouts[kpiIndex].payoutAmount = 0;
            }
        }
        product.kpiAchivement.find(kpiAch => kpiAch.kpiId == kpiId).isAchieved = product.kpiPayouts[kpiIndex].payoutAmount > 0;
        product.totalPayout = this.calculateProductTotalPayout(product);
        this.productsAndPayout.set(product.productName, Object.assign({}, product));
        this.calculateGrandTotal();
        this.calculateTotalVolume();
    }

    calculateSubProdPayout(percentage, kpiId, product) {
        var subProductPayout = product.subProdKPIPayout.get(kpiId);
        subProductPayout.forEach(sub => {
            sub.payout = parseFloat((sub.payout * percentage) / 100);
            return sub;
        })
        product.subProdKPIPayout.set(kpiId, subProductPayout);
        return product;
    }

    validateTargetConditon(targetPercent, achieved) {
        var hasRange = targetPercent.includes('to');
        var func;
        if (hasRange) {
            var range1 = targetPercent.substring(0, targetPercent.indexOf("to"));
            var range2 = targetPercent.substring(targetPercent.indexOf("to") + 2, targetPercent.length);
            func = "return " + achieved.toString() + range1 + "&&" + achieved.toString() + range2;
        } else {
            func = "return " + achieved.toString() + targetPercent;
        }
        // console.log('valid target', Function(func)());
        return Function(func)();
    }

    getPayoutAmount(kpiId, product, kpiName) {
        product.subProdKPIPayout = product.subProdKPIPayout ? product.subProdKPIPayout : new Map();
        var subProducts = product.subProducts;
        var subProductsPayout = this.selectedProdKpiPayout;
        var payoutAmt = 0;
        var subPayout = [];
        subProducts.forEach(subProd => {
            if (!kpiName.includes('4WD') || (kpiName.includes('4WD') && subProd.is4WDMachine)) {
                let volume = subProd.volume;
                let kpiPayoutAmount;
                if (volume) {
                    let subProdPayout = subProductsPayout.find((kpIsbProd) => kpIsbProd.subProductId == subProd.subCategoryId);
                    let payoutInfo;
                    if (subProdPayout) {
                        payoutInfo = subProdPayout.payoutInfo;
                    }
                    let kpiPayout;
                    if (payoutInfo) {
                        kpiPayout = payoutInfo.find(py => py.kpiId == kpiId)
                    }
                    if (kpiPayout && kpiPayout.regionPayout && kpiPayout.regionPayout.length > 0) {
                        kpiPayoutAmount = kpiPayout.regionPayout.find((regionPay) => regionPay.region == this.dealerRegion).amount;
                        // console.log('kpiPayoutAmount ---->   ' + kpiPayoutAmount);
                    } else {
                        kpiPayoutAmount = kpiPayout ? kpiPayout.payoutAmount : 0;
                    }
                } else {
                    kpiPayoutAmount = 0;
                    volume = 0;
                }
                if (volume && kpiPayoutAmount) {
                    payoutAmt += volume * kpiPayoutAmount;
                }
                let subAmt = volume && kpiPayoutAmount ? volume * kpiPayoutAmount : 0;
                subPayout.push({ 'subProductId': subProd.subCategoryId, 'payout': subAmt });
            }
        });
        product.subProdKPIPayout.set(kpiId, subPayout);
        //calculate Overall Payout
        return payoutAmt;
    }

    @track isOpen = false;
    totalPayout = 0;
    get navClass() {
        return this.isOpen ? 'sidenav open' : 'sidenav';
    }

    toggleNav() {
        this.isOpen = true;
    }

    toggleNavClose() {
        this.isOpen = false;
    }

    reportUrl;
    isDownloadButtonEnabled = true;
    // handleDownloadReport() {
    //     getDetails({ month: this.month, year: this.year, dealerId: this.accountDet.Id})
    //         .then((result) => {
    //             this.reportUrl = result;
    //             console.log('URL Generated', this.reportUrl);    
    //         })
    //         .catch((error) => {
    //             console.error('Error:', error);
    //         });
    // }

    downloadReport() {
        this.isLoading = true;
        getPdfcontent({ month: this.month, year: this.year, dealerId: this.accountDet.Id })
            .then((res) => {
                this.reportUrl = res;
                // console.log('getPdfcontentgetPdfcontent', this.reportUrl);
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
                // console.log('Error ', e);
                this.isLoading = false;
            })
        // const resourcePath ='https://jcb-custfirst--minusdev3.sandbox.my.salesforce-sites.com/IncentiveCalculation?id=001S900000LxeyFIAR&month=January&year=2024';
    }
    deleteIds() {
        deleteContentDocuments({ contentDocumentId: this.reportUrl.split('+++')[0] })
            .then((res) => {
                // console.log('res', res);
            })
            .catch((err) => {
                // console.log('err', err);
            })
    }

    handleSave() {
        this.isLoading = true;
        var productInfos = [];
        for (let [key, value] of this.productsAndPayout) {
            var productTargetInfo = {};
            productTargetInfo.productId = this.productVolumeTargetInfo.get(value.productName).productId;
            productTargetInfo.productName = this.productVolumeTargetInfo.get(value.productName).productName;
            productTargetInfo.productTargetAndAchievementId = this.productVolumeTargetInfo.get(value.productName).productTargetAndAchievementId;
            productTargetInfo.subTargetAndAchievement = Object.assign([], this.productVolumeTargetInfo.get(value.productName).subTargetAndAchievement);
            productTargetInfo.productKPIAndAchievements = this.productVolumeTargetInfo.get(value.productName).productKPIAndAchievements;
            productTargetInfo.totalRetailTarget = this.productVolumeTargetInfo.get(value.productName).totalRetailTarget;
            productTargetInfo.totalProductPredictedPayout = value.totalPayout;
            productTargetInfo.totalRetailPredicted = value.totalRetail;
            let addPayout = this.addKPITargetAndPayout.find(addKPI => addKPI.productId == productTargetInfo.productId);
            if (addPayout) {
                productTargetInfo.totalAddPredictedPayout = addPayout.totalAddPredictedPayout;
            }
            value.subProducts.forEach(sub => {
                for (let i = 0; i < productTargetInfo.subTargetAndAchievement.length; i++) {
                    let subProd = productTargetInfo.subTargetAndAchievement[i];
                    if (sub.subCategoryId == subProd.subProductId) {
                        var subTarget = {};
                        subTarget.subCategoryRetailTarget = productTargetInfo.subTargetAndAchievement[i].subCategoryRetailTarget;
                        subTarget.subProductId = productTargetInfo.subTargetAndAchievement[i].subProductId;
                        subTarget.subProductName = productTargetInfo.subTargetAndAchievement[i].subProductName;
                        subTarget.subTargetAndAchievementId = productTargetInfo.subTargetAndAchievement[i].subTargetAndAchievementId;
                        subTarget.subCategoryRetailPredicted = sub.volume;
                        subTarget.subCategoryPredictedPayout = 0;
                        if (value.subProdKPIPayout) {
                            for (let [key, subTar] of value.subProdKPIPayout) {
                                for (let m = 0; m < subTar.length; m++) {
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
                if (productTargetInfo.productKPIAndAchievements && productTargetInfo.productKPIAndAchievements.length > 0) {
                    for (let j = 0; j < productTargetInfo.productKPIAndAchievements.length; j++) {
                        if (productTargetInfo.productKPIAndAchievements[j].productKPI.productKPIId == kpi.Id) {
                            let achieve = productTargetInfo.productKPIAndAchievements[j];
                            kpiAch.kpiAchievementId = achieve.kpiAchievementId;
                            kpiAch.predictedKPIPercentage = value.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpi.KPI__c).achievedPercentage;
                            kpiAch.predictedKPIPayout = value.kpiPayouts.find((kpiPay) => kpiPay.kpiId == kpi.KPI__c).payoutAmount;
                            kpiAch.productTargetandAchivementId = productTargetInfo.productTargetAndAchievementId;
                            kpiAch.productKPI = achieve.productKPI;
                            if (addPayout) {
                                let kpiPayout = addPayout.kpiPayouts.find(kpiPay => kpiPay.kpiId == kpi.KPI__c);
                                if (kpiPayout) {
                                    kpiAch.addPredictedKPIPayout = kpiPayout.addPredictedKPIPayout;
                                }
                            }
                            break;
                        }
                    }
                } else {
                    kpiAch.productTargetandAchivementId = productTargetInfo.productTargetAndAchievementId;
                    kpiAch.predictedKPIPercentage = value.kpiAchivement.find((kpiAch) => kpiAch.kpiId == kpi.KPI__c).achievedPercentage;
                    kpiAch.predictedKPIPayout = value.kpiPayouts.find((kpiPay) => kpiPay.kpiId == kpi.KPI__c).payoutAmount;
                    var kpiInfo = { productKPIId: kpi.Id, kpiId: kpi.KPI__c, productId: kpi.Product_Category__c };
                    kpiAch.productKPI = kpiInfo;
                }
                productKPIAndAchievements.push(kpiAch);
            })
            productTargetInfo.productKPIAndAchievements = productKPIAndAchievements;
            productTargetInfo.dealerIncentiveId = this.productVolumeTargetInfo.get(value.productName).dealerIncentiveId;
            productInfos.push(productTargetInfo);
        }
        // this.addKPITargetAndPayout.forEach(ele => {
        //     var productTargetInfo = {};
        //     productTargetInfo.productId = ele.productId;
        //     productTargetInfo.productName = ele.productName;
        //     productTargetInfo.productTargetAndAchievementId = this.addProdPayoutInfo.get(ele.productName) ? this.addProdPayoutInfo.get(ele.productName).productTargetAndAchievementId : null;
        //     productTargetInfo.type = 'Additional Incentive Target';
        //     productTargetInfo.dealerIncentiveId = this.incRecord.recordId;
        //     productTargetInfo.totalProductPredictedPayout = ele.totalPayout;
        //     var productKPIAndAchievements = [];
        //     ele.kpiPayouts.forEach(kpi => {
        //         var kpiAch = {};
        //         // kpiAch.kpiAchievementId = null;
        //         kpiAch.predictedKPIPayout = kpi.payoutAmount;
        //         // kpiAch.productTargetandAchivementId = null;
        //         kpiAch.productKPI = kpi.productKPI;
        //         productKPIAndAchievements.push(kpiAch);
        //     })
        //     productTargetInfo.productKPIAndAchievements = productKPIAndAchievements;
        //     productInfos.push(productTargetInfo);
        // })
        this.incRecord.totalRetailPredicted = this.grandTotalVolume;
        this.incRecord.totalProdPayoutPredicted = this.grandTotalPayout;
        this.incRecord.totalAddPayoutPredicted = this.addGrandTotalPayout;
        this.incRecord.totalPayoutPredicted = parseFloat(this.grandTotalPayout) + parseFloat(this.addGrandTotalPayout);
        saveIncentiveCalculations({ productInfos: productInfos, incentiveRec: this.incRecord }).then((result) => {
            if (result == 'SUCCESS') {
                this.isLoading = false;
                this.showToast('Dealer Incentive Updated Successfully !', 'success');
                // setTimeout(() => {
                this.handleCheckIncentive();
                this.isDownloadButtonEnabled = false;
                // }, 3000);
            } else {
                this.isLoading = false;
            }
        }).catch(error => {
            this.isLoading = false;
            // console.log('error Occured on save ', error);
            this.showToast('Error Occured While Saving the calculations please contact administrator !', 'error');
        })
    }

    handleAddSelection(event) {
        this.hasProduct = this.addKPITargetAndPayout && this.addKPITargetAndPayout.length > 0;
        this.isAddIncentive = true;
        const activeCell = this.template.querySelector('.active');
        if (activeCell) {
            activeCell.classList.remove('active');
        }
        const targetCell = event.target.closest('td');
        if (targetCell) {
            targetCell.classList.add('active');
        }
    }

    calculateAddIncentivePayout(product) {
        // this.addKPITargetAndPayout.forEach(product => {
        //     this.selectedAddKpiTargets = this.addkpiTargetInfo.get(product.productName);
        //     this.productsAndPayout.get(product.productName).kpiAchivement.forEach(kpiAch => {
        //         this.calculateAddKpiPayout(kpiAch.kpiId, kpiAch.achievedPercentage, product);
        //     })
        // });
        this.selectedAddKpiTargets = this.addkpiTargetInfo.get(product.productName);
        product.kpiAchivement.forEach(kpiAch => {
            this.calculateAddKpiPayout(kpiAch.kpiId, kpiAch.achievedPercentage, product);
        })
    }

    setupAddIncentiveData() {
        // this.getAddKpiPayoutInfo();
        // this.calculateAddIncentivePayout();
        for (let [key, value] of this.productsAndPayout) {
            if (this.addkpiTargetInfo.get(key)) {
                this.calculateAddIncentivePayout(value);
            }
        }
        this.addGrandTotalPayout = this.calculateAddGrandTotal();
    }

    getAddKpiPayoutInfo() {
        for (const key in this.prodAndKpIData) {
            if (this.addkpiTargetInfo.get(key)) {
                let kpiAchPayouts = this.addProdPayoutInfo.get(key);
                var kpIs = this.prodAndKpIData[key];
                var payoutInfo = [];
                for (let i = 0; i < kpIs.length; i++) {
                    let keyLabel = kpIs[i].KPI__r.Name + ' Incentive';
                    var payout = { kpiId: kpIs[i].KPI__r.Id, kpIPayoutName: keyLabel, orderNo: kpIs[i].Order_No__c };
                    payout.productKPI = { productKPIId: kpIs[i].Id, kpiId: kpIs[i].KPI__r.Id, kpiName: kpIs[i].KPI__r.Name, productId: kpIs[i].Product_Category__r.Id, productName: kpIs[i].Product_Category__r.Name };
                    if (kpiAchPayouts && kpiAchPayouts.length > 0) {
                        let kpiPay = kpiAchPayouts.find(kpiAch => kpiAch.productKPI.productKPIId == kpIs[i].Id);
                        payout.payoutAmount = kpiPay ? kpiPay.predictedKPIPayout : 0;
                    } else {
                        payout.payoutAmount = 0;
                    }
                    payoutInfo.push(payout);
                }
                let kpiPayouts = payoutInfo.sort((a, b) => {
                    return a.orderNo - b.orderNo;
                });
                let product = { productId: kpIs[0].Product_Category__c, productName: key, kpiPayouts: kpiPayouts };
                // product.totalPayout = this.calculateAddTotalPayout(kpiPayouts);
                product.totalPayout = this.addProdPayoutInfo.get(key) ? this.addProdPayoutInfo.get(key).totalProductPredictedPayout : 0;
                this.addKPITargetAndPayout.push(product);
            }
        }
    }

    calculateAddKpiPayout(kpiId, achieved, product) {
        var kpiTar;
        if (this.selectedAddKpiTargets && this.selectedAddKpiTargets.length > 0) {
            kpiTar = this.selectedAddKpiTargets.find((kpiTar) => kpiTar.kpiId == kpiId);
        }
        let kpiIndex = product.kpiPayouts.findIndex((kpiPay) => kpiPay.kpiId == kpiId);
        if (kpiTar) {
            if (kpiTar.hasSlabs && kpiTar.slabs.length > 0) {
                var slabs = kpiTar.slabs;
                let isEligible = false;
                for (let i = 0; i < slabs.length; i++) {
                    if (this.validateTargetConditon(slabs[i].slabRange, achieved)) {
                        product.kpiPayouts[kpiIndex].addPredictedKPIPayout = parseFloat(this.grandTotalVolume * slabs[i].amount);
                        isEligible = true;
                        break;
                    }
                }
                if (!isEligible) {
                    product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                }
            } else {
                if (kpiTar.target && achieved) {
                    if (this.validateTargetConditon(kpiTar.target, achieved)) {
                        product.kpiPayouts[kpiIndex].addPredictedKPIPayout = parseFloat(this.grandTotalVolume * kpiTar.incentiveAmount);
                    } else {
                        product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                    }
                } else {
                    product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
                }
            }
        } else {
            product.kpiPayouts[kpiIndex].addPredictedKPIPayout = 0;
        }
        product.totalAddPredictedPayout = this.calculateAddTotalPayout(product);
        this.productsAndPayout.set(product.productName, Object.assign({}, product));
        // for(let[key, value] of this.productsAndPayout) {
        //     this.addKPITargetAndPayout.push(this.productsAndPayout.get(key));
        // }
        // this.addGrandTotalPayout = this.calculateAddGrandTotal();
        // for(let k = 0; k < this.addKPITargetAndPayout.length; k++) {
        //     if(this.addKPITargetAndPayout[k].productName == product.productName){
        //         this.addKPITargetAndPayout[k] = product;
        //         break;
        //     }
        // }

    }

    calculateAddGrandTotal() {
        this.addKPITargetAndPayout = [];
        for (let [key, value] of this.productsAndPayout) {
            let product = value;
            product.isVisible = this.addkpiTargetInfo.get(key) ? true : false;
            this.addKPITargetAndPayout.push(product);
        }
        var totalPayout = this.addKPITargetAndPayout.reduce((totalPay, kpiPay) => {
            return totalPay + parseFloat(kpiPay.totalAddPredictedPayout);
        }, 0)
        return totalPayout;
    }

    //
    handleNavigateHelpPage() {
        window.open('https://jcb-custfirst--minusdev3.sandbox.my.site.com/JCBIndiaDealer/s/helppage?month=' + this.month + '/year=' + this.year, '_blank');
    }

    //New Javascript 
    imageszip = imageZip;
    jcbImg = imageZip + '/Images/BHL.jpg';
    jcbImg1 = imageZip + '/Images/projectedInc.jpg';
    jcbImg2 = imageZip + '/Images/actualInc.jpg';
    jcbImg3 = imageZip + '/Images/targetInc.jpg';
    jcbImg4 = imageZip + '/Images/projected.jpg';
    jcbImg5 = imageZip + '/Images/actual.jpg';
    jcbImg6 = imageZip + '/Images/target.jpg';
    jcbImg7 = imageZip + '/Images/earning.jpg';
    jcbImg8 = imageZip + '/Images/losing.jpg';
    addInc = imageZip + '/Images/additionalInc.jpg';
    backImg = imageZip + '/Images/back.jpg';
    handMoney = imageZip + '/Images/addInc.jpg';
    afterMarketVisible = false;
    activeTab = 'sales';
    isFlipped = false;
    @track showDiv = false;
    @track isProjectionMode = false;
    @track buttonName = 'Check Details';
    @track tabs = [
        { id: 'sales', label: 'Sales', class: 'slds-tabs_default__item slds-active' },
        { id: 'afterMarket', label: 'After Market', class: 'slds-tabs_default__item' }
    ];

    handleTabClick(event) {
        // if(event.currentTarget.dataset.id === 'sales'){
        //     this.afterMarketVisible = false;
        // } else {
        //     this.afterMarketVisible = true;
        // }
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

    get toggleClass() {
        return this.isProjectionMode ? 'toggle checked' : 'toggle';
    }

    get actualModeClass() {
        return this.isProjectionMode ? 'mode' : 'mode isactive';
    }

    get projectionModeClass() {
        return this.isProjectionMode ? 'mode isactive' : 'mode';
    }

    toggleMode() {
        this.isProjectionMode = !this.isProjectionMode;
    }

    handleSliderChange(event) {
        this.sliderValue = event.target.value;
        const progress = (this.sliderValue / event.target.max) * 100;
        event.target.style.background = `linear-gradient(to right, green ${progress}%, #CDCCCA ${progress}%)`;
    }
}