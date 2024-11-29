import { LightningElement, track, api } from 'lwc';
import getProductAndSubProducts from '@salesforce/apex/JCBDealerIncentiveController.getProductAndSubProducts';
import getProductsAndKPI from '@salesforce/apex/JCBDealerIncentiveController.getProductsAndKPI';
import getKPITargetAndPayoutInfo from '@salesforce/apex/dIFormulaController.getKPITargetAndPayoutInfo';
import saveProductKPIAndTarget from '@salesforce/apex/dIFormulaController.saveProductKPIAndTarget';
import deleteRecordInDatabase from '@salesforce/apex/dIFormulaController.deleteRecordInDatabase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';
import getProductTargets from '@salesforce/apex/dIFormulaController.getProductTargets';
import deleteAdditionalRecords from '@salesforce/apex/dIFormulaController.deleteAdditionalRecords';
import Growth_Incentive from '@salesforce/label/c.Is_Growth_Incentive';

export default class DIAdditionalIncentive extends LightningElement {
    customLabel = false;
    @track showproducts = false;
    @track currentProduct = [];
    @track productList = [];
    @api productName;
    @track productKPITargets = [];
    @track isLoading = false;
    @track showUnsavedWarning = false;
    @api productTargetAndPayout = [];
    @api productKPITargetsInfo = {};
    @api selectedKPITarget = [];
    @api isDiscardChange;
    @api isName;
    @track showDeleteWarning = false;
    @track showFooter = false;
    @track productKPISlabs = {};
    @api year;
    @api month;
    @track recordId;
    productTargetsAndPayouts;
    listOfIds = [];
    isProductName;
    @track showKpiTargetMenu = [];
    @track showAddKpi;
    @track kpiIndex;
    @track stock = {};
    @track selectedName = 'kpi';
    @api typeName;
    previousMonth;
    previousYear;
    @track isSalesIncentive = false;
    @track kpiMenuItemValue;
    totalKpiMenuItemOptions = [];
    kpiMenuItemOptionsToShow;
    showProductKpiTargetInfo = {};
    @track indexVal;
    @track showDeleteKpiTarget = false;
    selectedIndexToDelete;
    selectedKpiToDelete;
    @track kpiLabel;
    deletedIds = { kpiTarget: [], slabId: [], growthTarget: [], growSlab: [] };
    @api showSalesmanIncentive = false;
    @api salesPersonIncentive = [];
    @track saleInd;
    slabIds = [];
    productKpiId;
    @track slabs = [];
    @track productTargets = [];
    @track errorMessage = '';
    @track successMessage = '';
    @track disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small";
    @track showMultipleKPI = false;
    @track showBHLTOCE = false;

    get optionsRange() {
        return [
            { label: 'Greater than', value: '>' },
            { label: 'Less than', value: '<' },
            { label: 'Equal to', value: '==' },
            { label: 'Not Equal to', value: '!=' },
            { label: 'Greater than or equal to', value: '>=' },
            { label: 'Less than or equal to', value: '<=' },
        ];
    }

    connectedCallback() {
        this.customLabel = Growth_Incentive == 'Growth' ? true : false;
        this.getProductsubCategory();
        if (this.selectedName == 'kpi') {
            this.typeName = 'Additional Incentive Target';
        }
        this.getProductTargets();
    }

    getProductTargets() {
        this.productTargets = [];
        getProductTargets({ month: this.month, year: this.year })
            .then(result => {
                this.productTargets = result;
                this.setStockPolicy();
            })
            .catch(error => {
            });
    }

    formatStock(productName) {
        let stockPolicy = this.productTargets.find(stock => stock.DI_Product_Category__r.Name == this.productName);
        let stock = {};
        stock.productName = productName;
        stock.DI_Product_Category__c = stockPolicy?.DI_Product_Category__r?.Id || this.productCategoryList[this.productName].productId;
        stock.Id = stockPolicy?.Id || "";
        stock.stockPolicyName = 'stockpolicy';
        stock.Year__c = this.year;
        stock.Month__c = this.month;
        stock.Stock_Policy__c = parseInt(stockPolicy?.Stock_Policy__c) || 0;
        return stock;
    }
    setStockPolicy() {
        this.stock = this.formatStock(this.productName);
    }

    handleMonthChange(event) {
        const monthYear = JSON.parse(JSON.stringify(event.detail));
        this.previousYear = monthYear.year;
        this.previousMonth = monthYear.month;
    }

    handleSelect(event) {
        const selectedName = event.detail.name;
        this.selectedName = selectedName;
        if (selectedName == 'kpi') {
            this.typeName = 'Additional Incentive Target';
            this.showMultipleKPI = false;
            this.showBHLTOCE = false;
            this.getKPITargetAndPayoutInfo();
        } else if (selectedName == 'growth') {
            this.typeName = 'Growth Additional Incentive';
            this.showMultipleKPI = false;
            this.showBHLTOCE = false;
            this.getKPITargetAndPayoutInfo();
        } else if(selectedName == 'CER') {
            this.showAddKpi = false;
            this.showMultipleKPI = false;
            this.showBHLTOCE = true;
            this.selectedKPITarget = [];
        }else{
            this.showAddKpi = false;
            this.showMultipleKPI = true;
            this.showBHLTOCE = false;
            this.selectedKPITarget = [];
        }
        const evtName = new CustomEvent('typename', {
            detail: this.typeName
        });
        this.dispatchEvent(evtName);
    }


    handleKpiMenuItemoptions(event) {
        this.isLoading = true;
        this.disableParentAdditional('edit');
        this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small blurNavigation";
        const selectedKpi = event.detail.value;
        let scheme = this.prodAndSchemes[this.productName];
        let isContain = false;
        let valueDel;
        let toShoww;
        for (let j = 0; j < this.selectedKPITarget.length; j++) {
            if (this.selectedKPITarget[j].kpiTargetName.includes(selectedKpi)) {
                this.selectedKPITarget[j].showContainer = true;
                this.selectedKPITarget[j].callComponent = true;
                this.selectedKPITarget[j].i
                this.showAddKpi = false;
                this.showFooter = true;
                isContain = true;
                for (let k = 0; k < this.kpiMenuItemOptionsToShow.length; k++) {
                    if (this.kpiMenuItemOptionsToShow[k].value == selectedKpi) {
                        valueDel = this.kpiMenuItemOptionsToShow[k].value;
                        this.kpiMenuItemOptionsToShow[k].toShow = false;
                        toShoww = this.kpiMenuItemOptionsToShow[k].toShow == false ? true : false;
                        break;
                    }
                }
            } else {
                this.selectedKPITarget[j].showContainer = false;
            }
        }
        if (!isContain) {
            for (let i = 0; i < scheme.length; i++) {
                if (scheme[i].KPI__r.Name == selectedKpi) {
                    for (let j = 0; j < this.kpiMenuItemOptionsToShow.length; j++) {
                        if (this.kpiMenuItemOptionsToShow[j].value == selectedKpi) {
                            this.kpiMenuItemOptionsToShow[j].toShow = false;
                            break;
                        }
                    }
                    this.productKpiId = scheme[i].Id;
                    let kpiTarget = {};
                    kpiTarget.productName = scheme[i].Product_Category__r.Name;
                    kpiTarget.productId = scheme[i].Product_Category__r.Id;
                    if (scheme[i].KPI__r.Name == 'Volume') {
                        kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Incentive';
                        kpiTarget.isSlab = true;
                        kpiTarget.isRange = false;
                    } else {
                        kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Target';
                        kpiTarget.isSlab = false;
                        kpiTarget.isRange = false;
                    }
                    kpiTarget.kpiId = scheme[i].KPI__r.Id;
                    kpiTarget.productKPIId = scheme[i].Id;
                    kpiTarget.productKPI = { productKPIId: scheme[i].Id, kpiId: scheme[i].KPI__r.Id, kpiName: scheme[i].KPI__r.Name, productId: scheme[i].Product_Category__c, productName: scheme[i].Product_Category__r.Name };
                    kpiTarget.hasSlabs = false;
                    kpiTarget.month = this.month;
                    kpiTarget.year = this.year;
                    kpiTarget.type = this.typeName;
                    kpiTarget.incentiveSlabs = [];
                    kpiTarget.showContainer = true;
                    kpiTarget.callComponent = true;
                    kpiTarget.showKPI = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                    this.showFooter = true;
                    this.showAddKpi = false;
                    this.selectedKPITarget.push(kpiTarget);
                    break;
                }
            }
        }
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    handleAddNewKpiCard() {
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
        for (let i = 0; i < this.kpiMenuItemOptionsToShow.length; i++) {
            if (this.kpiMenuItemOptionsToShow[i].toShow == true) {
                this.showAddKpi = true;
                break;
            } else {
                this.showAddKpi = false;
            }
        }
    }

    @api handleRow() {
        this.isLoading = true;
        this.productId = this.productCategoryList[this.productName].productId;
        if (this.selectedName == 'customer') {
            if (this.template.querySelector('c-d-i-multiple-kpi-target')) {
                this.template.querySelector('c-d-i-multiple-kpi-target').productName = this.productName;
                this.template.querySelector('c-d-i-multiple-kpi-target').productId = this.productId;
                this.template.querySelector('c-d-i-multiple-kpi-target').getMultiKPITargets();
            }
        } else {
            if (this.productName && this.prodAndSchemes) {
                this.getInitialData();
                this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
                this.handleAddNewKpiCard();
            }
            this.getProductTargets();
            this.setStockPolicy();
        }
        this.isLoading = false;
    }

    @track productId;
    getProductsubCategory() {
        this.isLoading = true;
        getProductAndSubProducts({}).then(result => {
            if (result) {
                this.productList = Object.keys(result);
                this.productCategoryList = result;
                this.productId = this.productCategoryList[this.productName].productId;
                this.getProductsAndKPI();
            }
        }).catch(error => {
            this.isLoading = false;
        })
    }

    getProductsAndKPI() {
        getProductsAndKPI({}).then(result => {
            this.prodAndSchemes = result;
            this.getKpiWithOption();
            this.getKPITargetAndPayoutInfo();
            this.isLoading = false;
        })
            .catch(error => {
                this.isLoading = false;
            })
    }

    getKpiWithOption() {
        for (const key in this.prodAndSchemes) {
            let storeKpi = this.prodAndSchemes[key];
            this.totalKpiMenuItemOptions[key] = [];
            for (let i = 0; i < storeKpi.length; i++) {
                if (storeKpi[i].KPI__r.KPI_Visiblity__c.includes('KPI Target')) {
                    if (storeKpi[i].KPI__r.Name == 'Volume') {
                        this.totalKpiMenuItemOptions[key].push({ label: storeKpi[i].KPI__r.Name + ' Incentive', value: storeKpi[i].KPI__r.Name, name: storeKpi[i].Product_Category__r.Name, toShow: true });
                    } else {
                        this.totalKpiMenuItemOptions[key].push({ label: storeKpi[i].KPI__r.Name, value: storeKpi[i].KPI__r.Name, name: storeKpi[i].Product_Category__r.Name, toShow: true });
                    }
                }
            }
        }
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
    }

    @api getKPITargetAndPayoutInfo() {
        this.productTargetAndPayout = [];
        this.productKPITargetsInfo = {};
        this.selectedKPITarget = [];
        let type = [this.typeName];
        getKPITargetAndPayoutInfo({ month: this.month, year: this.year, type: type }).then(res => {
            this.productTargetAndPayout = res;
            this.getKpiWithOption();
            if (this.productTargetAndPayout.length > 0) {
                this.setKPIAndPayoutInfo();
            } else {
                this.getInitialData();
            }
            this.setStockPolicy();
        }).catch(error => { });
    }

    setKPIAndPayoutInfo() {
        for (const key in this.prodAndSchemes) {
            this.productKPITargetsInfo[key] = [];
            let scheme = this.prodAndSchemes[key];
            let record = this.productTargetAndPayout.find(prod => prod.productKPI.productName == key);
            if (record) {
                for (let i = 0; i < scheme.length; i++) {
                    if (scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target')) {
                        let productTarget = this.productTargetAndPayout.find((prod) => prod.productKPI.productKPIId == scheme[i].Id);
                        if (productTarget) {
                            let prod = this.totalKpiMenuItemOptions[key];
                            for (let j = 0; j < prod.length; j++) {
                                if (prod[j].value == productTarget.productKPI.kpiName) {
                                    prod[j].toShow = false;
                                }
                            }
                            let kpiTarget = {};
                            kpiTarget.recordId = productTarget.recordId;
                            kpiTarget.productName = productTarget.productKPI.productName;
                            kpiTarget.productId = productTarget.productKPI.productId;
                            if (productTarget.productKPI.kpiName == 'Volume') {
                                kpiTarget.kpiTargetName = productTarget.productKPI.kpiName + ' Incentive';
                            } else {
                                kpiTarget.kpiTargetName = productTarget.productKPI.kpiName + ' Target';
                            }
                            kpiTarget.kpiId = productTarget.productKPI.kpiId;
                            kpiTarget.isSalesmanIncentive = productTarget.productKPI.isSalesmanIncentive;
                            kpiTarget.productKPIId = productTarget.productKPI.productKPIId;
                            kpiTarget.productKPI = productTarget.productKPI;
                            kpiTarget.hasSlabs = productTarget.hasSlabs;
                            kpiTarget.month = productTarget.month;
                            kpiTarget.year = productTarget.year;
                            kpiTarget.allMachineRetail = productTarget.allMachineRetail ? true : false;
                            kpiTarget.prevMonth = productTarget.prevMonth;
                            kpiTarget.prevYear = productTarget.prevYear;
                            kpiTarget.type = productTarget.type;
                            kpiTarget.incentiveAmount = productTarget.incentiveAmount;
                            kpiTarget.incentiveSlabs = [];
                            kpiTarget.firstTwoSlabs = [];
                            kpiTarget.remainingSlabs = [];
                            kpiTarget.displayShowMore = false;
                            kpiTarget.additionalTHIncentive = [];
                            kpiTarget.showContainer = true;
                            kpiTarget.callComponent = false;
                            kpiTarget.isSlab = productTarget.hasSlabs;
                            kpiTarget.isRange = productTarget.target != null;
                            kpiTarget.isSlabNotEmpty = true;
                            kpiTarget.targetOptions = [{ label: 'Range', value: 'range', isSelected: false }, { label: 'Slab', value: 'slab', isSelected: productTarget.productKPI.kpiName == 'Volume' ? true : false }];
                            kpiTarget.showKPI = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                            if (productTarget.slabInfo && productTarget.slabInfo.length > 0) {
                                for (let k = 0; k < productTarget.slabInfo.length; k++) {
                                    var slab = {};
                                    slab.id = k + 1;
                                    slab.slabId = productTarget.slabInfo[k].slabId;
                                    slab.incentive = 'Incentive Amount';
                                    slab.incentiveSymbol = '₹';
                                    if (productTarget.slabInfo[k].slabRange) {
                                        if (productTarget.slabInfo[k].slabRange.includes('to')) {
                                            slab.isSingle = false;
                                            slab.isStartEnd = true;
                                            let ranges = productTarget.slabInfo[k].slabRange.split(' ');
                                            slab.rangeStart = ranges[0];
                                            slab.rangeStartPercent = ranges[1];
                                            slab.rangeEnd = ranges[3];
                                            slab.rangeEndPercent = ranges[4];
                                            slab.rangeSlab = slab.rangeStart + slab.rangeStartPercent + '% to ' + slab.rangeEnd + slab.rangeEndPercent + '%';
                                            if (this.selectedName == 'growth') {
                                                slab.isGrowthIncentive = true;
                                                let grow = productTarget.slabInfo[k].growthRange.split(' ');
                                                slab.growthRange = grow[0];
                                                slab.growthPercent = grow[1];
                                                slab.growthSlab = slab.growthRange + slab.growthPercent + '%';
                                            }
                                        } else {
                                            slab.className = 'slds-size_1-of-5';
                                            slab.isSingle = true;
                                            slab.isStartEnd = false;
                                            let ranges = productTarget.slabInfo[k].slabRange.split(' ');
                                            slab.rangeStart = ranges[0];
                                            slab.rangeStartPercent = ranges[1];
                                            slab.rangeSlab = slab.rangeStart + slab.rangeStartPercent + '%';
                                            if (this.selectedName == 'growth') {
                                                slab.isGrowthIncentive = true;
                                                let grow = productTarget.slabInfo[k].growthRange.split(' ');
                                                slab.growthRange = grow[0];
                                                slab.growthPercent = grow[1];
                                                slab.growthSlab = slab.growthRange + slab.growthPercent + '%';
                                            }
                                        }
                                    }
                                    slab.incentiveValue = productTarget.slabInfo[k].amount;
                                    slab.incentiveKpiValue = productTarget.slabInfo[k].amount;
                                    slab.allMachineRetail = productTarget.slabInfo[k].allMachineRetail ? true : false;
                                    kpiTarget.incentiveSlabs.push(slab);
                                    if (kpiTarget.firstTwoSlabs.length < 4) {
                                        kpiTarget.firstTwoSlabs.push(slab);
                                    } else {
                                        kpiTarget.remainingSlabs.push(slab);
                                    }
                                    if (kpiTarget.incentiveSlabs.length > 4) {
                                        kpiTarget.displayShowMore = true;
                                    }
                                    if (kpiTarget.incentiveSlabs.length == 0) {
                                        kpiTarget.isSlabNotEmpty = false;
                                    }
                                }
                            } else {
                                var incentiveRange = {};
                                if (productTarget.target != null) {
                                    if (productTarget.target.includes('to')) {
                                        incentiveRange.isStart = true;
                                        let ranges = productTarget.target.split(' ');
                                        incentiveRange.startRange = ranges[0];
                                        incentiveRange.startPercent = ranges[1];
                                        incentiveRange.endRange = ranges[3];
                                        incentiveRange.endPercent = ranges[4];
                                        incentiveRange.targetRange = incentiveRange.startRange + incentiveRange.startPercent + '% to ' + incentiveRange.endRange + incentiveRange.endPercent + '%';
                                        incentiveRange.incentiveAmountStart = productTarget.incentiveAmount;
                                        incentiveRange.amountOfIncentive = productTarget.incentiveAmount;
                                    } else {
                                        incentiveRange.isSingle = true;
                                        let ranges = productTarget.target.split(' ');
                                        incentiveRange.singleRange = ranges[0];
                                        incentiveRange.singlePercent = ranges[1];
                                        incentiveRange.targetRange = incentiveRange.singleRange + incentiveRange.singlePercent + '%';
                                        incentiveRange.targetRangeVolume = incentiveRange.singlePercent + '%';
                                        incentiveRange.incentiveAmount = productTarget.incentiveAmount;
                                        incentiveRange.amountOfIncentive = productTarget.incentiveAmount;
                                        if (productTarget.productKPI.productName == 'TH') {
                                            if (productTarget.machineTarget && productTarget.machineTarget.length > 0) {
                                                for (let m = 0; m < productTarget.machineTarget.length; m++) {
                                                    var machine = {};
                                                    if (productTarget.machineTarget[m].slabRange) {
                                                        let ranges = productTarget.machineTarget[m].slabRange.split(' ');
                                                        machine.target = ranges[0];
                                                        machine.volume = ranges[1];
                                                        machine.amount = productTarget.machineTarget[m].amount;
                                                        machine.targetVolume = '+' + machine.volume;
                                                    }
                                                    kpiTarget.additionalTHIncentive.push(machine);
                                                    kpiTarget.showButton = machine.target == '==' ? true : false;
                                                }
                                            }
                                        }
                                    }

                                }
                                kpiTarget.incentiveRange = incentiveRange;
                                kpiTarget.showTHIncentive = kpiTarget.additionalTHIncentive.length > 0;
                                kpiTarget.showMessage = kpiTarget.additionalTHIncentive.length > 0;
                            }
                            this.productKPITargetsInfo[key].push(kpiTarget);
                        }
                        else {
                            if (key == this.productName) {
                                this.showAddKpi = true;
                            }
                        }
                    }
                }
            }
        }
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
        this.handleAddNewKpiCard();
        this.selectedKPITarget = this.productKPITargetsInfo[this.productName];
    }

    getInitialData() {
        let isTargetExist = this.productKPITargetsInfo[this.productName] && this.productKPITargetsInfo[this.productName].length > 0;
        if (isTargetExist) {
            this.selectedKPITarget = this.productKPITargetsInfo[this.productName];
        } else if (!isTargetExist) {
            this.showAddKpi = true;
            this.selectedKPITarget = [];
            this.handleAddNewKpiCard();
        }
    }

    handleHideInputs(event){
        console.log('OUTPUT : ',event.detail);
        if(event.detail == 'edit'){
            this.disableParentAdditional('edit');
            this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small blurNavigation";
        }else{
            this.disableParentAdditional('cancel');
            this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small";
        }
    }

    handleData() {
        this.productKPITargets = [];
        var productKPITarget = {};
        productKPITarget.productId = this.productCategoryList[this.productName].productId;
        productKPITarget.productName = this.productCategoryList[this.productName].name;
        productKPITarget.isVisible = true;
        productKPITarget.kpiTargets = [];
        var prodSchemes = this.prodAndSchemes[this.productName];
        for (let i = 0; i < prodSchemes.length; i++) {
            let kpiTarget = {};
            kpiTarget.kpiId = prodSchemes[i].KPI__r.Id;
            kpiTarget.targetOptions = [{ label: 'Range', value: 'range' }, { label: 'Slab', value: 'slab' }];
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = false;
            if (prodSchemes[i].KPI__r.Name == 'Volume') {
                kpiTarget.kpiName = prodSchemes[i].KPI__r.Name + ' Incentive';
            } else {
                kpiTarget.kpiName = prodSchemes[i].KPI__r.Name + ' Target';
            }
            productKPITarget.kpiTargets.push(kpiTarget);
        }
        this.productKPITargets.push(productKPITarget);
    }

    createTarget(event) {
        var prodIndex = event.target.dataset.prodindex;
        var kpiIndex = event.target.dataset.kpiindex;
        var value = event.target.value;
        var kpiTarget = this.productKPITargets[prodIndex].kpiTargets[kpiIndex];
        kpiTarget.incentiveRange = {};
        kpiTarget.incentiveRange.isRange = true;
        kpiTarget.incentiveRange.isSingle = value == 'singleTarget' ? true : false;
        kpiTarget.incentiveRange.isStart = value == 'startTarget' ? true : false;
        this.productKPITargets[prodIndex].kpiTargets[kpiIndex] = kpiTarget;
    }

    removeTarget(event) {
        var prodIndex = event.target.dataset.prodindex;
        var kpiIndex = event.target.dataset.kpiindex;
        var kpiTarget = this.productKPITargets[prodIndex].kpiTargets[kpiIndex];
        kpiTarget.incentiveRange = null;
    }

    editKPITarget(event) {
        this.isLoading = true;
        this.showAddKpi = false;
        this.showFooter = true;
        this.disableParentAdditional('edit');
        this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small blurNavigation";
        var prodIndex = event.target.dataset.prodindex;
        var prodId = event.target.dataset.prodid;
        var kpiId = event.target.dataset.kpiid;
        var pkpiId = event.target.dataset.pkpiid;
        this.kpiIndex = pkpiId;
        this.selectedKPITarget.forEach(prod => {
            if (prod.productKPIId == pkpiId) {
                prod.callComponent = true;
            } else {
                prod.showContainer = false;
            }
            return prod;
        });
        setTimeout(() => {
            this.isLoading = false;
        }, 1000)
    }

    clearValues(event) {
        var showModal = this.template.querySelector('c-d-i-product-formula-edit-page').handleEditOrChange();
        this.pkpiId = event.target.dataset.pkpiid;
        this.indexVal = event.target.dataset.prodindex;
        if (showModal) {
            this.showUnsavedWarning = true;
        } else {
            this.handleIncentiveCancel();
        }
    }

    handleUnsaveClose() {
        this.showUnsavedWarning = false;
        this.handleDiscard();
    }

    handleDiscard() {
        this.selectedKPITarget.forEach(kpi => {
            if (kpi.productKPIId == this.pkpiId) {
                for (let i = 0; i < kpi.incentiveSlabs.length; i++) {
                    if (!kpi.incentiveSlabs[i].incentiveValue) {
                        kpi.incentiveSlabs.splice(i, 1);
                        i--;
                    }
                }
                kpi.isSlab = kpi.incentiveSlabs.length > 0;
                kpi.isRange = kpi.incentiveRange && (kpi.incentiveRange.isSingle || kpi.incentiveRange.isStart) ? true : false;
                if (kpi.incentiveRange && (kpi.incentiveRange.isSingle || kpi.incentiveRange.isStart) && (kpi.incentiveRange.incentiveAmount || kpi.incentiveRange.incentiveAmountStart)) {
                    kpi.isRange = true;
                } else {
                    kpi.isRange = false;
                    kpi.incentiveRange = null;
                }
                kpi.callComponent = false;
            }
        })
        this.showFooter = false;
        this.disableParentAdditional('cancel');
        this.handleIncentiveCancel();
    }

    chunkedList = [];
    handleSave() {
        this.isLoading = true;
        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
            this.productKPITargets = this.template.querySelector('c-d-i-product-formula-edit-page').getKpiTarget();
            this.selectedKPITarget = this.template.querySelector('c-d-i-product-formula-edit-page').getKpiTarget();
            this.productKPITargetsInfo[this.productName] = this.selectedKPITarget;
        }
        let id2Delete = this.template.querySelector('c-d-i-product-formula-edit-page').deletedIds;
        if (id2Delete?.length > 0) {
            this.deletedIds.slabId = [...this.deletedIds.slabId, ...id2Delete]
        }
        this.chunkedList = [];
        for (const key in this.deletedIds) {
            this.chunkedList = [...this.chunkedList, ...this.chunkArray(this.deletedIds[key], 100)];
        }
        let isValid = this.requiredCheck();
        if (isValid) {
            this.prepareTargetAndPayoutInfo();
            this.saveProductKPITarget();
            this.showUnsavedWarning = false;

        } else {
            let validToSave = this.template.querySelector('c-d-i-product-formula-edit-page').getValidToSave();
            this.showUnsavedWarning = false;
            this.isLoading = false;
        }
    }

    saveProductKPITarget() {
        let stockPolicies = [this.stock];
        saveProductKPIAndTarget({ kpiTargetsAndPayouts: this.productTargetsAndPayouts, deletedIds: this.chunkedList, productTarget: stockPolicies })
            .then(result => {
                this.toast('Configurations has been saved successfully !', 'success');
                this.getTargetsAndPayouts();
                this.showFooter = false;
                this.disableParentAdditional('cancel');
                this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small";
                this.getKPITargetAndPayoutInfo();
                this.getProductTargets();
                this.deletedIds = { kpiTarget: [], slabId: [], growthTarget: [], growSlab: [] };
                setTimeout(() => { this.isLoading = false; }, 500);
            }).catch(error => {
                console.log('ERROR  ===', error);

            })
    }

    // getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     getTargetsAndPayouts({month : this.month, year : this.year, dealerIds : dealerIds, isActual : false}).then(res => {
    //         getDealerTargetsAndPayouts(res);
    //     }).catch(error => {
    //         console.error('get targets error ====    ', error);
    //     })
    // }

    @track recalculateLoading = false;
    async getTargetsAndPayouts() {
        try {
            let dealerIds = [];
            this.recalculateLoading = true;

            const res = await getTargetsAndPayouts({
                month: this.month,
                year: this.year,
                // dealerIds: dealerIds,
                isActual: false
            });

            if (res?.dealerIncIds?.length > 0) {
                const message = await getDealerTargetsAndPayouts(res);

                if (message === 'SUCCESS') {
                    this.recalculateLoading = false;
                    this.toast('New configurations have been saved, and the payouts have been recalculated successfully!.', 'success');
                } else {
                    this.recalculateLoading = false;
                    this.toast('An error occurred while recalculating the payouts.', 'error');
                }
            } else {
                this.recalculateLoading = false;
            }
        } catch (error) {
            console.error('get targets error:', error);
            this.recalculateLoading = false;
            this.toast('An error occurred while fetching targets.', 'error');
        }
    }

    prepareTargetAndPayoutInfo() {
        this.productTargetsAndPayouts = [];
        for (const key in this.productKPITargetsInfo) {
            let targetInfo = [];
            this.productKPITargetsInfo[key].forEach(kpiTarget => {
                if (kpiTarget.showContainer) {
                    let kpi = {};
                    kpi.month = kpiTarget.month;
                    kpi.year = kpiTarget.year;
                    kpi.allMachineRetail = kpiTarget?.allMachineRetail ? true : false;
                    kpi.recordId = kpiTarget.recordId;
                    kpi.type = kpiTarget.type;
                    if (kpiTarget.type == 'Growth Additional Incentive') {
                        kpi.prevYear = kpiTarget.prevYear;
                        kpi.prevMonth = kpiTarget.prevMonth;
                    }
                    kpi.productKPI = kpiTarget.productKPI;
                    kpi.slabInfo = [];
                    kpi.machineTarget = [];
                    kpi.hasSlabs = kpiTarget.hasSlabs;
                    if (kpiTarget.incentiveSlabs && kpiTarget.incentiveSlabs.length > 0) {
                        kpiTarget.incentiveSlabs.forEach(slab => {
                            if (slab.isSingle) {
                                slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent;
                                if (kpiTarget.type == 'Growth Additional Incentive') {
                                    slab.growthRange = slab.growthRange + ' ' + slab.growthPercent;
                                }
                            } else if (slab.isStartEnd) {
                                slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent + ' to ' + slab.rangeEnd + ' ' + slab.rangeEndPercent;
                                if (kpiTarget.type == 'Growth Additional Incentive') {
                                    slab.growthRange = slab.growthRange + ' ' + slab.growthPercent;
                                }
                            }
                            slab.amount = slab.incentiveValue;
                            slab.allMachineRetail = slab.allMachineRetail ? true : false;
                            kpi.slabInfo.push(slab);
                        });
                        kpi.hasSlabs = true;
                    } else if (kpiTarget.showKPI) {
                        if (kpiTarget.incentiveRange) {
                            var range = kpiTarget.incentiveRange;
                            if (!kpiTarget.isSlab) {
                                if (range.isSingle == true) {
                                    kpi.target = range.singleRange + ' ' + range.singlePercent;
                                    kpi.incentiveAmount = range.incentiveAmount;
                                    if (kpiTarget.productName == 'TH') {
                                        if (kpiTarget.additionalTHIncentive && kpiTarget.additionalTHIncentive.length > 0) {
                                            kpiTarget.additionalTHIncentive.forEach(machine => {
                                                machine.slabRange = machine.target + ' ' + machine.volume;
                                                machine.amount = machine.amount;
                                                kpi.machineTarget.push(machine);
                                            })
                                        }
                                    }
                                } else if (range.isStart) {
                                    kpi.target = range.startRange + ' ' + range.startPercent + ' to ' + range.endRange + ' ' + range.endPercent;
                                    kpi.incentiveAmount = range.incentiveAmountStart;
                                }
                                kpi.hasSlabs = false;
                                kpi.slabInfo = [];
                            }
                        }
                    }
                    if (((kpi.slabInfo.length > 0 || kpi.target) && kpi.recordId == null) || kpi.recordId) {
                        targetInfo.push(kpi);
                    }
                }
            });
            if (targetInfo && targetInfo.length > 0) {
                this.productTargetsAndPayouts = [...this.productTargetsAndPayouts, ...targetInfo];
            }
        }
    }

    requiredCheck() {
        let isValid = true;
        for (let i = 0; i < this.selectedKPITarget.length; i++) {
            let prodKPI = this.selectedKPITarget[i];
            if (prodKPI.showKPI && prodKPI.showContainer) {
                if (prodKPI.isSlab) {
                    if (prodKPI.incentiveSlabs.length == 0) {
                        this.toast('Please Select Slabs or Range', 'error');
                        isValid = false;
                        break;
                    }
                    if (prodKPI.type == 'Growth Additional Incentive' && (!(prodKPI.prevMonth && prodKPI.prevYear))) {
                        this.toast('Required fields are missing. Please complete Month and Year fields and try again.', 'error');
                        isValid = false;
                        break;
                    }
                    for (let k = 0; k < prodKPI.incentiveSlabs.length; k++) {
                        let slab = prodKPI.incentiveSlabs[k];
                        if (slab.isSingle) {
                            if (!(slab.rangeStart && slab.rangeStartPercent && (parseFloat(slab.incentiveValue) >= 0 || parseFloat(slab.incentiveValue) < Number.MAX_SAFE_INTEGER))) {
                                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                isValid = false;
                                break;
                            } if (slab.isGrowthIncentive) {
                                if (!(slab.growthRange && slab.growthPercent)) {
                                    this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                    isValid = false;
                                    break;
                                }
                            }
                        }
                        else if (slab.isStartEnd) {
                            if (!(slab.rangeStart && slab.rangeStartPercent && slab.rangeEnd && slab.rangeEndPercent && (parseFloat(slab.incentiveValue) >= 0 || parseFloat(slab.incentiveValue) < Number.MAX_SAFE_INTEGER))) {
                                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                isValid = false;
                                break;
                            }
                            if (slab.isGrowthIncentive) {
                                if (!(slab.growthRange && slab.growthPercent)) {
                                    this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                    isValid = false;
                                    break;
                                }
                            }
                        }
                    }

                } else if (!prodKPI.isSlab) {
                    if (prodKPI.incentiveRange == null || prodKPI.incentiveRange == undefined) {
                        this.toast('Please Add Slabs or Range', 'error');
                        isValid = false;
                        break;
                    }
                    else if (prodKPI.incentiveRange && prodKPI.incentiveRange.isSingle) {
                        if (!(prodKPI.incentiveRange.singleRange && prodKPI.incentiveRange.singlePercent && prodKPI.incentiveRange.incentiveAmount)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                        }
                        if (prodKPI.showTHIncentive) {
                            for (let l = 0; l < prodKPI.additionalTHIncentive.length; l++) {
                                let machine = prodKPI.additionalTHIncentive[l];
                                if (!(machine.target && machine.volume && machine.amount)) {
                                    this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                    isValid = false;
                                }
                            }
                        }
                    } else if (prodKPI.incentiveRange && prodKPI.incentiveRange.isStart) {
                        if (!(prodKPI.incentiveRange.startRange && prodKPI.incentiveRange.startPercent && prodKPI.incentiveRange.endRange && prodKPI.incentiveRange.endPercent && prodKPI.incentiveRange.incentiveAmountStart)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                        }
                    }
                }

            }
        }
        if (isValid) {
            this.slabs = [];
            for (let i = 0; i < this.selectedKPITarget.length; i++) {
                if (this.selectedKPITarget[i].callComponent) {
                    if (this.selectedKPITarget[i]?.incentiveSlabs?.length > 0) {
                        for (let j = 0; j < this.selectedKPITarget[i].incentiveSlabs.length; j++) {
                            let slab = {};
                            let temp = this.selectedKPITarget[i].incentiveSlabs[j];
                            slab = { id: temp.id, startCondition: temp.rangeStart, minValue: temp.rangeStartPercent, endCondition: temp.rangeEnd, maxValue: temp.rangeEndPercent };
                            this.slabs.push(slab);
                        }
                        this.validateSlabs();
                    }
                    else {
                        if (this.selectedKPITarget[i].incentiveRange.isStart) {
                            this.validateRange(this.selectedKPITarget[i].incentiveRange);
                        } else {
                            this.errorMessage = '';
                            this.successMessage = 'Scenario validation completed successfully. No overlaps detected between the conditions in the Scenario.';
                        }
                    }
                    break;
                }
            }

            if (this.errorMessage) {
                this.toast(this.errorMessage, 'error');
                isValid = false;
            } else {

            }
        }
        return isValid;
    }

    validateRange(range) {
        let valid = parseFloat(range.endPercent) > parseFloat(range.startPercent);
        if (!valid) {
            this.errorMessage = `Error!!! End range must be greater than Start Range.`;
            this.toast(this.errorMessage, 'error');
            this.successMessage = '';
        } else {
            this.errorMessage = '';
            this.successMessage = 'Scenario validation completed successfully. No overlaps detected between the conditions in the Scenario.';
        }
    }

    validateSlabs() {
        let endValid = this.validateEndRange();
        if (endValid) {
            this.errorMessage = endValid;
        } else {
            this.errorMessage = '';
            this.successMessage = '';
            const ranges = this.slabs.map(slab => {
                let start = slab.minValue;
                let end = slab.maxValue !== undefined ? slab.maxValue : Number.MAX_SAFE_INTEGER;

                if (slab.startCondition === '>') {
                    start = parseFloat(slab.minValue) + 0.01;
                    end = Number.MAX_SAFE_INTEGER;
                } else if (slab.startCondition === '>=') {
                    start = parseFloat(slab.minValue);
                    end = Number.MAX_SAFE_INTEGER;
                } else if (slab.startCondition === '<') {
                    start = Number.MIN_SAFE_INTEGER;
                    end = parseFloat(slab.minValue) - 0.01;
                } else if (slab.startCondition === '<=') {
                    start = Number.MIN_SAFE_INTEGER;
                    end = parseFloat(slab.minValue);
                } else if (slab.startCondition === '==') {
                    start = parseFloat(slab.minValue);
                    end = parseFloat(slab.minValue);
                }

                if (slab.endCondition === '<') {
                    end = parseFloat(slab.maxValue) - 0.01;
                } else if (slab.endCondition === '<=') {
                    end = parseFloat(slab.maxValue);
                }

                return { start, end, id: slab.id };
            });

            for (let i = 0; i < ranges.length; i++) {
                for (let j = i + 1; j < ranges.length; j++) {
                    if (this.rangesOverlap(ranges[i], ranges[j])) {
                        this.errorMessage = `Error: Overlap detected between Scenario ${ranges[i].id} and Scenario ${ranges[j].id} conditions. Please review the errors and try saving again.`;
                        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
                            let showError = this.template.querySelector('c-d-i-product-formula-edit-page').slabValidation(ranges[i].id, ranges[j].id);
                            console.log(showError);
                        }
                        return;
                    }
                }
            }
            this.successMessage = 'Scenario validation completed successfully. No overlaps detected between the conditions in the scenarios.';
        }
    }

    rangesOverlap(range1, range2) {
        return range1.start <= range2.end && range1.end >= range2.start;
    }

    validateEndRange() {
        let status = '';
        for (let i = 0; i < this.slabs.length; i++) {
            let slab = this.slabs[i];
            if (slab.hasOwnProperty('minValue') && slab.hasOwnProperty('maxValue') && slab.minValue !== '' && slab.maxValue !== '') {
                if (parseFloat(slab.minValue) >= parseFloat(slab.maxValue)) {
                    status = `Error in Scenario ${slab.id}!!! End range must be greater than Start Range. Start (${slab.minValue}%) & End (${slab.maxValue}%)`;
                    break;
                }
                else {
                    status = '';
                }
            }
        }
        return status;
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    handleIncentiveCancel() {
        this.getKPITargetAndPayoutInfo();
        this.showFooter = false;
        this.disableParentAdditional('cancel');
        this.disbaleNavigate = "slds-size_2-of-12 slds-p-bottom_small";
    }

    showUnsavedWarningCloseModal() {
        this.showUnsavedWarning = false;
    }

    showDeleteWarningCloseModal() {
        this.showDeleteWarning = false;
    }

    disableParentAdditional(isAddInc) {
        let disableSelection = this.showFooter == true ? true : false;
        const disable = new CustomEvent('disableparentadditional', {
            detail: isAddInc
        });
        this.dispatchEvent(disable);
    }

    @api showModalRemoveTab(productName) {
        this.isProductName = productName;
        deleteAdditionalRecords({ month: this.month, year: this.year, product: this.isProductName, isDelete: false })
            .then(res => {
                if (res?.listOfKpi.length > 0 || res?.listOfMulti.length > 0 || res?.listOfSlab.length > 0) {
                    this.showDeleteWarning = true;
                    return;
                }
                if (!this.showDeleteWarning) {
                    const removeTab = new CustomEvent('tabremove', {
                        detail: productName
                    });
                    this.dispatchEvent(removeTab);
                }
            }).catch(err => {
                console.log('Error == ', err);
            })
    }

    handleDelete() {
        var ids = this.productKPITargetsInfo[this.isProductName];
        for (let i = 0; i < ids?.length; i++) {
            if (ids[i].recordId) {
                if (ids[i].type == 'Additional Incentive Target') {
                    this.deletedIds.kpiTarget.push(ids[i].recordId);
                    for (let j = 0; j < ids[i].incentiveSlabs?.length; j++) {
                        if (ids[i].incentiveSlabs[j]?.slabId) {
                            this.deletedIds.slabId.push(ids[i].incentiveSlabs[j].slabId);
                        }
                    }
                }
                if (ids[i].type == 'Growth Additional Incentive') {
                    this.deletedIds.growthTarget.push(ids[i].recordId);
                    for (let j = 0; j < ids[i].incentiveSlabs?.length; j++) {
                        if (ids[i].incentiveSlabs[j]?.slabId) {
                            this.deletedIds.growSlab.push(ids[i].incentiveSlabs[j].slabId);
                        }
                    }
                }
            }
        }
        if (this.deletedIds) {
            let chunkedList = [];
            for (const key in this.deletedIds) {
                chunkedList = [...chunkedList, ...this.chunkArray(this.deletedIds[key], 100)];
            }
            if (chunkedList?.length > 0) {
                deleteRecordInDatabase({ deleteIds: chunkedList })
                    .then(res => {
                        this.showDeleteWarning = false;
                        this.multiDeleteKPI();
                        this.toast('The record is deleted successfully!', 'success');
                        this.getKPITargetAndPayoutInfo();
                        this.deletedIds = { kpiTarget: [], slabId: [], growthTarget: [], growSlab: [] };
                    }).catch(err => {
                        console.log('Error == ', err);
                        this.showDeleteWarning = false;
                    })
            } else {
                this.multiDeleteKPI();
            }
        }
    }

    multiDeleteKPI() {
        deleteAdditionalRecords({ month: this.month, year: this.year, product: this.isProductName, isDelete: true })
            .then(res => {
                this.showDeleteWarning = false;
                const removeTab = new CustomEvent('tabremove', {
                    detail: this.isProductName
                });
                this.dispatchEvent(removeTab);
                this.toast('The record is deleted successfully!', 'success');
                this.getKPITargetAndPayoutInfo();
            }).catch(err => {
                console.log('Error == ', err);
            })
    }

    handleModalCancel() {
        this.showDeleteWarning = false;
    }

    handleKpiOptionsToDelete(event) {
        this.showDeleteKpiTarget = true;
        this.selectedKpiToDelete = event.target.dataset.kpi;
        this.selectedIndexToDelete = event.target.dataset.prodindex;
        this.kpiLabel = event.target.dataset.kpi;
    }

    handlekpiCancel() {
        this.showDeleteKpiTarget = false;
    }

    showDeletekpiCloseModal() {
        this.showDeleteKpiTarget = false;
    }

    handlekpiDelete() {
        let index = this.selectedIndexToDelete;
        this.selectedKPITarget[index].showContainer = false;
        let selectedKpi = this.selectedKpiToDelete;
        let valueDel;
        let toShoww;
        for (let i = 0; i < this.kpiMenuItemOptionsToShow.length; i++) {
            if (this.kpiMenuItemOptionsToShow[i].value == selectedKpi) {
                valueDel = this.kpiMenuItemOptionsToShow[i].value;
                this.kpiMenuItemOptionsToShow[i].toShow = true;
                toShoww = this.kpiMenuItemOptionsToShow[i].toShow == true ? false : true;
                if (this.selectedKPITarget[index].recordId) {
                    this.deletedIds.kpiTarget.push(this.selectedKPITarget[index].recordId);
                    for (let j = 0; j < this.selectedKPITarget[index].incentiveSlabs?.length; j++) {
                        if (this.selectedKPITarget[index].incentiveSlabs[j]?.slabId) {
                            this.deletedIds.slabId.push(this.selectedKPITarget[index].incentiveSlabs[j].slabId);
                        }
                    }
                }
                break;
            }
        }
        this.deleteKPITarget();
        this.showDeleteKpiTarget = false;
    }

    deleteKPITarget() {
        if (this.deletedIds) {
            let chunkedList = [];
            for (const key in this.deletedIds) {
                chunkedList = [...chunkedList, ...this.chunkArray(this.deletedIds[key], 100)];
            }
            if (chunkedList?.length > 0) {
                deleteRecordInDatabase({ deleteIds: chunkedList }).then(result => {
                    this.getKPITargetAndPayoutInfo();
                    this.deletedIds = { kpiTarget: [], slabId: [] };
                }).catch(error => { })
            }
        }
        this.handleAddNewKpiCard();
    }

    chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr?.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }

    showSalesModal(event) {
        this.showSalesmanIncentive = true;
        this.salesPersonIncentive = [];
        var index = event.target.dataset.prodindex;
        this.saleInd = index;
        if (this.selectedKPITarget[index].salesPersonIncentive?.length > 0) {
            this.salesPersonIncentive = this.selectedKPITarget[index].salesPersonIncentive;
        } else {
            let kpiTarget = {};
            kpiTarget.hasSlabs = false;
            kpiTarget.type = this.typeName;
            kpiTarget.incentiveSlabs = [];
            kpiTarget.isSlab = true;
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = true;
            this.salesPersonIncentive.push(kpiTarget);
            this.selectedKPITarget[index].salesPersonIncentive = this.salesPersonIncentive;
        }
    }

    showSalesCloseModal() {
        this.handleAddNewKpiCard();
        this.showSalesmanIncentive = false;
    }

    handlesalesIncentive(event) {
        this.selectedKPITarget[this.saleInd].salesPersonIncentive[0].incentiveSlabs = event.detail;
    }

    handleSalesSave() {
        this.showSalesmanIncentive = false;
    }

    handleSlabInfo(event) {
        this.slabIds.push(event.detail.id);
        if (this.slabIds?.length > 0) {
            let chunkedList = this.chunkArray(this.slabIds, 100);
            deleteRecordInDatabase({ deleteIds: chunkedList })
                .then(res => {
                    this.slabIds = [];
                }).catch(err => { })
            for (let i = 0; i < this.productTargetAndPayout.length; i++) {
                if (this.productTargetAndPayout[i].productKPI.kpiId == event.detail.kpiId) {
                    for (let j = 0; j < this.productTargetAndPayout[i].slabInfo.length; j++) {
                        if (this.productTargetAndPayout[i].slabInfo[j].slabId == event.detail.id) {
                            this.productTargetAndPayout[i].slabInfo.splice(j, 1);
                        }
                    }
                }
            }
        }
    }
}