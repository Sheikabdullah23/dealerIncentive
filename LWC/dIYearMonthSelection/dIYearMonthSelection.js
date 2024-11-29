import getMonthOptions from '@salesforce/apex/JCBDealerIncentiveController.getMonthOptions';
import getProductAndSubProducts from '@salesforce/apex/JCBDealerIncentiveController.getProductAndSubProducts';
import getAccounts from '@salesforce/apex/dIFormulaController.getAccounts';
import getClonePicklistValues from '@salesforce/apex/dIFormulaController.getClonePicklistValues';
import getKPITargetAndPayoutInfo from '@salesforce/apex/dIFormulaController.getKPITargetAndPayoutInfo';
import getMultiKPITargets from '@salesforce/apex/dIFormulaController.getMultiKPITargets';
import getProductsAndKPI from '@salesforce/apex/dIFormulaController.getProductsAndKPI';
import START_MONTH from '@salesforce/label/c.Dealer_Incentive_Start_Month';
import START_YEAR from '@salesforce/label/c.Dealer_Incentive_Start_Year';
import jcb_logo from '@salesforce/resourceUrl/JcbLogo';
import workbook from "@salesforce/resourceUrl/writeexcelfile";
import { loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, api, track, wire } from 'lwc';

export default class DIYearMonthSelection extends LightningElement {

    @api isDealerFormula;
    @api isProductFormula;
    @track currentSection;
    @track productOptions = [];
    yearOpt = [];
    @track monthOptions = [];
    @track yearVal = "";
    @track monthVal = "";
    @track byValue;
    @track showMessage = false;
    @track by = "";
    @track productkpi;
    @track sizeSlds = "slds-size_11-of-12";
    @track prodValue = '10';
    @track showSubCard = false;
    @track isExpand = false;
    @track nav = "menu-container-collapsed slds-size_1-of-12";
    @track rowIcon = "slds-size_1-of-4 iconClick slds-p-top_small slds-p-left_x-large";
    @track showDealerFormula = false;
    @track showProductFormula = false;
    @track isLoad = true;
    @track productVolumeCount;
    @track isDealer = false;
    @track showImport = false;
    @track showDownloadUpload = false;
    @track ByValue = "";
    @track displayYearmonth = "Select Year and Month...";
    @track isyearmonth = false;
    @track selectedYear = "";
    @track selectedMonth = "";
    @track syear;
    @track smonth;
    @track showSelectmodalpage = false;
    @track currentTab = '';
    @track productList = [];
    @track handleselected;
    @track showProductTabset = false;
    @track showProductFormulaConfig = false;
    @track showDealerFormulaConfig = false;
    @track showActualAchievement = false;
    @track showStockCondition = false;
    @track showAdditionalIncentiveConfig = false;
    @track showproducts = false;
    @track hideAddTab = false;
    @track cloneMonthOptions = [];
    @track cloneYearOptions = [];
    @track cloneMonth;
    @track cloneYear;
    @track clonePicklistValue;
    @track cloneYearMonthData;
    @track resetData = false;
    @track setProductTab = '';
    @track productsWithKpi = [];
    @track actualAchievementProductList = [];
    @track firstProduct = '';
    @track prodAndSubCategory;
    @track tempProductList = [];
    @track check1 = [];
    @track showProductAdd = false;
    @track isDiscard = false;
    @track showborder = false;
    @track isfooter = false;
    @track yearMonthOptions = [];
    @track monthDisable = true;
    @track filteredMonths = [];
    @track showInfoToolTip = false;
    @track isLoading = false;
    @track cloneButtonEnable = true;
    @track isheader = false;
    @track hideTab = true;
    @track productName = '';
    @track isDropdown = null;
    @track addProductList = [];
    @track removeName;
    @track initialMessage = 'Select the above fields to load the respective incentive configuration';
    @track retailOrActual = 'retail';

    months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    jcbLogo = jcb_logo;
    uploadBtnLabel;
    commonProductList = [];
    addProductList = [];
    showCloneModal = false;
    isLibraryLoaded = false;
    columnHeader = ['ID', 'Name'];
    dealerRecords = [];
    productMtd = [];
    sheetNames = [];
    subProducts = [];
    objects = [];
    subProduct = [];
    objectArray = [];
    count = 1;
    nameType;
    monthLabel = {
        specificMonth: START_MONTH
    };

    @wire(getMonthOptions) MonthPicklist({ error, data }) {
        if (data) {
            this.monthOptions = data;
        }
        else if (error) {
        }
    }

    @wire(getClonePicklistValues) wiredGetClonePicklistValues({ error, data }) {
        if (data) {
            this.clonePicklistValue = data;
            let cloneYearOptionsTemp = Object.keys(this.clonePicklistValue.yearsMonth);
            for (let i = 0; i < cloneYearOptionsTemp.length; i++) {
                this.cloneYearOptions.push({ label: cloneYearOptionsTemp[i].toString(), value: cloneYearOptionsTemp[i].toString() });
            }
        } else if (error) {
        }
    }

    @wire(getAccounts) wiredData({ error, data }) {
        if (data) {
            this.dealerRecords = data;
        } else if (error) {
        }
    }

    @track isStartLoading = true;
    connectedCallback() {
        this.getProductsubCategory();
        this.byValue = 'product';
        document.addEventListener('click', this.close.bind(this));
        document.title = "Dealer Incentive Configuration";
    }
    handleRetailLoading(event) {
        if (event.detail) {
            this.isLoading = true;
            let startTime = performance.now();
        }
        else {
            this.isLoading = false;
            let endTime = performance.now();
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._handler);
    }

    handleTypeName(event) {
        this.nameType = event.detail;
    }

    showTabset() {
        let type = ['Additional Incentive Target', 'Growth Additional Incentive'];
        getKPITargetAndPayoutInfo({ month: this.monthVal, year: this.yearVal, type: type }).then(res => {
            var addOrGrow = res;
            getMultiKPITargets({ month: this.monthVal, year: this.yearVal }).then(result => {
                var multi = result;
                if (addOrGrow.length > 0 || multi.length > 0) {
                    this.hideAddTab = true;
                    this.showProductTabset = true;
                    this.showProductAdd = true;
                    this.hideTab = false;
                    this.showborder = true;
                    var product;
                    var order;
                    for (let i = 0; i < this.commonProductList.length; i++) {
                        product = this.commonProductList[i].label;
                        order = this.commonProductList[i].order;
                        let checkProduct = addOrGrow.find((prod) => prod.productKPI.productName == product);
                        let checkMulti = multi.find((prod) => prod.productCategory.name == product && prod.multiKpi?.length > 0);
                        if (checkProduct || checkMulti) {
                            var act = "slds-grid slds-tabs_default__item slds-m-left_small";
                            if (this.productList.length == 0) {
                                act = "slds-grid slds-tabs_default__item slds-m-left_small slds-border_bottom slds-is-active font";
                            }
                            this.productList.push({ key: product, label: product, active: act, order: order });
                            for (let i = 0; i < this.addProductList.length; i++) {
                                if (this.addProductList[i].label == product) {
                                    this.addProductList.splice(i, 1);
                                    break;
                                }
                            }
                            if (this.addProductList.length == 0) {
                                this.showProductAdd = false;
                            }
                        }
                    }
                    if (this.template.querySelector('c-d-i-additional-incentive')) {
                        this.template.querySelector('c-d-i-additional-incentive').month = this.monthVal;
                        this.template.querySelector('c-d-i-additional-incentive').year = this.yearVal;
                        this.template.querySelector('c-d-i-additional-incentive').getKPITargetAndPayoutInfo();
                    }
                    this.showAdditionalIncentiveConfig = this.productList.length == 0 ? false : true;
                    this.handleRow(this.productList[0].label);


                } else {
                    this.hideAddTab = true;
                    this.hideTab = false;
                    this.showAdditionalIncentiveConfig = false;
                    this.showProductTabset = true;
                    this.showProductAdd = true;
                    this.showborder = true;
                    this.addProductList = [...this.commonProductList];
                }
            }).catch(err => { });


        }).catch(error => {
        });
    }


    getProductsAndKPI() {
        getProductsAndKPI().then(result => {
            if (result) {
                this.productkpi = result;
                this.productsWithKpi = Object.keys(this.productkpi);
            }
            this.getYears();
        }).catch(error => {

        });
    }

    close() {
        if (this.isDropdown == null) {
            this.showproducts = false;
        }
    }

    isFooterVisible() {
        if (this.isfooter == true) {
            this.toast('Warning: You are currently in edit mode. Please save your changes or cancel the edit before switching tabs.', 'info');
        }
    }

    handleResetingParentData(event) {
        this.isLoading = true;
        this.isLoad = true;
        this.initialMessage = `Retail Target is not configured for "${event?.detail?.productCategory}" product in "${this.monthVal}". Select the fields above for configuration.`;
        this.monthVal = event?.detail?.month;
        this.showDealerFormulaConfig = event?.detail?.showdealerformulaconfigpage;
        this.productName = event?.detail?.productCategory;
        this.showProductTabset = false;
        setTimeout(() => {
            this.isLoading = false;
        }, 500);
    }

    // handledisableParent(event) {
    //     if (event) {
    //         const isTabVisible = event.detail.isTabVisible;
    //         if (event?.detail?.commonDisable == true) {
    //             this.template.querySelector('div.disableYearMonth').classList.add('disableTabset');
    //             if (isTabVisible == false) {
    //                 this.template.querySelector('div.disableProductTabset').classList.add('disableTabset');
    //             }
    //         }
    //         else {
    //             this.template.querySelector('div.disableYearMonth').classList.remove('disableTabset');
    //             if (this.template.querySelector('div.disableProductTabset')) {
    //                 this.template.querySelector('div.disableProductTabset').classList.remove('disableTabset');
    //             }
    //         }
    //     } else {
    //     }
    // }
    handledisableParent(event) {
        if (event) {
            const commonDisable = event.detail.commonDisable;

            // Handle disabling of Year/Month selection only
            if (commonDisable) {
                this.template.querySelector('div.disableYearMonth').classList.add('disableTabset');
            } else {
                this.template.querySelector('div.disableYearMonth').classList.remove('disableTabset');
            }

            // Ensure Product Tab is NOT disabled (remove any logic affecting it)
        }
    }


    handledisableParentAdditional(event) {
        if (event.detail == 'edit') {
            let disable = this.template.querySelectorAll('.disableTab');
            disable.forEach(tab => {
                tab.classList.toggle('disableDiv');
            })
        } else {
            let disable = this.template.querySelectorAll('.disableTab');
            disable.forEach(tab => {
                tab.classList.remove('disableDiv');
            })
        }
    }

    handlecount(event) {
        this.tempproductList = [];
        var checkProductList = JSON.parse(JSON.stringify(event.detail));
        for (let i = 0; i < this.productList?.length; i++) {
            let prdkey = this.productList[i].label;
            this.productList[i].key = prdkey;
            this.productList[i].value = checkProductList[prdkey];
        }
    }

    handleCloneValues(event) {
        if (event.target.dataset.name == 'cloneMonth') this.cloneMonth = event.detail.value;
        if (event.target.dataset.name == 'cloneYear') {
            this.cloneYear = event.detail.value;
            let temp = Object.values(this.clonePicklistValue);
            this.cloneYearMonthData = temp[0];
            this.updateSecondComboboxOptions();
        }
        if (this.cloneMonth && this.cloneYear) {
            this.cloneButtonEnable = false;
        }
    }

    updateSecondComboboxOptions() {
        const selectedYear = this.cloneYear;
        let cloneMonthOptions = [];
        if (this.cloneYearMonthData.hasOwnProperty(selectedYear)) {
            cloneMonthOptions = this.cloneYearMonthData[selectedYear];
        }
        this.cloneMonthOptions = cloneMonthOptions.filter(month => month !== this.monthVal).map(month => {
            return { label: month, value: month };
        });
    }

    handleCloneSave() {
        if (this.showProductFormulaConfig == true) {
            if (this.template.querySelector('c-d-i-product-formula-config-page')) {
                this.template.querySelector('c-d-i-product-formula-config-page').getKPITargetAndPayoutInfo(this.cloneMonth, this.cloneYear, true);
                this.showCloneModal = false;
                this.cloneButtonEnable = true;
                let toastMessage = 'Configurations has been cloned from ' + this.cloneMonth + ',' + this.cloneYear + ' Successfully.';
                this.toast(toastMessage, 'info');
            }
        }
    }
    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    getYears() {
        const currentYear = new Date().getFullYear();
        const currentMonth = this.months[new Date().getMonth()];
        let startYear = parseInt(START_YEAR);
        let yearData = [];
        if (currentMonth == 'November' || currentMonth == 'December') {
            for (let i = startYear; i <= currentYear + 1; i++) {
                yearData.push({ label: i.toString(), value: i.toString() });
            }
        } else {
            for (let i = startYear; i <= currentYear; i++) {
                yearData.push({ label: i.toString(), value: i.toString() });
            }
        }
        this.yearOpt = yearData;
        setTimeout(() => { this.isStartLoading = false; }, 1000);
    }

    handleSelectedSubProducts(event) {
        this.handleselected = event.detail;
        this.showDealerFormulaConfigPage = true;
    }

    get byOptions() {
        return [
            { label: 'Dealer', value: 'dealer' },
            { label: 'Product', value: 'product' },
        ];
    }


    handleChange(event) {
        this.showproducts = false;
        if (event.target.dataset.name == 'year') {
            this.monthDisable = true;
            this.yearVal = event.detail.value;
            this.yearMonthOptions = [];
            if (this.yearVal == parseInt(START_YEAR)) {
                const startIndex = this.months.indexOf(this.monthLabel.specificMonth);
                if (startIndex !== -1) {
                    this.filteredMonths = this.months.slice(startIndex);
                    this.yearMonthOptions = this.filteredMonths.map(month => {
                        return { label: month, value: month };
                    });
                }
            } else {
                this.yearMonthOptions = this.months.map(month => {
                    return { label: month, value: month };
                });
            }
            if (this.yearMonthOptions.length > 0) {
                this.monthDisable = false
            }
        }
        if (event.target.dataset.name == 'month') {
            this.monthVal = event.detail.value;
            this.isLoading = true;
        }
        if (this.monthVal && this.yearVal) {
            this.assignValuesForChild();
            this.handleRowIncentive();
        }
    }
    assignActualProducts() {
        this.hideTab = true;
        setTimeout(() => {
            this.productList = this.commonProductList.filter(product => this.productsWithKpi.includes(product.key));
        }, 100)

    }
    assignValuesForChild() {
        if (this.byValue && this.monthVal && this.yearVal) {
            this.isLoading = true;
            this.isLoad = false;
            if (this.showDealerFormulaConfig) {
                if (this.template.querySelector('c-d-i-dealer-formula-config-page')) {
                    this.template.querySelector('c-d-i-dealer-formula-config-page').month = this.monthVal;
                    this.template.querySelector('c-d-i-dealer-formula-config-page').year = this.yearVal;
                    this.template.querySelector('c-d-i-dealer-formula-config-page').isData();
                }
            } else if (this.showProductFormulaConfig) {
                if (this.template.querySelector('c-d-i-product-formula-config-page')) {
                    this.template.querySelector('c-d-i-product-formula-config-page').month = this.monthVal;
                    this.template.querySelector('c-d-i-product-formula-config-page').year = this.yearVal;
                    this.template.querySelector('c-d-i-product-formula-config-page').getKPITargetAndPayoutInfo(this.monthVal, this.yearVal, false);
                }
            } else if (this.showActualAchievement) {
                this.assignActualProducts();
                if (this.template.querySelector('c-d-i-actual-achievement')) {
                    this.template.querySelector('c-d-i-actual-achievement').month = this.monthVal;
                    this.template.querySelector('c-d-i-actual-achievement').year = this.yearVal;
                    this.template.querySelector('c-d-i-actual-achievement').handleRow(this.currentTab);
                }

            } else if (this.showStockCondition) {
                if (this.template.querySelector('c-d-i-stock-condition')) {
                    this.template.querySelector('c-d-i-stock-condition').month = this.monthVal;
                    this.template.querySelector('c-d-i-stock-condition').year = this.yearVal;
                    this.template.querySelector('c-d-i-stock-condition').handleRow();
                }
            } else if (this.showAdditionalIncentiveConfig) {
                this.productList = [];
                this.addProductList = [...this.commonProductList];
                this.showTabset();
            } else if (this.byValue == 'Add Incentive') {
                this.productList = [];
                this.addProductList = [...this.commonProductList];
                this.showTabset();
            }
            else {
                this.showProductTabset = true;
            }
            setTimeout(() => { this.isLoading = false; }, 3000);
        }
    }

    handleSetCurrentProductTab(event) {
        if (event?.detail) {
            this.productName = event.detail;
        }
    }
    showAndHideFormula() {
        this.showProductTabset = true;
    }

    handleClone() {
        this.cloneYear = '';
        this.cloneMonth = '';
        this.showCloneModal = true;
    }

    handleModalClose() {
        this.showCloneModal = false;
        this.cloneButtonEnable = true;
    }

    handleEventChange() {
        const valueChangeEvent = new CustomEvent("setformula", {
            detail: {
                showProductFormula: this.showProductFormula,
                showDealerFormula: this.showDealerFormula,
                year: this.yearVal,
                month: this.monthVal
            }
        });
        this.dispatchEvent(valueChangeEvent);
    }

    handleIncentive(event) {
        this.isLoading = true;
        if (event) {
            this.byValue = event.target.value;
        }
        if (this.byValue && this.monthVal && this.yearVal) {
            this.productName = this.firstProduct;
            this.currentTab = this.productName;
            this.isLoading = true;
            this.isLoad = false;
            this.retailOrActual = 'retail';
            if (this.showProductTabset) {
                this.productList = [];
                if (this.byValue == 'dealer') {
                    this.showDealerFormulaConfig = true;
                    this.assignProductActive();
                    this.hideAddTab = false;
                    this.hideTab = true;
                    this.showProductFormulaConfig = false;
                    this.showAdditionalIncentiveConfig = false;
                    this.showActualAchievement = false;
                    this.showProductAdd = false;
                    this.showborder = false;
                    this.showStockCondition = false;
                    this.uploadBtnLabel = "Upload Retail Target";
                } else if (this.byValue == 'product') {
                    this.showProductFormulaConfig = true;
                    this.assignProductActive();
                    this.hideAddTab = false;
                    this.showDealerFormulaConfig = false;
                    this.hideTab = true;
                    this.showAdditionalIncentiveConfig = false;
                    this.showActualAchievement = false;
                    this.showProductAdd = false;
                    this.showborder = false;
                    this.showStockCondition = false;
                }
                else if (this.byValue == 'Add Incentive') {
                    this.productList = [];
                    this.addProductList = [...this.commonProductList];
                    this.hideTab = false;
                    this.showborder = true;
                    this.showProductAdd = true;
                    this.showDealerFormulaConfig = false;
                    this.showProductFormulaConfig = false;
                    this.showAdditionalIncentiveConfig = true;
                    this.showActualAchievement = false;
                    this.showStockCondition = false;
                    this.showTabset();
                }
                else if (this.byValue == 'Actual Achievement') {
                    this.assignActualProducts();
                    this.showDealerFormulaConfig = false;
                    this.hideAddTab = false;
                    this.hideTab = true;
                    this.showProductFormulaConfig = false;
                    this.showAdditionalIncentiveConfig = false;
                    this.showActualAchievement = true;
                    this.showProductAdd = false;
                    this.showStockCondition = false;
                    this.showborder = false;
                    this.uploadBtnLabel = "Upload KPI Achievements";
                }
                else if (this.byValue == 'Stock Condition') {
                    this.showStockCondition = true;
                    this.hideTab = false;
                    this.hideAddTab = false;
                    this.showDealerFormulaConfig = false;
                    this.showProductFormulaConfig = false;
                    this.showAdditionalIncentiveConfig = false;
                    this.showActualAchievement = false;
                    this.uploadBtnLabel = "Upload Stock Condition Info";
                }
            } else {
                this.showProductTabset = true;
                if (this.byValue == 'Add Incentive') {
                    this.productList = [];
                    this.addProductList = [...this.commonProductList];
                    this.showProductAdd = true;
                    this.showborder = true;
                    this.hideTab = false;
                    this.showTabset();
                }
            }
        } else {
            this.isLoad = true;
            this.isLoading = false;
        }
        setTimeout(() => { this.isLoading = false; }, 2000);
    }

    assignProductActive() {
        setTimeout(() => {
            this.productList = this.commonProductList;
        }, 200);
    }

    handleRow(productName) {
        this.currentTab = productName;
        if (this.byValue && this.monthVal && this.yearVal) {
            if (this.showDealerFormulaConfig) {
                if (this.template.querySelector('c-d-i-dealer-formula-config-page')) {
                    this.template.querySelector('c-d-i-dealer-formula-config-page').handleRow(productName, this.prodAndSubCategory);
                }
            }
            if (this.showProductFormulaConfig) {
                if (this.template.querySelector('c-d-i-product-formula-config-page')) {
                    this.template.querySelector('c-d-i-product-formula-config-page').productName = this.currentTab;
                    this.template.querySelector('c-d-i-product-formula-config-page').handleRow();
                }
            }
            else if (this.showAdditionalIncentiveConfig) {
                if (this.template.querySelector('c-d-i-additional-incentive')) {
                    this.template.querySelector('c-d-i-additional-incentive').productName = this.currentTab;
                    this.template.querySelector('c-d-i-additional-incentive').handleRow();
                }
            } else if (this.showActualAchievement) {
                if (this.template.querySelector('c-d-i-actual-achievement')) {
                    this.template.querySelector('c-d-i-actual-achievement').productName = this.currentTab;
                    this.template.querySelector('c-d-i-actual-achievement').handleRow(productName);
                }
            } else if (this.showStockCondition) {
                if (this.template.querySelector('c-d-i-stock-condition')) {
                    this.template.querySelector('c-d-i-stock-condition').handleRow();
                }
            }
            else if (this.byValue == 'dealer') {
                this.showDealerFormulaConfig = true;
            } else if (this.byValue == 'product') {
                this.showProductFormulaConfig = true;
            } else if (this.byValue == 'Add Incentive') {
                this.showAdditionalIncentiveConfig = true;
            } else if (this.byValue == 'Actual Achievement') {
                this.hideTab = true;
                this.showActualAchievement = true;
            } else if (this.byValue == 'Stock Condition') {
                this.showStockCondition = true;
                this.hideTab = false;
            }
        }
    }
    handleRowIncentive(event) {
        // this.isStartLoading = true;
        if (event) {
            this.productName = event.currentTarget.getAttribute('data-name');
            this.currentTab = this.productName;
            if (!this.showAdditionalIncentiveConfig) {
                this.template.querySelectorAll('.slds-tabs_default__item').forEach(element => {
                    element.classList.remove('slds-active');
                });
                event.currentTarget.classList.add('slds-active');
            }
        }
        this.handleRow(this.productName);
        if (this.showAdditionalIncentiveConfig) {
            for (let i = 0; i < this.productList.length; i++) {
                if (this.productList[i].label == this.productName) {
                    this.productList[i].active = 'slds-grid slds-tabs_default__item slds-m-left_small slds-border_bottom slds-is-active font';
                }
                else {
                    this.productList[i].active = 'slds-grid slds-tabs_default__item slds-m-left_small';
                }
            }
        }
        if (this.showActualAchievement) {
            this.assignActualProducts();
        }
        // setTimeout(() => {
        //     this.isStartLoading = false;
        // }, 1000);
    }

    handleImport() {
        if (this.template.querySelector('c-d-i-dealer-formula-config-page')) {
            this.template.querySelector('c-d-i-dealer-formula-config-page').showImport = true;
        }
    }
    handleDownloadUpload() {

        if (this.template.querySelector('c-d-i-actual-achievement')) {
            this.template.querySelector('c-d-i-actual-achievement').showDownloadUpload = true;
        }
    }

    handleStockDownloadUpload() {

        if (this.template.querySelector('c-d-i-stock-condition')) {
            this.template.querySelector('c-d-i-stock-condition').showDownloadUpload = true;
        }
    }

    renderedCallback() {
        if (this.isLibraryLoaded) return;
        this.isLibraryLoaded = true;
        loadScript(this, workbook)
            .then(async (data) => {

            })
            .catch(error => {
            });
        const tabs = this.template.querySelectorAll('.productTab');
        tabs.forEach(tab => {
            if (!tab.classList.contains('modified')) {
                tab.classList.add('modified');
                const words = tab.label.split(' ');
                if (words.length > 1) {
                    const lastWord = words.pop();
                    const updatedLabel = `${words.join(' ')} <span class="highlightcount">${lastWord}</span>`;
                    tab.label = updatedLabel;
                }
            }
        });
    }

    async exportToXLSX() {
        this.createObjectArray();
        await writeXlsxFile(this.objects, {
            sheets: this.sheetNames,
            schema: this.objectArray,
            fileName: 'Incentive_Template.xlsx',
            headerStyle: {
                backgroundColor: '#E7AF28',
                fontWeight: 'bold',
                align: 'center',
                color: '#000000',
                borderColor: '#000000'
            },
        })
    }

    createObjectArray() {
        this.objectArray = []; this.objects = []; this.sheetNames = [];
        for (const key in this.prodAndSubCategory) {
            let columns_Array = [{ column: 'S.No', type: Number, value: d => { if (this.count <= this.dealerRecords.length) { return this.count++ } else { this.count = 1; return this.count++ } }, align: "center", width: 10, borderColor: '#000000' }, { column: 'Dealer Name', type: String, value: d => d.Name, width: 50, borderColor: '#000000' }];
            for (let j = 0; j < this.prodAndSubCategory[key].subCategoryList.length; j++) {
                let obj = {
                    column: this.prodAndSubCategory[key].subCategoryList[j].name,
                    type: String,
                    align: "center",
                    width: 20,
                    wrap: true,
                    value: d => null,
                    borderColor: '#000000'
                }
                columns_Array.push(obj);
            }
            if (key == 'TH') {
                columns_Array.push({ column: 'Demo Target', type: String, align: "center", width: 20, wrap: true, value: d => null, borderColor: '#000000' });
            }
            columns_Array.push({ column: 'Id', type: String, value: d => d.Id, align: "center", width: 20, borderColor: '#000000' });
            this.objectArray.push(columns_Array);
            this.objects.push(this.dealerRecords);
            this.sheetNames.push(key);
        }
    }

    getProductsubCategory() {
        getProductAndSubProducts({}).then(result => {
            if (result) {
                Object.keys(result).forEach(prd => {
                    Object.values(result).forEach(order => {
                        if (prd == order.name) {
                            this.productList.push({ key: prd, label: prd, order: order.orderNo, active: 'slds-tabs_default__item' });
                        }
                    })
                });
                if (this.productList?.length) {
                    this.productList[0].active = 'slds-tabs_default__item slds-active';
                }
                this.commonProductList = this.productList;
                this.prodAndSubCategory = result;
                this.getProductsAndKPI();
            }
            this.productName = this.productList[0]?.key;
            this.currentTab = this.productList[0]?.key;
            this.firstProduct = this.productList[0]?.key;
        }).catch(error => {
        })
    }

    handleProduct() {
        this.showproducts = true;
    }

    handleKpiMouseOver(event) {
        var key = event.target.dataset.key;
        this.isDropdown = key;
    }

    handleKpiLeave() {
        this.isDropdown = null;
    }

    changeProduct(event) {
        this.showproducts = false;
        this.isDropdown = null;
        var name = event.target.getAttribute('data-name');
        var order = event.target.getAttribute('data-order');
        this.productList.push({ key: name, label: name, order: order, active: "slds-grid slds-tabs_default__item slds-m-left_small slds-border_bottom slds-is-active font", });
        for (let i = 0; i < this.productList.length; i++) {
            if (name != this.productList[i].label) {
                this.productList[i].active = 'slds-grid slds-tabs_default__item slds-m-left_small';
            }
        }
        this.hideAddTab = true;
        for (let i = 0; i < this.addProductList.length; i++) {
            if (this.addProductList[i].label == name) {
                this.addProductList.splice(i, 1);
                break;
            }
        }
        this.handleRow(name);
        if (this.addProductList.length == 0) {
            this.showProductAdd = false;
        }

    }

    handleTabClick(event) {
        var name = event.target.getAttribute('data-name');
        if (event.target.closest('button') && event.target.closest('button').getAttribute('title') === name) {
            event.target.closest('c-d-i-additional-incentive').closeAddTab();
        }
    }

    removeTab(event) {
        var name = event.target.getAttribute('data-name');
        if (this.template.querySelector('c-d-i-additional-incentive')) {
            this.template.querySelector('c-d-i-additional-incentive').showModalRemoveTab(name);
        }
    }

    tabRemove(event) {
        this.isDiscard = true;
        var name = JSON.parse(JSON.stringify(event.detail));
        this.removeName = name;
        var spliceElement;
        var spliceArray;
        for (let i = 0; i < this.productList.length; i++) {
            if (this.productList[i].label == name) {
                this.addProductList.push({ key: name, label: name, order: this.productList[i].order });
                spliceElement = i;
                spliceArray = this.productList[i].active;
                this.productList.splice(i, 1);
                break;
            }
        }
        this.addProductList = [...this.addProductList].sort((a, b) => (a.order > b.order ? 1 : -1));
        if (this.productList.length > 0) {
            spliceElement = spliceElement == 0 ? 0 : spliceElement - 1;
            this.handleRow(this.productList[spliceElement].label);
            if (spliceArray.includes('slds-is-active')) {
                this.productList[spliceElement].active = 'slds-grid slds-tabs_default__item slds-m-left_small slds-border_bottom slds-is-active font';
            }
        } else {
            this.showAdditionalIncentiveConfig = false;
        }
        if (this.addProductList.length > 0) {
            this.showProductAdd = true;
        }
    }
}