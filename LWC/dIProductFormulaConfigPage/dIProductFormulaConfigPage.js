import getProductsAndKPI from '@salesforce/apex/JCBDealerIncentiveController.getProductsAndKPI';
import clearSingleField from '@salesforce/apex/dIFormulaController.clearSingleField';
import deleteRecordInDatabase from '@salesforce/apex/dIFormulaController.deleteRecordInDatabase';
import getClonePicklistValues from '@salesforce/apex/dIFormulaController.getClonePicklistValues';
import getKPITargetAndPayoutInfo from '@salesforce/apex/dIFormulaController.getKPITargetAndPayoutInfo';
import getPicklistValues from '@salesforce/apex/dIFormulaController.getPicklistValues';
import getProductTargets from '@salesforce/apex/dIFormulaController.getProductTargets';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import saveProductKPIAndTarget from '@salesforce/apex/dIFormulaController.saveProductKPIAndTarget';
import deleteDealerIncRecords from '@salesforce/apex/JCBDealerIncentiveController.deleteDealerIncRecords';
import imageZip from '@salesforce/resourceUrl/images';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, api, track, wire } from 'lwc';
export default class DIProductFormulaConfigPage extends LightningElement {

    @api year;
    @api month;
    @api prodAndSubCategory;
    @api productName;
    @api selectedKPITarget = [];
    @api showSalesmanIncentive = false;
    @api saleInd;
    @track savedIcon = imageZip + '/Images/zone_fill.png';
    @track unSavedIcon = imageZip + '/Images/zone_empty.png';
    @track isProductKpi = true;
    @track productFormula = true;
    @track isShowIncentive;
    @track recordsToSave = [];
    @track prodValue = '10';
    @track isRange = false;
    @track listOfVolumeSlabs = [];
    @track listOfSingle;
    @track listOfStartEnd;
    @track productList = [];
    @track marketingRange = 'greater than or equal to';
    @track indentingRange;
    @track indentingRange1;
    @track coveragingRange;
    @track marketingValue;
    @track indentingValue;
    @track indentingValue1;
    @track indentValue;
    @track valueCoverage;
    @track valueDemo;
    @track isEdited = false;
    @track viewFieldNames = [];
    @track myList = [];
    @track schemeTarget = {};
    @track isLoading = false;
    @track showTarget = false;
    @track innerTextStyle = '';
    @track prodAndSchemes;
    @track marketCoverage = false;
    @track showIndentTarget = false;
    @track isChecked;
    @track disableIncentive = false;
    @track sizeDifferent;
    @track isSetting = false;
    @track picklistValues = [];
    @track productKpiTarget = [];
    @track productKpiPayout = [];
    @track recordId;
    @track subCategory4WD = {};
    @track productKPISlabs = {};
    @track payoutByProduct = [];
    @track payoutModel = [];
    @track showFooter = false;
    @track payoutScheme = [];
    @track productKPITargetsInfo = {};
    @track productKPIPayoutsInfo = {};
    @track selectedKPIPayout = [];
    @track isStockEdit = true;
    @track showStockPolicy = true;
    @track productTargets = [];
    @track stockValue = 0;
    @track isEditingStock = false;
    @track kpiEdit = false;
    @track stockcondition = {};
    @track stock = {};
    @track productTargetId;
    @track showNewKpi;
    @track kpiMenuItemOptionsToShow = [];
    @track totalKpiMenuItemOptions = {};
    @track showKpiDelete;
    @track selectedKpiToDelete;
    @track selectedIndexToDelete;
    @track allKPIs = {};
    @track kpiToBack;
    @track zoneModalDisable = true;
    @track kpiLabel;
    @track clonePicklistValue;
    @track singleValue;
    @track singleRange;
    @track valueIncentive;
    @track singleDisable = false;
    @track singleCheckbox;
    @track marketpenetrationTarget;
    @track indentTarget;
    @track coverageTarget;
    @track singleRangeVolume;
    @track startRangeVolume;
    @track subList = [];
    @track iconIndex;
    @track selectedKpiTargetTemp;
    @track isEditedAll = false;
    @track slabs = [];
    @track errorMessage = '';
    @track successMessage = '';
    @track recordId;
    @track regionList = [];
    @track regionInputs = [];
    @track showContent = false;
    @track selectedValue;
    @track showKPITarget = true;
    @track showSlabs = false;
    @track sendData;
    @track showUnsavedWarning = false;
    @track indexVal;
    @track isShowSales = true;
    @track isShowIcon = true;
    @track isShowKpiIcon = true;
    @track linkDisable = "ablelink";
    @track isIncentiveName;
    @track endRangeOptions = [
        { label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Not Equal to', value: '!=' },
        { label: 'Equal to', value: '==' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' },
    ];
    objectApiName = 'DealerTarget__c';
    fieldName = 'Zone__c ';
    incentiveCheck = '';
    parentIndex;
    childIndex;
    productKpi = {};
    editStockPolicy = true;
    get incentiveOptions() {
        return [
            { label: 'Percentage', value: 'Percent' },
            { label: 'Amount', value: 'Amt' },
        ];
    }

    @wire(getPicklistValues) RegionPicklist({ error, data }) {
        if (data) {
            this.regionList = data;
        } else if (error) {

        }
    }
    @wire(getClonePicklistValues) wiredGetClonePicklistValues({ error, data }) {
        if (data) {
            this.clonePicklistValue = data;
        } else if (error) {
            this.error = error;
        }
    }

    connectedCallback() {
        this.subCategory = this.prodAndSubCategory[this.productName].subCategoryList;
        this.getProductsKPI();
        this.getProductTargets();
    }

    getProductTargets() {
        this.productTargets = [];
        getProductTargets({ month: this.month, year: this.year })
            .then(result => {
                this.productTargets = result;
                this.setStockPolicy();
                this.showStockPolicy = true;
            })
            .catch(error => {

            });
    }

    getKpiWithOption() {
        for (const key in this.prodAndSchemes) {
            let storeKpi = this.prodAndSchemes[key];
            this.totalKpiMenuItemOptions[key] = [];
            for (let i = 0; i < storeKpi?.length; i++) {
                if (storeKpi[i].KPI__r.KPI_Visiblity__c.includes('KPI Target')) {
                    if (storeKpi[i].KPI__r.Name == 'Volume') {
                        this.totalKpiMenuItemOptions[key].push({ label: storeKpi[i].KPI__r.Name + ' Incentive', value: storeKpi[i].KPI__r.Name, name: storeKpi[i].Product_Category__r.Name, toShow: false });
                    } else {
                        this.totalKpiMenuItemOptions[key].push({ label: storeKpi[i].KPI__r.Name, value: storeKpi[i].KPI__r.Name, name: storeKpi[i].Product_Category__r.Name, toShow: false });
                    }
                }
            }
        }
    }
    getAddKPIOptions() {
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
        for (let i = 0; i < this.selectedKPITarget?.length; i++) {
            let kpiName = this.selectedKPITarget[i].incentiveName.replace(/ Incentive$/, '');
            let containerStat = this.selectedKPITarget[i].showContainer == true ? false : true;
            let cardStat = this.selectedKPITarget[i].showContainer;
            for (let j = 0; j < this.kpiMenuItemOptionsToShow?.length; j++) {
                if (this.kpiMenuItemOptionsToShow[j].value == kpiName) {
                    this.kpiMenuItemOptionsToShow[j].toShow = containerStat;
                }
            }
        }
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
        for (let m = 0; m < this.kpiMenuItemOptionsToShow?.length; m++) {
            if (this.kpiMenuItemOptionsToShow[m].toShow == true) {
                this.showNewKpi = true;
                break;
            } else {
                this.showNewKpi = false;
            }
        }
        for (let j = 0; j < this.selectedKPITarget?.length; j++) {
            let kpiName = this.selectedKPITarget[j].incentiveName;
            let cardStat = this.selectedKPITarget[j].showContainer;
            for (let k = 0; k < this.payoutByProduct?.length; k++) {
                if (this.payoutByProduct[k].key != 'Sales Person Incentive') {
                    if (this.payoutByProduct[k].key == kpiName) {
                        this.payoutByProduct[k].toShow = cardStat;
                    }
                } else {
                    this.payoutByProduct[k].toShow = true;
                }
                if (this.payoutByProduct[k].key.includes('Demo')) {
                    this.payoutByProduct[k].toShow = true;
                }
            }
        }
    }

    getKPIPayouts() {
        for (let i = 0; i < this.selectedKPITarget?.length; i++) {
            let kpiName = this.selectedKPITarget[i].incentiveName;
            let cardStat = this.selectedKPITarget[i].showContainer;
            this.selectedKPITarget[i].isShowIndustry = this.productName == 'EXC' && this.selectedKPITarget[i].productKPI.kpiName == 'Market Coverage' ? true : false;
            for (let kpi of this.selectedKPIPayout) {
                for (let j = 0; j < kpi.kpiPayouts?.length; j++) {
                    let name = kpi.kpiPayouts[j].kpiName;
                    if (name != 'Sales Person Incentive') {
                        if (name == kpiName) {
                            kpi.kpiPayouts[j].toShow = cardStat;
                        }
                    } else {
                        kpi.kpiPayouts[j].toShow = true;
                    }
                    if (name.includes('Demo')) {
                        kpi.kpiPayouts[j].toShow = true;
                    }
                }
            }
        }
    }


    handleKpiMenuItemoptions(event) {
        this.isShowIcon = false;
        this.showFooter = true;
        this.isShowSales = false;
        this.disableParent();
        let selectedKpi = event.detail.value;
        let kpiName;
        let cardStat;
        for (let i = 0; i < this.selectedKPITarget?.length; i++) {
            if (this.selectedKPITarget[i].productKPI.kpiName == selectedKpi) {
                this.selectedKPITarget[i].showContainer = true;
                this.selectedKPITarget[i].callComponent = true;
                this.selectedKPITarget[i].isShowIndustry = false;
                this.showNewKpi = false;
                this.showStockPolicy = false;
                kpiName = this.selectedKPITarget[i].productKPI.kpiName;
                cardStat = this.selectedKPITarget[i].showContainer;
            } else {
                this.selectedKPITarget[i].showContainer = false;
            }
        }
        for (let i = 0; i < this.payoutByProduct?.length; i++) {
            let payoutName = this.payoutByProduct[i].key.replace(/ Incentive$/, '');
            if (payoutName == selectedKpi) {
                this.payoutByProduct[i].toShow = cardStat;
                break;
            }
        }
        if (this.selectedKPIPayout?.length > 0) {
            for (let kpi of this.selectedKPIPayout) {
                for (let j = 0; j < kpi.kpiPayouts?.length; j++) {
                    let name = kpi.kpiPayouts[j].kpiName.replace(/ Incentive$/, '');
                    if (name == kpiName) {
                        kpi.kpiPayouts[j].toShow = cardStat;
                        break;
                    }
                }
            }
        }
        for (let j = 0; j < this.kpiMenuItemOptionsToShow?.length; j++) {
            if (this.kpiMenuItemOptionsToShow[j].value == kpiName) {
                this.kpiMenuItemOptionsToShow[j].toShow = false;
                break;
            }
        }
    }

    handleKpiOptionsToDelete(event) {
        this.showKpiDelete = true;
        this.selectedKpiToDelete = event.target.dataset.kpi;
        this.selectedIndexToDelete = event.target.dataset.index;
        this.kpiLabel = event.target.dataset.kpiName;
    }

    chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr?.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }

    handleDelete() {
        let selectedKpi = this.selectedKpiToDelete;
        let index = this.selectedIndexToDelete;
        let contStat;
        let contStat1;
        for (let i = 0; i < this.selectedKPITarget?.length; i++) {
            if (this.selectedKPITarget[i].productKPI.kpiName == selectedKpi) {
                this.selectedKPITarget[i].showContainer = false;
                contStat = this.selectedKPITarget[i].showContainer;
                contStat1 = this.selectedKPITarget[i].showContainer == false ? true : false;
                if (this.selectedKPITarget[i].recordId) {
                    this.deletedIds.kpiTarget.push(this.selectedKPITarget[i].recordId);
                }
                break;
            }
        }
        for (let i = 0; i < this.payoutByProduct?.length; i++) {
            let payoutName = this.payoutByProduct[i].key.replace(/ Incentive$/, '');
            if (payoutName == selectedKpi) {
                this.payoutByProduct[i].toShow = contStat;
                this.payoutByProduct[i].isChecked = payoutName == '4WD' ? true : false;
                break;
            }
        }
        for (let kpi of this.selectedKPIPayout) {
            for (let j = 0; j < kpi.kpiPayouts?.length; j++) {
                let name = kpi.kpiPayouts[j].kpiName.replace(/ Incentive$/, '');
                if (name == selectedKpi) {
                    kpi.kpiPayouts[j].toShow = contStat;
                    kpi.kpiPayouts[j].variesByRegion = name == '4WD' ? true : false;
                    if (kpi.kpiPayouts[j].payoutId) {
                        this.deletedIds.kpiPayout.push(kpi.kpiPayouts[j].payoutId);
                        for (let i = 0; i < kpi.kpiPayouts[j].regionPayout?.length; i++) {
                            this.deletedIds.regionPayout.push(kpi.kpiPayouts[j].regionPayout[i].regPayoutId);
                        }
                    }
                    break;
                }
            }
        }
        let chunkedList = [];
        for (const key in this.deletedIds) {
            chunkedList = [...chunkedList, ...this.chunkArray(this.deletedIds[key], 100)];
        }
        deleteRecordInDatabase({ deleteIds: chunkedList }).then(result => {
            this.getKPITargetAndPayoutInfo(this.month, this.year, false);
            this.deletedIds = { kpiTarget: [], kpiPayout: [], slabId: [], regionPayout: [] };
        }).catch(error => {
            console.log('error', error);
        })
        for (let m = 0; m < this.kpiMenuItemOptionsToShow?.length; m++) {
            if (this.kpiMenuItemOptionsToShow[m].value == selectedKpi) {
                this.kpiMenuItemOptionsToShow[m].toShow = contStat1;
                break;
            }
        }
        for (let k = 0; k < this.kpiMenuItemOptionsToShow?.length; k++) {
            if (this.kpiMenuItemOptionsToShow[k].toShow == true) {
                this.showNewKpi = true;
                break;
            } else {
                this.showNewKpi = false;
            }
        }
        this.showKpiDelete = false;
    }

    handleCancel() {
        this.showKpiDelete = false;
    }

    handleCloseIcon() {
        this.showKpiDelete = false;
    }

    handleVariesByRegion(event) {
        let checkbox = event.target;
        let kpi = event.target.dataset.key;
        let name = event.target.dataset.name;
        for (let i = 0; i < this.payoutByProduct?.length; i++) {
            if (this.payoutByProduct[i].key == kpi) {
                if (name == 'zonewise') {
                    this.payoutByProduct[i].isChecked = checkbox.checked;
                } else if (name == 'variesBy4WD') {
                    this.payoutByProduct[i].variesBy4WD = checkbox.checked;
                }
                if (this.payoutByProduct[i].isChecked && this.payoutByProduct[i].variesBy4WD) {
                    this.payoutByProduct[i].bothChecked = true;
                } else {
                    this.payoutByProduct[i].bothChecked = false;
                }
                break;
            }
        }
        for (let key of this.selectedKPIPayout) {
            for (let j = 0; j < key.kpiPayouts?.length; j++) {
                let kpiName = key.kpiPayouts[j].kpiName;
                if (kpiName == kpi) {
                    if (name == 'zonewise') {
                        key.kpiPayouts[j].variesByRegion = checkbox.checked;
                    } else if (name == 'variesBy4WD') {
                        key.kpiPayouts[j].variesBy4WD = checkbox.checked;
                    }
                    key.kpiPayouts[j] = this.handleCheckboxes(key.kpiPayouts[j]);
                    break;
                }
            }
        }
    }

    handleCheckboxes(subPayouts) {
        if (subPayouts.variesBy4WD && subPayouts.variesByRegion) {
            subPayouts.bothChecked = true;
            subPayouts.bothUnchecked = false;
        } else if (subPayouts.variesBy4WD || subPayouts.variesByRegion) {
            subPayouts.bothChecked = false;
            subPayouts.bothUnchecked = false;
        } else {
            subPayouts.bothChecked = false;
            subPayouts.bothUnchecked = true;
        }
        return subPayouts;
    }

    getProductsKPI() {
        getProductsAndKPI({})
            .then(result => {
                this.prodAndSchemes = result;
                this.getPayoutSchemesbyProduct();
                this.getKPITargetAndPayoutInfo(this.month, this.year, false);
            })
            .catch(error => {

            })
    }

    productKPITargetsTemp;
    productKPIPayoutsTemp;
    @track clonePreview = false;
    @api getKPITargetAndPayoutInfo(month, year, clone) {
        this.clonePreview = clone;
        if (clone) {
            this.productKPITargetsTemp = this.productKPITargetsInfo;
            this.productKPIPayoutsTemp = this.productKPIPayoutsInfo;
        }
        let type = ['KPI Target'];
        getKPITargetAndPayoutInfo({ month: month, year: year, type: type }).then(res => {
            this.productTargetAndPayout = [];
            this.productKPITargetsInfo = {};
            this.productKPIPayoutsInfo = {};
            this.selectedKPITarget = [];
            this.selectedKPIPayout = [];
            this.showFooter = clone;
            if (!clone) {
                this.disableParent();
            }
            this.productTargetAndPayout = res;
            if (this.productTargetAndPayout?.length > 0) {
                this.getKpiWithOption();
                this.getPayoutSchemesbyProduct();
                this.setKPIAndPayoutInfo();
                if (clone) {
                    this.setKPIAndPayoutRecordId();
                }
            } else {
                this.getKpiWithOption();
                this.getInitialData();
                this.getProductKpiPayout();
            }
            this.setStockPolicy();
        }).catch(error => {
            console.error('error ----  ', error);
        });
    }

    deletedIds = { kpiTarget: [], kpiPayout: [], slabId: [], regionPayout: [] };
    setKPIAndPayoutRecordId() {
        try {
            for (const key in this.productKPITargetsInfo) {
                for (let i = 0; i < this.productKPITargetsInfo[key]?.length; i++) {
                    let temp = this.productKPITargetsInfo[key][i];
                    temp.recordId = null;
                    temp.month = this.month;
                    temp.year = this.year;

                    for (let j = 0; j < temp.incentiveSlabs?.length; j++) {
                        temp.incentiveSlabs[j].slabId = null;
                    }
                    this.productKPITargetsInfo[key][i] = temp;
                }
            }
            for (const key in this.productKPIPayoutsInfo) {
                for (let i = 0; i < this.productKPIPayoutsInfo[key]?.length; i++) {
                    let payoutRecord = this.productKPIPayoutsInfo[key][i];
                    for (let i = 0; i < payoutRecord.kpiPayouts?.length; i++) {
                        payoutRecord.kpiPayouts[i].payoutId = null;
                        payoutRecord.kpiPayouts[i].kpiTargetId = null;
                    }
                    this.productKPIPayoutsInfo[key][i] = payoutRecord;
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    setKPIAndPayoutInfo() {
        try {
            for (const key in this.prodAndSchemes) {
                let scheme = this.prodAndSchemes[key];
                let record = this.productTargetAndPayout.find(prod => prod.productKPI.productName == key);
                if (record) {
                    this.productKPITargetsInfo[key] = [];
                    this.productKPIPayoutsInfo[key] = [];
                    let salesIncentive = this.productTargetAndPayout.find((sale) => sale.productKPI.productName == key && sale.salesPersonTarget != null);
                    for (let i = 0; i < scheme?.length; i++) {
                        if (scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target') || scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout')) {
                            let productTarget = this.productTargetAndPayout.find((prod) => prod.productKPI.productKPIId == scheme[i].Id);
                            if (productTarget) {
                                let kpiTarget = {};
                                kpiTarget.recordId = productTarget.recordId;
                                kpiTarget.productName = productTarget.productKPI.productName;
                                kpiTarget.productId = productTarget.productKPI.productId;
                                if (productTarget.productKPI.kpiName == 'Volume') {
                                    kpiTarget.kpiTargetName = productTarget.productKPI.kpiName + ' Incentive';
                                    kpiTarget.incentiveName = productTarget.productKPI.kpiName + ' Incentive';
                                } else {
                                    kpiTarget.kpiTargetName = productTarget.productKPI.kpiName + ' Target';
                                    kpiTarget.incentiveName = productTarget.productKPI.kpiName + ' Incentive';
                                }
                                kpiTarget.kpiId = productTarget.productKPI.kpiId;
                                kpiTarget.productKPIId = productTarget.productKPI.productKPIId;
                                kpiTarget.productKPI = productTarget.productKPI;
                                kpiTarget.hasSlabs = productTarget.hasSlabs;
                                kpiTarget.month = productTarget.month;
                                kpiTarget.year = productTarget.year;
                                kpiTarget.type = productTarget.type;
                                this.isShowSales = true;
                                kpiTarget.isShowIndustry = productTarget.productKPI.productName == 'EXC' && productTarget.productKPI.kpiName == 'Market Coverage' ? true : false;
                                kpiTarget.indChecked = productTarget.isIndustryIncentive;
                                kpiTarget.indusConfigure = productTarget.isIndustryIncentive ? true : false;
                                kpiTarget.salesPersonTarget = productTarget.salesPersonTarget;
                                kpiTarget.checked = productTarget.isSalesmanIncentive;
                                if (productTarget.salesPersonTarget == null || productTarget.salesPersonTarget == undefined) {
                                    kpiTarget.salesConfigure = false;
                                    kpiTarget.disableOthers = salesIncentive ? true : false;
                                } else {
                                    kpiTarget.salesConfigure = true;
                                    kpiTarget.disableOthers = false;
                                }

                                kpiTarget.slabInfo = productTarget.slabInfo;
                                kpiTarget.incentiveSlabs = [];
                                kpiTarget.firstTwoSlabs = [];
                                kpiTarget.remainingSlabs = [];
                                kpiTarget.displayShowMore = false;
                                kpiTarget.showContainer = true;
                                kpiTarget.callComponent = false;
                                kpiTarget.isSlab = productTarget.hasSlabs;
                                kpiTarget.isRange = productTarget.target != null;
                                kpiTarget.isSlabNotEmpty = true; //To check slab empty or not to prevent volume incentive empty white background
                                kpiTarget.productPayouts = productTarget.productPayouts;
                                kpiTarget.tempRange = {};
                                kpiTarget.tempSlabs = [];
                                kpiTarget.showKPI = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                                kpiTarget.showPayout = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout');
                                let slabAscending = productTarget.slabInfo?.length > 0 ? productTarget.slabInfo.filter(element => element.slabType != 'Salesperson Incentive' && element.slabType != 'Total Volume Industry Incentive') : [];
                                let slabInfo = this.sortSlabs(slabAscending);
                                if (slabInfo?.length > 0) {
                                    for (let k = 0; k < slabInfo?.length; k++) {
                                        var slab = {};
                                        slab.id = k + 1;
                                        slab.slabId = slabInfo[k].slabId;
                                        if (slabInfo[k].slabRange.includes('to')) {
                                            slab.isSingle = false;
                                            slab.isStartEnd = true;
                                            let ranges = slabInfo[k].slabRange.split(' ');
                                            slab.rangeStart = ranges[0];
                                            slab.rangeStartPercent = ranges[1];
                                            slab.rangeEnd = ranges[3];
                                            slab.rangeEndPercent = ranges[4];
                                            slab.rangeSlab = slab.rangeStart + slab.rangeStartPercent + '% to ' + slab.rangeEnd + slab.rangeEndPercent + '%';
                                        } else {
                                            slab.className = 'slds-size_1-of-5';
                                            slab.rangeSlab = slabInfo[k].slabRange + '%';
                                            slab.isSingle = true;
                                            slab.isStartEnd = false;
                                            let ranges = slabInfo[k].slabRange.split(' ');
                                            slab.rangeStart = ranges[0];
                                            slab.rangeStartPercent = ranges[1];
                                        }
                                        if (slabInfo[k].payoutMode == 'Amt') {
                                            slab.incentive = 'Incentive Amount';
                                            slab.incentiveSymbol = '₹';
                                            slab.incentiveValue = slabInfo[k].amount;
                                            slab.incentiveRadio = slabInfo[k].payoutMode;
                                            slab.incentiveKpiValue = '₹' + slabInfo[k].amount;
                                        } else if (slabInfo[k].payoutMode == 'Percent') {
                                            slab.incentive = 'Incentive Percentage';
                                            slab.incentiveSymbol = '%';
                                            slab.incentiveValue = slabInfo[k].payoutPercentage;
                                            slab.incentiveRadio = slabInfo[k].payoutMode;
                                            if (slab.incentiveValue != 'Pro-rata-basis') {
                                                slab.incentiveKpiValue = slabInfo[k].payoutPercentage + '%';
                                            } else {
                                                slab.incentiveKpiValue = slabInfo[k].payoutPercentage;
                                            }
                                        } else {
                                            slab.incentive = 'Incentive Percentage';
                                            slab.incentiveRadio = 'Percent';
                                            slab.incentiveValue = 'Pro-rata-basis';
                                            slab.proRataIncentive = true;
                                            slab.disableIncentive = true;
                                            slab.incentiveKpiValue = 'Pro-rata-basis';
                                        }
                                        kpiTarget.incentiveSlabs.push(slab);

                                        if (kpiTarget.firstTwoSlabs?.length < 2) {
                                            kpiTarget.firstTwoSlabs.push(slab);
                                        } else {
                                            kpiTarget.remainingSlabs.push(slab);
                                        }
                                        if (kpiTarget.incentiveSlabs?.length > 2) {
                                            kpiTarget.displayShowMore = true;
                                        }
                                        if (kpiTarget.incentiveSlabs?.length == 0) {
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
                                        } else {
                                            incentiveRange.isSingle = true;
                                            let ranges = productTarget.target.split(' ');
                                            incentiveRange.singleRange = ranges[0];
                                            incentiveRange.singlePercent = ranges[1];
                                            incentiveRange.targetRange = productTarget.target + '%';
                                        }
                                    }
                                    kpiTarget.incentiveRange = incentiveRange;
                                }
                                if (scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout')) {
                                    if (productTarget.productPayouts?.length > 0) {
                                        this.prodAndSubCategory[key].subCategoryList.forEach(sub => {
                                            let subPayout = productTarget.productPayouts.find(subProd => subProd.subProductId == sub.subCategoryId);
                                            let variesBYRegion = productTarget.productPayouts[0].variesByRegion;
                                            let variesBY4WD = productTarget.productPayouts[0].variesBy4WD;
                                            if (subPayout) {
                                                subPayout.productKPIId = scheme[i].Id;
                                                subPayout.kpiName = kpiTarget.incentiveName;
                                                subPayout.variesByRegion = variesBYRegion;
                                                subPayout.variesBy4WD = variesBY4WD;
                                                subPayout.isVaries4WD = productTarget.productKPI.productName == 'BHL' ? true : false;
                                                subPayout = this.handleCheckboxes(subPayout);
                                                subPayout.toShow = false;
                                                let index = this.productKPIPayoutsInfo[key].findIndex(subProd => subProd.key == subPayout.subProductName);
                                                let subKPIPayout = this.productKPIPayoutsInfo[key].find((subProd) => subProd.key == subPayout.subProductName);
                                                if (subKPIPayout) {
                                                    subKPIPayout.kpiPayouts.push(subPayout);
                                                    this.productKPIPayoutsInfo[key][index] = subKPIPayout;
                                                } else {
                                                    subKPIPayout = { kpiPayouts: [] };
                                                    subKPIPayout.key = subPayout.subProductName;
                                                    subKPIPayout.kpiPayouts.push(subPayout);
                                                    subKPIPayout.isEdited = false;
                                                    this.productKPIPayoutsInfo[key].push(subKPIPayout);
                                                }
                                            } else {
                                                subPayout = {};
                                                let index = this.productKPIPayoutsInfo[key].findIndex(subProd => subProd.key == sub.name);
                                                let subKPIPayout = this.productKPIPayoutsInfo[key].find((subProd) => subProd.key == sub.name);
                                                subPayout.productKPIId = scheme[i].Id;
                                                subPayout.kpiName = kpiTarget.incentiveName;
                                                subPayout.variesByRegion = variesBYRegion;
                                                subPayout.variesBy4WD = variesBY4WD;
                                                subPayout.isVaries4WD = productTarget.productKPI.productName == 'BHL' ? true : false;
                                                subPayout = this.handleCheckboxes(subPayout);
                                                subPayout.show4WDIcon = kpiTarget.incentiveName.includes('4WD') ? true : false;
                                                subPayout.toShow = false;
                                                subPayout.subProductId = sub.subCategoryId;
                                                subPayout.subProductName = sub.name;
                                                if (subKPIPayout) {
                                                    subKPIPayout.kpiPayouts.push(subPayout);
                                                    this.productKPIPayoutsInfo[key][index] = subKPIPayout;
                                                } else {
                                                    subKPIPayout = { kpiPayouts: [] };
                                                    subKPIPayout.key = sub.name;
                                                    subKPIPayout.kpiPayouts.push(subPayout);
                                                    subKPIPayout.isEdited = false;
                                                    this.productKPIPayoutsInfo[key].push(subKPIPayout);
                                                }
                                            }
                                        });

                                    } else {
                                        let subKPIPayout = [];
                                        for (let l = 0; l < this.prodAndSubCategory[key].subCategoryList?.length; l++) {
                                            let subCategory = this.prodAndSubCategory[key].subCategoryList[l];
                                            let subPayout = { productKPIId: scheme[i].Id, kpiName: kpiTarget.incentiveName, show4WDIcon: kpiTarget.incentiveName.includes('4WD') ? true : false, subProductName: subCategory.name, subProductId: subCategory.subCategoryId, variesByRegion: false, variesBy4WD: false, bothChecked: false, bothUnchecked: true, toShow: false, isVaries4WD: productTarget.productKPI.productName == 'BHL' ? true : false };
                                            let payoutInfo = this.productKPIPayoutsInfo[key].find(sub => sub.key == subCategory.name);
                                            let index = this.productKPIPayoutsInfo[key].findIndex(sub => sub.key == subCategory.name);
                                            if (payoutInfo && payoutInfo.kpiPayouts?.length) {
                                                payoutInfo.kpiPayouts.push(subPayout);
                                                this.productKPIPayoutsInfo[key][index] = payoutInfo;
                                            } else {
                                                payoutInfo = { key: subCategory.name, kpiPayouts: [], isEdited: false };
                                                payoutInfo.kpiPayouts.push(subPayout);
                                                this.productKPIPayoutsInfo[key].push(payoutInfo);
                                            }
                                        }
                                    }
                                }
                                this.productKPITargetsInfo[key].push(kpiTarget);
                            } else {
                                let kpiTarget = {};
                                kpiTarget.productName = scheme[i].Product_Category__r.Name;
                                kpiTarget.productId = scheme[i].Product_Category__r.Id;
                                if (scheme[i].KPI__r.Name == 'Volume') {
                                    kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Incentive';
                                    kpiTarget.incentiveName = scheme[i].KPI__r.Name + ' Incentive';
                                    kpiTarget.isSlab = true;
                                    kpiTarget.isRange = false;
                                } else {
                                    kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Target';
                                    kpiTarget.incentiveName = scheme[i].KPI__r.Name + ' Incentive';
                                    kpiTarget.isSlab = false;
                                    kpiTarget.isRange = false;
                                }
                                kpiTarget.kpiId = scheme[i].KPI__r.Id;
                                kpiTarget.productKPIId = scheme[i].Id;
                                kpiTarget.productKPI = { productKPIId: scheme[i].Id, kpiId: scheme[i].KPI__r.Id, kpiName: scheme[i].KPI__r.Name, productId: scheme[i].Product_Category__c, productName: scheme[i].Product_Category__r.Name };
                                kpiTarget.hasSlabs = false;
                                kpiTarget.month = this.month;
                                kpiTarget.year = this.year;
                                kpiTarget.type = 'KPI Target';
                                kpiTarget.incentiveSlabs = [];
                                kpiTarget.showContainer = !scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                                kpiTarget.callComponent = false;
                                kpiTarget.showKPI = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                                kpiTarget.showPayout = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout');
                                this.productKPITargetsInfo[key].push(kpiTarget);
                                this.prodAndSubCategory[key].subCategoryList.forEach(sub => {
                                    let subPayout = this.productKPIPayoutsInfo[key].find(payout => payout.key == sub.name);
                                    let index = this.productKPIPayoutsInfo[key].findIndex(payout => payout.key == sub.name);
                                    if (subPayout) {
                                        subPayout.kpiPayouts.push({ productKPIId: scheme[i].Id, kpiId: scheme[i].KPI__c, kpiName: kpiTarget.incentiveName, kpiTargetId: null, payoutId: null, subProductId: sub.subCategoryId, subProductName: sub.name, variesByRegion: false, variesBy4WD: false, bothChecked: false, bothUnchecked: true, regionPayout: [], toShow: false, isVaries4WD: scheme[i].Product_Category__r.Name == 'BHL' ? true : false });
                                        this.productKPIPayoutsInfo[key][index] = subPayout;
                                    } else {
                                        subPayout = { key: sub.name, kpiPayouts: [] };
                                        subPayout.kpiPayouts.push({ productKPIId: scheme[i].Id, kpiId: scheme[i].KPI__c, kpiName: kpiTarget.incentiveName, kpiTargetId: null, payoutId: null, subProductId: sub.subCategoryId, subProductName: sub.name, variesByRegion: false, variesBy4WD: false, bothChecked: false, bothUnchecked: true, regionPayout: [], toShow: false, isVaries4WD: scheme[i].Product_Category__r.Name == 'BHL' ? true : false });
                                        this.productKPIPayoutsInfo[key].push(subPayout);
                                    }
                                })
                            }
                        }
                    }

                } else {
                    if (key == this.productName) {
                        if (this.prodAndSubCategory && this.prodAndSchemes) {
                            this.payoutByProduct = this.allKPIs[this.productName];
                            this.getInitialData();
                            this.getProductKpiPayout();
                            this.getKPIPayouts();
                        }
                    }
                }
            }
            this.selectedKPITarget = this.productKPITargetsInfo[this.productName];
            this.Selectedstockcondition = this.stockcondition[this.productName];
            this.selectedKPIPayout = this.productKPIPayoutsInfo[this.productName];
            this.variesByHandler();
            this.getAddKPIOptions();
            this.getKPIPayouts();
        } catch (e) {
            console.log(e);
        }
    }

    variesByHandler() {
        let kpiPayout = this.selectedKPIPayout?.length > 0 ? this.selectedKPIPayout[0].kpiPayouts : [];
        for (let i = 0; i < kpiPayout?.length; i++) {
            for (let j = 0; j < this.payoutByProduct?.length; j++) {
                if (this.payoutByProduct[j].key == kpiPayout[i].kpiName) {
                    this.payoutByProduct[j].isChecked = kpiPayout[i].variesByRegion;
                    this.payoutByProduct[j].variesBy4WD = kpiPayout[i].variesBy4WD;
                    this.payoutByProduct[j].isVaries4WD = this.productName == 'BHL' ? true : false;
                    this.payoutByProduct[j] = this.handleCheckboxes(this.payoutByProduct[j]);
                    break;
                }
            }
        }
    }

    getPayoutSchemesbyProduct() {
        for (const key in this.prodAndSchemes) {
            var schemes = this.prodAndSchemes[key];
            this.allKPIs[key] = [];
            for (let i = 0; i < schemes?.length; i++) {
                if (schemes[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout')) {
                    let keyLabel = schemes[i].KPI__r.Name + ' Incentive';
                    var payout = { key: keyLabel, Id: schemes[i].KPI__r.Id, orderNo: schemes[i].Order_No__c, value: 0, isChecked: false, toShow: false, disabled: true, isVaries4WD: schemes[i].Product_Category__r.Name == "BHL" ? true : false };
                    this.allKPIs[key].push(payout);
                }
            }
        }
        this.payoutByProduct = this.allKPIs[this.productName];
    }

    getProductSchemeTarget(product) {
        var schemes = this.prodAndSchemes[product];
        var payoutInfo = [];
        for (let i = 0; i < schemes?.length; i++) {
            let keyLabel = schemes[i].KPI__r.Name + ' Target';
            var payout = { key: keyLabel, id: schemes[i].KPI__r.Id, orderNo: schemes[i].Order_No__c, value: 0, sNo: i };
            payoutInfo.push(payout);
        }
        this.payoutScheme = payoutInfo;
        if (this.listOfVolumeSlabs) {
            var isShow = false;
            for (let i = 0; i < this.listOfVolumeSlabs?.length; i++) {
                if (this.listOfVolumeSlabs[i].productName == this.productName) {
                    isShow = true;
                    if (!this.listOfVolumeSlabs[i].payoutScheme) {
                        this.listOfVolumeSlabs[i].payoutScheme = payoutInfo;
                    }
                    break;
                }
            }
            if (!isShow) {
                this.listOfVolumeSlabs.push({ productName: this.productName, productId: this.prodAndSubCategory[this.productName].productId, isVolume: true, payoutScheme: payoutInfo });
            }
        } else {
            this.listOfVolumeSlabs.push({ productName: this.productName, productId: this.prodAndSubCategory[this.productName].productId, isVolume: true, payoutScheme: payoutInfo });
        }
    }

    getProductKPITargets() {
        var productKPIPayout = this.productKpiPayout;
        for (let j = 0; j < productKPIPayout?.length; j++) {
            if (productKPIPayout[j].subProductsPayout != null) {
                for (let l = 0; l < productKPIPayout[j].subProductsPayout?.length; l++) {
                    var payoutInto = productKPIPayout[j].subProductsPayout[l].payoutInfo;
                    for (let k = 0; k < payoutInto?.length; k++) {
                        if (payoutInto[k].kpiName.includes('4WD')) {
                            payoutInto[k].payoutAmount = null;
                            payoutInto[k].variesByRegion = false;
                        } else {
                            payoutInto[k].payoutAmount = payoutInto[k].payoutAmount ? parseFloat(payoutInto[k].payoutAmount) : null;
                            payoutInto[k].variesByRegion = false;
                            payoutInto[k].regionPayout = [];
                        }
                    }
                    productKPIPayout[j].subProductsPayout[l].payoutInfo = payoutInto;
                }
            }
        }
        return productKPIPayout;
    }

    handleIcon() {
        const element = this.template.querySelector('[data-name="mainDiv"]');
    }

    onValueChange(event) {
        this.year = event.detail.year;
        this.month = event.detail.month;
        if (this.template.querySelector('c-d-i-dealer-formula-configure')) {
            this.template.querySelector('c-d-i-dealer-formula-configure').month = this.month;
            this.template.querySelector('c-d-i-dealer-formula-configure').year = this.year;
            this.template.querySelector('c-d-i-dealer-formula-configure').getAccountByRegion();
        }
    }

    get optionsRange() {
        return [{ label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Equal to', value: '==' },
        { label: 'Not Equal to', value: '!=' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' },
        ];
    }

    getInitialData() {
        let isTargetExist = this.productKPITargetsInfo[this.productName] && this.productKPITargetsInfo[this.productName]?.length > 0;
        let isPayoutExist = this.productKPIPayoutsInfo[this.productName] && this.productKPIPayoutsInfo[this.productName]?.length > 0;
        if (isTargetExist) {
            this.selectedKPITarget = this.productKPITargetsInfo[this.productName];
        } else if (!isTargetExist) {
            this.productKPITargetsInfo[this.productName] = [];
            let scheme = this.prodAndSchemes[this.productName];
            for (let i = 0; i < scheme?.length; i++) {
                let kpiTarget = {};
                kpiTarget.productName = scheme[0].Product_Category__r.Name;
                kpiTarget.productId = scheme[0].Product_Category__r.Id;
                if (scheme[i].KPI__r.Name == 'Volume') {
                    kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Incentive';
                    kpiTarget.incentiveName = scheme[i].KPI__r.Name + ' Incentive';
                    kpiTarget.isSlab = true;
                    kpiTarget.isRange = false;
                } else {
                    kpiTarget.kpiTargetName = scheme[i].KPI__r.Name + ' Target';
                    kpiTarget.incentiveName = scheme[i].KPI__r.Name + ' Incentive';
                    kpiTarget.isSlab = false;
                    kpiTarget.isRange = false;
                }
                kpiTarget.kpiId = scheme[i].KPI__r.Id;
                kpiTarget.productKPIId = scheme[i].Id;
                kpiTarget.productKPI = { productKPIId: scheme[i].Id, kpiId: scheme[i].KPI__r.Id, kpiName: scheme[i].KPI__r.Name, productId: scheme[i].Product_Category__c, productName: scheme[i].Product_Category__r.Name };
                kpiTarget.hasSlabs = false;
                kpiTarget.month = this.month;
                kpiTarget.year = this.year;
                kpiTarget.type = 'KPI Target';
                kpiTarget.incentiveSlabs = [];
                kpiTarget.showContainer = !scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                kpiTarget.callComponent = false;
                kpiTarget.tempRange = {};
                kpiTarget.tempSlabs = [];
                kpiTarget.showKPI = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Target');
                kpiTarget.showPayout = scheme[i].KPI__r.KPI_Visiblity__c.includes('KPI Payout');
                this.productKPITargetsInfo[this.productName].push(kpiTarget);
            }
        }
        this.selectedKPITarget = this.productKPITargetsInfo[this.productName];
        this.getAddKPIOptions();
    }

    getProductKpiPayout() {
        if (!(this.productKPIPayoutsInfo && this.productKPIPayoutsInfo[this.productName] && this.productKPIPayoutsInfo[this.productName]?.length > 0)) {
            this.productKPIPayoutsInfo[this.productName] = [];
            let subPayout = {};
            this.subCategory.map(sub => {
                subPayout = { key: sub.name, kpiPayouts: [] },
                    this.prodAndSchemes[this.productName].forEach(scheme => {
                        if (scheme.KPI__r.KPI_Visiblity__c.includes('KPI Payout')) {
                            subPayout.kpiPayouts.push({ productKPIId: scheme.Id, subProductId: sub.subCategoryId, subProductName: sub.name, variesByRegion: false, variesBy4WD: false, bothChecked: false, bothUnchecked: true, kpiId: scheme.KPI__r.Id, kpiName: scheme.KPI__r.Name + ' Incentive', show4WDIcon: scheme.KPI__r.Name.includes('4WD') ? true : false, toShow: false, isVaries4WD: scheme.Product_Category__r.Name == 'BHL' ? true : false });
                        }
                    }),
                    this.productKPIPayoutsInfo[this.productName].push(subPayout)
            });
            this.selectedKPIPayout = this.productKPIPayoutsInfo[this.productName];
        } else {
            this.selectedKPIPayout = this.productKPIPayoutsInfo[this.productName];
        }
        this.variesByHandler();
        this.getKPIPayouts();
    }
    handleVolume(event) {
        var name = event.target.name;
        var value = event.target.value;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var currentIds = event.target.getAttribute('data-id');
        for (let i = 0; i < this.listOfVolumeSlabs[ind].SingleRange?.length; i++) {
            let checkboxes = this.template.querySelectorAll('[data-id="checkbox"]')
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = event.target.checked;
                if (checkboxes[i].checked) {
                    this.singleDisable = true;
                    this.listOfVolumeSlabs[ind].SingleRange[i].incentiveValue = value ? value : 'Pro-rata-basis';
                } else {
                    this.singleDisable = false;
                }
            }
            if (this.listOfVolumeSlabs[ind].SingleRange[i].id == currentIds) {
                if (name == 'rangeSingle') {
                    this.listOfVolumeSlabs[ind].SingleRange[i].rangeSingleValue = value;
                } else if (name == 'singleInput') {
                    this.listOfVolumeSlabs[ind].SingleRange[i].singleInputvalue = value;
                } else if (name == 'incentive') {
                    this.listOfVolumeSlabs[ind].SingleRange[i].incentiveValue = value;
                } else {
                    this.listOfVolumeSlabs[ind].SingleRange[i].incentiveCheck = value;
                    if (value == 'Amt') {
                        this.listOfVolumeSlabs[ind].SingleRange[i].incentive = 'Incentive Amount';
                    } else {
                        this.listOfVolumeSlabs[ind].SingleRange[i].incentive = 'Incentive Percentage';
                    }
                }
            }
        }
    }

    @api handleRow() {
        this.showFooter = this.clonePreview;
        this.isLoading = true;
        this.subList = [];
        this.subCategory = this.prodAndSubCategory[this.productName].subCategoryList;
        this.subCategory4WD = JSON.parse(JSON.stringify(this.subCategory));
        if (this.prodAndSubCategory && this.prodAndSchemes) {
            this.payoutByProduct = this.allKPIs[this.productName];
            this.getInitialData();
            this.getProductKpiPayout();
            this.getKPIPayouts();
        }
        this.getProductTargets();
        this.setStockPolicy();
        this.editStockPolicy = true;
        setTimeout(() => {
            this.isLoading = false;
        }, 300);
    }

    subId
    kpiId;
    showModalPopup(event) {
        this.subProdName = event.target.dataset.subname;
        this.subId = event.target.dataset.subid;
        this.kpiId = event.target.dataset.kpiid;
        this.subCategory4WD = { regionPayout: [] };
        let kpiPayout = this.selectedKPIPayout.find((subProd) => subProd.key == this.subProdName);
        let payout;
        if (kpiPayout) {
            let subProd = kpiPayout.kpiPayouts.find((kpi) => kpi.subProductId == this.subId && kpi.productKPIId == this.kpiId);
            payout = subProd?.regionPayout || [];
            for (let r = 0; r < this.regionList.length; r++) {
                let regionPay = payout.find(ele => ele.region == this.regionList[r]);
                if (!regionPay) {
                    payout.push({ region: this.regionList[r], amount: 0, twoWDPayoutAmount: 0, fourWDPayoutAmount: 0 });
                }
            }
            this.subCategory4WD['variesBy4WD'] = subProd?.variesBy4WD;
            this.subCategory4WD['variesByRegion'] = subProd?.variesByRegion;
            this.subCategory4WD = this.handleCheckboxes(this.subCategory4WD);
            this.subCategory4WD['twoWDPayoutAmount'] = subProd?.twoWDPayoutAmount;
            this.subCategory4WD['fourWDPayoutAmount'] = subProd?.fourWDPayoutAmount;
        }
        this.subCategory4WD['subProductName'] = this.subProdName;
        if (payout?.length > 0) {
            payout.sort((a, b) => a.region.localeCompare(b.region));
            this.subCategory4WD['regionPayout'] = payout;
        } else {
            for (let l = 0; l < this.regionList.length; l++) {
                this.subCategory4WD['regionPayout'].push({ region: this.regionList[l] });
            }
        }
        this.showTarget = true;
        this.isLoading = false;
    }

    closeRegion() {
        this.showTarget = false;
    }

    showUnsavedWarningCloseModal() {
        this.showUnsavedWarning = false;
    }

    toggleClick(event) {
        var indx = event.target.dataset.indx;
        let payoutInfo = this.selectedKPIPayout[indx].kpiPayouts;
        for (let i = 0; i < payoutInfo.length; i++) {
            if (payoutInfo[i].kpiName.includes('4WD')) {
                payoutInfo[i].show4WDIcon = true;
            } else if (payoutInfo[i].show4WDIcon) {
                payoutInfo[i].show4WDIcon = false;
            }
        }
        this.selectedKPIPayout[indx].isEdited = !this.selectedKPIPayout[indx].isEdited;
        this.showFooter = true;
        this.disableParent();
    }

    editAllHandler() {
        this.kpiEdit = true;
        this.zoneModalDisable = !this.zoneModalDisable;
        for (let i = 0; i < this.selectedKPIPayout.length; i++) {
            this.selectedKPIPayout[i].isEdited = !this.selectedKPIPayout[i].isEdited;
            if (this.selectedKPIPayout[i].isEdited) {
                this.isEditedAll = true;
                this.payoutByProduct.forEach(product => product.disabled = false);
                this.showFooter = true;
                this.isShowKpiIcon = false;
                this.linkDisable = "disableLink";
            } else if (!this.selectedKPIPayout[i].isEdited) {
                this.isEditedAll = false;
                this.payoutByProduct.forEach(product => product.disabled = true);
                this.showFooter = false;
                this.isShowKpiIcon = true;
                this.linkDisable = "ablelink";
            }
            this.disableParent();
        }
    }


    handleNameChange(event) {
        var subProductId = event.target.dataset.subid;
        var productKPIId = event.target.dataset.kpiid;
        var subProductName = event.target.dataset.subname;
        this.selectedKPIPayout.find((subProd) => subProd.key == subProductName).kpiPayouts.find((kpi) => kpi.subProductId == subProductId && kpi.productKPIId == productKPIId).payoutAmount = event.target.value;
    }
    productTargetsAndPayouts;
    prepareTargetAndPayoutInfo() {
        this.productTargetsAndPayouts = [];
        for (const key in this.productKPITargetsInfo) {
            let targetInfo = [];
            let payoutInfo = this.productKPIPayoutsInfo[key];
            this.productKPITargetsInfo[key].forEach(kpiTarget => {
                if (kpiTarget.showContainer) {
                    let kpi = {};
                    kpi.month = kpiTarget.month;
                    kpi.year = kpiTarget.year;
                    kpi.recordId = kpiTarget.recordId;
                    kpi.type = kpiTarget.type;
                    kpi.productKPI = kpiTarget.productKPI;
                    kpi.slabInfo = [];
                    kpi.hasSlabs = kpiTarget.hasSlabs;
                    if (kpiTarget.incentiveSlabs && kpiTarget.incentiveSlabs.length > 0) {
                        kpiTarget.incentiveSlabs.forEach(slab => {
                            if (slab.isSingle) {
                                slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent;
                            } else if (slab.isStartEnd) {
                                slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent + ' to ' + slab.rangeEnd + ' ' + slab.rangeEndPercent;
                            }
                            slab.payoutMode = slab.incentiveRadio;
                            if (slab.incentiveRadio == 'Amt') {
                                slab.amount = slab.incentiveValue;
                                slab.payoutPercentage = null;
                            } else if (slab.incentiveRadio == 'Percent') {
                                if (slab.incentiveValue == 'Pro-rata-basis') {
                                    slab.payoutMode = 'proRata';
                                    slab.amount = null;
                                    slab.payoutPercentage = null;
                                } else {
                                    slab.amount = null;
                                    slab.payoutPercentage = slab.incentiveValue;
                                }
                            }
                            kpi.slabInfo.push(slab);
                        });
                        kpi.hasSlabs = true;
                    }
                    else if (kpiTarget.showKPI) {
                        if (kpiTarget.incentiveRange) {
                            var range = kpiTarget.incentiveRange;
                            if (!kpiTarget.isSlab) {
                                if (range.isSingle == true) {
                                    kpi.target = range.singleRange + ' ' + range.singlePercent;
                                } else if (range.isStart) {
                                    kpi.target = range.startRange + ' ' + range.startPercent + ' to ' + range.endRange + ' ' + range.endPercent;
                                }
                                kpi.hasSlabs = false;
                                kpi.slabInfo = [];
                            }
                        }
                    }

                    kpi.productPayouts = [];
                    payoutInfo.forEach(sub => {
                        sub.kpiPayouts.forEach(payout => {
                            if (payout.productKPIId == kpiTarget.productKPIId) {
                                if (payout.variesByRegion) {
                                    let regionPayouts = [];
                                    if (payout.regionPayout && payout.regionPayout.length > 0) {
                                        payout.regionPayout.forEach(regionPayout => {
                                            if (payout.variesBy4WD) {
                                                if (regionPayout.twoWDPayoutAmount > 0 || regionPayout.fourWDPayoutAmount > 0) {
                                                    regionPayouts.push({ regPayoutId: regionPayout.regPayoutId, region: regionPayout.region, amount: null, fourWDPayoutAmount: regionPayout.fourWDPayoutAmount ? parseFloat(regionPayout.fourWDPayoutAmount) : 0, twoWDPayoutAmount: regionPayout.twoWDPayoutAmount ? parseFloat(regionPayout.twoWDPayoutAmount) : 0, disabled: true });
                                                }
                                            } else if (regionPayout.amount > 0) {
                                                regionPayouts.push({ regPayoutId: regionPayout.regPayoutId, region: regionPayout.region, amount: regionPayout.amount ? parseFloat(regionPayout.amount) : 0, fourWDPayoutAmount: null, twoWDPayoutAmount: null, disabled: true });
                                            }
                                        })
                                    }
                                    payout.payoutAmount = null;
                                    payout.twoWDPayoutAmount = null;
                                    payout.fourWDPayoutAmount = null;
                                    payout.regionPayout = regionPayouts;
                                } else {
                                    if (payout.variesBy4WD) {
                                        payout.twoWDPayoutAmount = payout.twoWDPayoutAmount ? payout.twoWDPayoutAmount : null;
                                        payout.fourWDPayoutAmount = payout.fourWDPayoutAmount ? payout.fourWDPayoutAmount : null;
                                        payout.payoutAmount = null;
                                    } else {
                                        payout.twoWDPayoutAmount = null;
                                        payout.fourWDPayoutAmount = null;
                                        payout.payoutAmount = payout.payoutAmount ? payout.payoutAmount : null;

                                    }
                                }
                                kpi.productPayouts.push(payout);
                            }
                        });
                    });
                    if (((kpi.slabInfo?.length > 0 || kpi.target || kpi.productPayouts?.length > 0) && kpi.recordId == null) || kpi.recordId) {
                        targetInfo.push(kpi);
                    }
                }
            });
            if (targetInfo && targetInfo.length > 0) {
                this.productTargetsAndPayouts = [...this.productTargetsAndPayouts, ...targetInfo];
            }
        }
    }

    chunkedList = [];
    handleSave() {
        this.isLoading = true;
        this.chunkedList = [];
        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
            let id2Delete = this.template.querySelector('c-d-i-product-formula-edit-page').deletedIds;
            if (id2Delete?.length > 0) {
                this.deletedIds.slabId = [...this.deletedIds.slabId, ...id2Delete]
            }
            for (const key in this.deletedIds) {
                this.chunkedList = [...this.chunkedList, ...this.chunkArray(this.deletedIds[key], 100)];
            }
        }
        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
            this.selectedKpiTargetTemp = this.template.querySelector('c-d-i-product-formula-edit-page').getKpiTarget();
            let isValid = this.requiredCheck(); 
            if (isValid) {
                this.selectedKPITarget = this.selectedKpiTargetTemp;
                this.productKPITargetsInfo[this.productName] = this.selectedKPITarget;
                this.prepareTargetAndPayoutInfo();
                if (this.clonePreview) {
                    this.deleteDealerIncentiveRecords();
                } else {
                    this.stockPolicies[this.productName] = this.stock;
                    this.saveProductKPITarget();
                }
                this.showUnsavedWarning = false;
            } else {
                let validToSave = this.template.querySelector('c-d-i-product-formula-edit-page').getValidToSave();
                this.showUnsavedWarning = false;
                this.isLoading = false;
            }
        } else {
            this.prepareTargetAndPayoutInfo();
            if (this.clonePreview) {
                this.deleteDealerIncentiveRecords();
            } else {
                this.stockPolicies[this.productName] = this.stock;
                this.saveProductKPITarget();
            }
        }
        this.zoneModalDisable = true;
        this.kpiEdit = false;
        this.isShowIcon = true;
        this.isShowKpiIcon = true;
        this.linkDisable = "ablelink";
    }

    deleteDealerIncentiveRecords() {
        deleteDealerIncRecords({ month: this.month, year: this.year }).then(res => {
            this.stockPolicies[this.productName] = this.stock;
            this.saveProductKPITarget();
        }).catch(error => {
            console.log(error);
        })
    }
    @api requiredCheck() {
        let isValid = true;
        for (let i = 0; i < this.selectedKpiTargetTemp.length; i++) {
            let prodKPI = this.selectedKpiTargetTemp[i];
            if (prodKPI.showKPI && prodKPI.showContainer) {
                if (prodKPI.isSlab) {
                    for (let k = 0; k < prodKPI.incentiveSlabs.length; k++) {
                        let slab = prodKPI.incentiveSlabs[k];
                        if (slab.isSingle) {
                            if (!(slab.rangeStart && slab.rangeStartPercent && slab.incentiveRadio && (parseFloat(slab.incentiveValue) >= 0 || parseFloat(slab.incentiveValue) < Number.MAX_SAFE_INTEGER || slab.incentiveValue == "Pro-rata-basis"))) {
                                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                isValid = false;
                                break;
                            }
                        } else if (slab.isStartEnd) {
                            if (!(slab.rangeStart && slab.rangeStartPercent && slab.rangeEnd && slab.rangeEndPercent && slab.incentiveRadio && (parseFloat(slab.incentiveValue) >= 0 || parseFloat(slab.incentiveValue) < Number.MAX_SAFE_INTEGER || slab.incentiveValue == "Pro-rata-basis"))) {
                                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                                isValid = false;
                                break;
                            }
                        }
                    }
                } else if (prodKPI.isRange) {
                    if (prodKPI.incentiveRange && prodKPI.incentiveRange.isSingle) {
                        if (!(prodKPI.incentiveRange.singleRange && prodKPI.incentiveRange.singlePercent)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                        }
                    } else if (prodKPI.incentiveRange && prodKPI.incentiveRange.isStart) {
                        if (!(prodKPI.incentiveRange.startRange && prodKPI.incentiveRange.startPercent && prodKPI.incentiveRange.endRange && prodKPI.incentiveRange.endPercent)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                        }
                    }
                }
            }
        }
        if (isValid) {
            this.slabs = [];
            for (let i = 0; i < this.selectedKpiTargetTemp.length; i++) {
                if (this.selectedKpiTargetTemp[i].callComponent) {
                    if (this.selectedKpiTargetTemp[i]?.incentiveSlabs?.length > 0 && this.selectedKpiTargetTemp[i]?.isSlab) {
                        for (let j = 0; j < this.selectedKpiTargetTemp[i].incentiveSlabs.length; j++) {
                            let slab = {};
                            let temp = this.selectedKpiTargetTemp[i].incentiveSlabs[j];
                            slab = { id: temp.id, startCondition: temp.rangeStart, minValue: temp.rangeStartPercent, endCondition: temp.rangeEnd, maxValue: temp.rangeEndPercent };
                            this.slabs.push(slab);
                        }
                        this.validateSlabs();
                    } else {
                        if (this.selectedKpiTargetTemp[i].incentiveRange?.isStart) {
                            this.validateRange(this.selectedKpiTargetTemp[i].incentiveRange);
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
                    start = 0;
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
                            //this.errorMessage = '';
                        }
                        return;
                    }
                }
            }
            this.successMessage = 'Scenario validation completed successfully. No overlaps detected between the conditions in the Scenario.';
        }
    }
    rangesOverlap(range1, range2) {
        return range1.start <= range2.end && range1.end >= range2.start;
    }

    validateRange(range) {
        let valid = parseFloat(range.endPercent) > parseFloat(range.startPercent);
        if (!valid) {
            this.errorMessage = `Error!!! End range must be greater than Start Range.`;
            this.successMessage = '';
        } else {
            this.errorMessage = '';
            this.successMessage = 'Scenario validation completed successfully. No overlaps detected between the conditions in the Scenario.';
        }
    }

    validateEndRange() {
        let status = '';
        for (let i = 0; i < this.slabs.length; i++) {
            let slab = this.slabs[i];
            if (slab.hasOwnProperty('minValue') && slab.hasOwnProperty('maxValue') && slab.minValue !== '' && slab.maxValue !== '') {
                if (parseFloat(slab.minValue) >= parseFloat(slab.maxValue)) {
                    status = `Error in Scenario ${slab.id}! End range must be greater than Start Range.`;
                    break;
                }
                else {
                    status = '';
                }
            }
        }
        return status;
    }

    saveProductKPITarget() {
        saveProductKPIAndTarget({ kpiTargetsAndPayouts: this.productTargetsAndPayouts, deletedIds: this.chunkedList, productTarget: Object.values(this.stockPolicies) })
            .then(result => {
                this.toast('Configurations has been saved successfully !', 'success');
                this.getTargetsAndPayouts();
                this.showFooter = false;
                this.disableParent();
                this.isEditedAll = false;
                this.deletedIds = { kpiTarget: [], kpiPayout: [], slabId: [], regionPayout: [] };
                this.chunkedList = [];
                this.productKPITargetsTemp = {};
                this.productKPIPayoutsTemp = {};
                this.editStockPolicy = true;
                this.getKPITargetAndPayoutInfo(this.month, this.year, false);
                this.getProductTargets();
                setTimeout(() => {
                    this.isLoading = false;
                }, 2000);
            }).catch(error => {
                console.error('save kpi target error ====>   ', error);
                this.isLoading = false;
            })
    }

    // async getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     this.recalculateLoading = true;
    //     getTargetsAndPayouts({ month: this.month, year: this.year, dealerIds: dealerIds, isActual: false }).then(res => {
    //         let message = await getDealerTargetsAndPayouts(res);
    //         if (message == 'SUCCESS') {
    //             this.recalculateLoading = false;
    //             this.toast('The payouts are recalculated and new data was saved in the backend.', success);
    //         } else {
    //             this.recalculateLoading = false;
    //             this.toast(e, error);
    //         }
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
                dealerIds: dealerIds,
                isActual: false
            });

            if (res?.dealerIncIds?.length > 0) {
                const message = await getDealerTargetsAndPayouts(res);
                console.log('message &&&&   ', message);
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
            console.error('An error occurred while recalculating the payouts :', error);
            this.recalculateLoading = false;
            this.toast('An error occurred while fetching targets.', 'error');
        }
    }



    getPicklistValues() {
        getPicklistValues({})
            .then(result => {
                this.regionList = result;
            })
            .catch(error => {

            })
    }

    handleImport(event) {
        if (this.template.querySelector('c-d-i-dealer-formula-configure')) {
            this.template.querySelector('c-d-i-dealer-formula-configure').showImport = event.detail.showImport;
        }
    }

    handleApplyInputs() {
        this.showFooter = true;
        this.disableParent();
        for (let i = 0; i < this.subCategory4WD.regionPayout.length; i++) {
            this.subCategory4WD.regionPayout[i].amount = this.subCategory4WD.regionPayout[i].amount;
        }
        this.selectedKPIPayout.find((subProd) => subProd.key == this.subProdName).kpiPayouts.forEach((kpi) => {
            if (kpi.subProductId == this.subId && kpi.productKPIId == this.kpiId) {
                if (this.subCategory4WD.variesByRegion) {
                    kpi.regionPayout = this.subCategory4WD.regionPayout;
                } else if (this.subCategory4WD.variesBy4WD) {
                    kpi.twoWDPayoutAmount = this.subCategory4WD.twoWDPayoutAmount;
                    kpi.fourWDPayoutAmount = this.subCategory4WD.fourWDPayoutAmount;
                }
            }
        });
        this.showTarget = false;
        this.childIndex = null;
        this.parentIndex = null;
        this.iconIndex = null;
    }

    handleAmountChange(event) {
        let index = event.target.dataset.indvar;
        let name = event.target.dataset.name;
        let region = event.target.dataset.region;
        if (this.subCategory4WD.variesByRegion) {
            for (let i = 0; i < this.subCategory4WD.regionPayout.length; i++) {
                if (this.subCategory4WD.regionPayout[i].region == region) {
                    this.subCategory4WD.regionPayout[i][name] = parseFloat(event.target.value) || 0;
                    break;
                }
            }
        } else if (this.subCategory4WD.variesBy4WD) {
            this.subCategory4WD[name] = event.target.value;
        }
    }

    fourWDInputs() {
        for (let k = 0; k < this.regionInputs.length; k++) {
            if (this.listOfVolumeSlabs[this.iconIndex].incentiveModel[this.parentIndex].subCategory == this.regionInputs[k].subCategory) {
                var region = this.regionInputs[k].region;
                let concatenatedString = '';
                for (let i = 0; i < region.length; i++) {
                    concatenatedString += region[i];
                    if (i < region.length - 1) {
                        concatenatedString += ',';
                    }
                    var subs = this.listOfVolumeSlabs[this.iconIndex].incentiveModel[this.parentIndex].modelWise[this.childIndex];
                    subs.value = concatenatedString; f
                    subs.show4WDIcon = false;
                    subs.isEdited = false;
                    this.listOfVolumeSlabs[this.iconIndex].incentiveModel[this.parentIndex].isEdited = false;
                }
            }
        }
        this.showTarget = false;
        this.childIndex = null;
        this.parentIndex = null;
    }

    headerText = 'Click to Expand';
    iconName = 'utility:chevronup';

    toggleContent() {
        this.showContent = !this.showContent;
        if (this.showContent) {
            this.headerText = 'Click to Collapse';
            this.iconName = 'utility:chevrondown';
        } else {
            this.headerText = 'Click to Expand';
            this.iconName = 'utility:chevronup';
        }
    }

    targetRadio(event) {
        var value = event.target.value;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        if (value == 'range') {
            this.productKpiTarget[index].kpiTargets[ind].isRange = true;
            this.productKpiTarget[index].kpiTargets[ind].isSlab = false;
        } else {
            this.productKpiTarget[index].kpiTargets[ind].isRange = false;
            this.productKpiTarget[index].kpiTargets[ind].isSlab = true;
        }
    }

    showComponent(event) {
        this.isShowIcon = false;
        this.showFooter = true;
        this.showNewKpi = false;
        this.isShowSales = false;
        this.kpiEdit = true;
        this.disableParent();
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var productKPIId = event.target.dataset.id;
        this.selectedKPITarget = this.selectedKPITarget.map(kpi => {
            if (kpi.productKPIId == productKPIId) {
                kpi.callComponent = true;
                kpi.isShowIndustry = false;
            } else if (kpi.showKPI) {
                kpi.showContainer = false;
            }
            return kpi;
        });
        this.showStockPolicy = false;
    }

    indVal;
    handleUnsaveClose() {
        this.showUnsavedWarning = false;
        this.handleDiscard();
    }
    handleDiscard() {
        this.isLoading = true;
        let kpiTarget = this.selectedKPITarget[this.indexVal];
        kpiTarget.isSlab = kpiTarget.kpiTargetName == 'Volume Incentive' ? true : kpiTarget.incentiveSlabs.length > 0;    //Fix to make the checkbox checked if the kpi is volume.
        kpiTarget.isRange = kpiTarget.incentiveRange && (kpiTarget.incentiveRange.isSingle || kpiTarget.incentiveRange.isStart) ? true : false;
        kpiTarget.callComponent = false;
        this.selectedKPITarget[this.indexVal] = kpiTarget;
        this.showFooter = false;
        this.disableParent();
        this.getAddKPIOptions();
        this.getKPIPayouts();
        this.handleIncentiveCancel();
        setTimeout(() => { this.isLoading = false; }, 300);
    }

    handleIncentiveCancel() {
        this.deleteIds = [];
        this.getKPITargetAndPayoutInfo(this.month, this.year, false);
        this.showFooter = false;
        this.disableParent();
        this.isEditedAll = false;
        this.selectedKPITarget[0].isShowIndustry = this.productName == 'EXC' && this.selectedKPITarget[0].productKPI.kpiName == 'Market Coverage' ? true : false;
        this.payoutByProduct.forEach(product => product.disabled = true);
        this.zoneModalDisable = true;
        this.editStockPolicy = true;
        this.showStockPolicy = true;
        this.isShowSales = true;
        this.isShowIcon = true;
        this.isShowKpiIcon = true;
        this.linkDisable = "ablelink";
        setTimeout(() => { this.isLoading = false; }, 500);
    }

    showBack(event) {
        var showModal = this.template.querySelector('c-d-i-product-formula-edit-page').handleEditOrChange();
        if (showModal) {
            this.showUnsavedWarning = true;
            this.indexVal = event.target.dataset.index;
            this.indVal = event.target.dataset.ind;
        } else {
            this.isLoading = true;
            this.indexVal = event.target.dataset.index;
            this.indVal = event.target.dataset.ind;
            this.kpiToBack = event.target.dataset.kpi;
            this.handleIncentiveCancel();
        }
        this.selectedKPITarget[0].isShowIndustry = this.productName == 'EXC' && this.selectedKPITarget[0].productKPI.kpiName == 'Market Coverage' ? true : false;
        this.showStockPolicy = true;
        this.isShowSales = true;
        this.isShowIcon = true;
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    disableParent() {
        const disable = new CustomEvent('disableparent', {
            detail: { commonDisable: this.showFooter, isTabVisible: false }
        });
        this.dispatchEvent(disable);
    }

    handleKeyPress(event) {
        const charCode = event.which ? event.which : event.keyCode;
        if (
            charCode !== 8 && // backspace
            charCode !== 46 && // delete
            charCode !== 9 && // tab
            charCode !== 27 && // escape
            charCode !== 13 && // enter
            !(charCode >= 37 && charCode <= 40) && // arrow keys
            (charCode < 48 || charCode > 57) // digits (0-9)
        ) {
            event.preventDefault();
        }
    }

    handleInput(event) {
        const value = event.target.value;
        event.target.value = value.replace(/\D/g, '');
    }

    @track showWarningToDelete = false;
    @track SalesKpiLabel;
    showSalesModal(event) {
        this.isIndustry = 'Sales';
        var index = event.target.dataset.index;
        this.saleInd = index;
        const isChecked = event.target.checked;
        this.showSalesmanIncentive = isChecked ? true : false;
        for (let i = 0; i < this.selectedKPITarget.length; i++) {
            if (isChecked) {
                this.selectedKPITarget[index].checked = isChecked;
                this.selectedKPITarget[i].disableOthers = this.selectedKPITarget[i].checked ? false : true;
            } else {
                this.selectedKPITarget[index].checked = isChecked;
                this.selectedKPITarget[i].disableOthers = false;
                if (this.selectedKPITarget[i].salesPersonTarget != null) {
                    this.showWarningToDelete = true;
                    this.isIncentiveName = 'Salesperson';
                    this.SalesKpiLabel = this.selectedKPITarget[i].kpiTargetName;
                }
            }
        }
    }

    @track isIndustry;
    showIndustryModal(event) {
        this.isIndustry = 'Industry';
        var index = event.target.dataset.index;
        this.saleInd = index;
        const isChecked = event.target.checked;
        this.showSalesmanIncentive = isChecked ? true : false;
        for (let i = 0; i < this.selectedKPITarget.length; i++) {
            if (isChecked) {
                this.selectedKPITarget[index].indChecked = isChecked;
            } else {
                this.selectedKPITarget[index].indChecked = isChecked;
                this.showWarningToDelete = true;
                this.isIncentiveName = 'TIV';
                this.SalesKpiLabel = this.selectedKPITarget[index].kpiTargetName;
            }
        }
    }

    handleCloseModal(event) {
        if (event.detail == 'save') {
            this.getKPITargetAndPayoutInfo(this.month, this.year, false);
        } else {
            this.showSalesmanIncentive = event.detail;
            this.setKPIAndPayoutInfo();
        }
    }

    handleStockPolicyEdit() {
        this.showFooter = true;
        this.disableParent();
        this.editStockPolicy = false;
        this.isEditingStock = true;
    }

    formatStock(productName) {
        let stockPolicy = this.productTargets.find(stock => stock.DI_Product_Category__r.Name == productName);
        let stock = {};
        stock.productName = productName;
        stock.DI_Product_Category__c = stockPolicy?.DI_Product_Category__r?.Id || this.prodAndSubCategory[productName].productId;
        stock.Id = stockPolicy?.Id || "";
        stock.stockPolicyName = 'stockpolicy';
        stock.Year__c = this.year;
        stock.Month__c = this.month;
        stock.Stock_Policy__c = parseInt(stockPolicy?.Stock_Policy__c) || 0;
        return stock;
    }
    @track stockPolicies = {};
    setStockPolicy() {
        for (const key in this.prodAndSubCategory) {
            this.stockPolicies[key] = this.formatStock(key);
        }
        this.stock = this.stockPolicies[this.productName];
    }
    handleStockInputChange(event) {
        this.stock.Stock_Policy__c = parseInt(event.target.value) || 0;
    }
    saveStockPolicy() {
        const inputData = this.template.querySelectorAll(`lightning-input[data-name="stockpolicy"]`);
        this.recordsToSave = [];
        inputData.forEach(input => {
            let productId = this.prodAndSubCategory[this.productName].productId;
            if (productId == undefined || productId == null) {
                productId = this.prodAndSubCategory[this.productName].productId;
            }
            let recordId = input?.dataset?.recordid;
            let stockPolicyDays = input?.value;
            let Month = input?.dataset?.month;
            let Year = input?.dataset?.year;

            let pushingData = {
                DI_Product_Category__c: productId,
                Stock_Policy__c: stockPolicyDays,
                Year__c: this.year,
                Month__c: this.month
            };
            if (recordId) {
                pushingData.Id = recordId;
            }
            this.recordsToSave.push(pushingData);
        });
    }

    @track slabIds = [];
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

    deleteSalesIds = [];
    fieldToClear;
    kpiRecordId;
    salesmanIncentive;
    handleSalesDelete() {
        var index = this.selectedKPITarget[this.saleInd].slabInfo;
        this.kpiRecordId = this.selectedKPITarget[this.saleInd].recordId;
        if (this.isIndustry == 'Industry') {
            this.industryIncentive = false;
            this.fieldToClear = this.selectedKPITarget[this.saleInd].salesPersonTarget;
            this.salesmanIncentive = true;
        } else {
            this.fieldToClear = this.selectedKPITarget[this.saleInd].salesPersonTarget;
            this.salesmanIncentive = false;
        }
        for (let i = 0; i < index.length; i++) {
            if (index[i].slabType == 'Salesperson Incentive' || index[i].slabType == 'Total Volume Industry Incentive') {
                this.deleteSalesIds.push(index[i].slabId);
            }
        }

        if (this.deleteSalesIds?.length > 0) {
            let chunkedList = this.chunkArray(this.deleteSalesIds, 100);
            deleteRecordInDatabase({ deleteIds: chunkedList })
                .then(res => {
                    this.deleteSalesIds = [];
                }).catch(err => {

                })
        }
        this.handleSlabsIndustry();
        this.handleClearField();
    }

    handleClearField() {
        clearSingleField({ recordId: this.kpiRecordId, fieldToClear: this.fieldToClear, salesmanIncentive: this.salesmanIncentive, industryIncentive: this.industryIncentive })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Deleted successfully.',
                        variant: 'success',
                    }),
                );
                this.getKPITargetAndPayoutInfo(this.month, this.year, false);
                this.showWarningToDelete = false;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleSlabsIndustry() {
        let slab = this.selectedKPITarget[this.saleInd].incentiveSlabs;
        for (let i = 0; i < slab.length; i++) {
            if (slab[i].slabType == 'Total Volume Industry Incentive') {
                slab[i].splice(i, 1);
            }
        }
    }

    handleSalesCancel() {
        this.showWarningToDelete = false;
        this.setKPIAndPayoutInfo();
    }

    showExistingConfigured(event) {
        this.isIndustry = 'Sales';
        this.showSalesmanIncentive = true;
        var index = event.target.dataset.index;
        this.saleInd = index;
    }

    showIndustryConfigured(event) {
        this.isIndustry = 'Industry';
        this.showSalesmanIncentive = true;
        var index = event.target.dataset.index;
        this.saleInd = index;
    }

    handleInputValidation(event) {
        event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    }

    handleKeyPressValidation(event) {
        if (event.key.match(/[^0-9.]/)) {
            event.preventDefault();
        }
        if (event.key == '.' && event.target.value.includes('.')) {
            event.preventDefault();
        }
    }

    handlePasteValidation(event) {
        const clipboardData = event.clipboardData?.getData('text');
        if (clipboardData?.match(/[^0-9.]/)) {
            event.preventDefault();
        }
    }

    sortSlabs(slabs) {
        return slabs.sort((a, b) => {
            const rangeA = this.parseRange(a.slabRange);
            const rangeB = this.parseRange(b.slabRange);

            return rangeA.min - rangeB.min || rangeA.max - rangeB.max;
        });
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
}