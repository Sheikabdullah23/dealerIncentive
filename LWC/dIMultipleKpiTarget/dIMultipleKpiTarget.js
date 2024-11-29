import { LightningElement, track, api } from 'lwc';
import getProductsAndKPI from '@salesforce/apex/JCBDealerIncentiveController.getProductsAndKPI';
import saveMultipleKPITarget from '@salesforce/apex/dIFormulaController.saveMultipleKPITarget';
import getMultiKPITargets from '@salesforce/apex/dIFormulaController.getMultiKPITargets';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteRecordInDatabase from '@salesforce/apex/dIFormulaController.deleteRecordInDatabase';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';

export default class DIMultipleKpiTarget extends LightningElement {

    @track showSubMenuItem = false;
    @track showMenuItem = false;
    @track prodAndSchemes;
    @track kpiMenuItemOptionsToShow;
    totalKpiMenuItemOptions = [];
    @api productName;
    @track selectedKpi = [];
    @track showDeleteConfirmation = false;
    index;
    @track isLogic = false;
    @track logicInput;
    productKpiName;
    productKpiId;
    kpiId;
    @track newArray = [];
    @api month;
    @api year;
    @api productId;
    @track showCancelSave = false;
    @track isDropdown = null;
    @track isAdd = true;

    get optionsRange() {
        return [{ label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Equal to', value: '==' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' },
        ];
    }

    get optStartRange() {
        return [
            { label: 'Greater than', value: '>' },
            { label: 'Greater than or equal to', value: '>=' },
        ];
    }

    get optEndRange() {
        return [
            { label: 'Less than', value: '<' },
            { label: 'Less than or equal to', value: '<=' },
        ];
    }

    get logicOptions() {
        return [
            { label: 'AND', value: 'AND' },
            { label: 'OR', value: 'OR' },
        ];
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    handleProduct(event) {
        var index = event.target.dataset.index;
        for (let i = 0; i < this.newArray.length; i++) {
            this.newArray[i].showMenuItem = index == i ? true : false;
        }
    }

    handleNewProduct() {
        this.getInitialData();
    }

    getProductsAndKPI() {
        getProductsAndKPI({}).then(result => {
            this.prodAndSchemes = result;
            this.getKpiWithOption();
            this.getMultiKPITargets();
        })
            .catch(error => {
                console.error('ERROR ===> ', error);
            })
    }

    connectedCallback() {
        this.getProductsAndKPI();
        document.addEventListener('click', this.close.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._handler);
    }

    handleKpiMouseOver(event) {
        var key = event.target.dataset.key;
        this.isDropdown = key;
    }

    handleKpiLeave() {
        this.isDropdown = null;
    }

    close() {
        if (this.isDropdown == null) {
            for (let i = 0; i < this.newArray.length; i++) {
                this.newArray[i].showMenuItem = false;
            }
        }
    }

    getInitialData() {
        let scheme = this.prodAndSchemes[this.productName];
        let addTarget = {};
        for (let i = 0; i < scheme.length; i++) {
            if (scheme[i].KPI__r.KPI_Visiblity__c.includes('Multi KPITarget')) {
                addTarget.adjustSize = "slds-grid slds-m-around_medium";
                addTarget.productName = scheme[i].Product_Category__r.Name;
                addTarget.productId = scheme[i].Product_Category__r.Id;
                addTarget.month = this.month;
                addTarget.year = this.year;
                addTarget.slab = [];
                addTarget.conditionLogic = '';
                addTarget.amount = '';
                addTarget.showMenuItem = false;
                addTarget.isKpi = false;
                addTarget.isAdd = true;
                break;
            }
        }
        addTarget.kpiMenuItemOptions = this.totalKpiMenuItemOptions[this.productName];
        for (let k = 0; k < addTarget.kpiMenuItemOptions?.length; k++) {
            addTarget.kpiMenuItemOptions[k].toShow = true;
        }
        this.newArray.push(addTarget);

    }

    getKpiWithOption() {
        for (const key in this.prodAndSchemes) {
            let storeKpi = this.prodAndSchemes[key];
            this.totalKpiMenuItemOptions[key] = [];
            for (let i = 0; i < storeKpi.length; i++) {
                if (storeKpi[i].KPI__r.KPI_Visiblity__c.includes('Multi KPITarget')) {
                    this.totalKpiMenuItemOptions[key].push({ label: storeKpi[i].KPI__r.Name, value: storeKpi[i].KPI__r.Name, id: storeKpi[i].KPI__r.Id, productKpiId: storeKpi[i].Id, name: storeKpi[i].Product_Category__r.Name, toShow: true, isSubMenu: false });
                }
            }
        }
        this.kpiMenuItemOptionsToShow = this.totalKpiMenuItemOptions[this.productName];
    }

    showSubItems(event) {
        var inx = event.target.dataset.index;
        this.productKpiName = event.target.dataset.kpi;
        this.kpiId = event.target.dataset.kpid;
        this.productKpiId = event.target.dataset.prodkpid;
        this.subMenuItem(this.productKpiName, inx);
    }

    subMenuItem(kpiName, index) {
        for (let i = 0; i < this.newArray[index].kpiMenuItemOptions?.length; i++) {
            this.newArray[index].kpiMenuItemOptions[i].isSubMenu = this.newArray[index].kpiMenuItemOptions[i].label == kpiName ? true : false;
        }
    }

    addRow(event) {
        let propertyName = event.target.dataset.name;
        var index = event.target.dataset.index;
        this.newArray[index].showMenuItem = false;
        this.newArray[index].isKpi = true;
        this.newArray[index].adjustSize = "slds-grid slds-m-around_medium slds-p-top_xx-large";
        if (propertyName == 'Single') {
            this.newArray[index].slab.push({ id: this.newArray[index].slab.length + 1, kpiName: this.productKpiName, kpiId: this.kpiId, prodKpiId: this.productKpiId, logic: false, rangeStart: '', rangeStartPercent: '', rangeEnd: '', rangeEndPercent: '', isSingle: true, isStartEnd: false, });
        } else {
            this.newArray[index].slab.push({ id: this.newArray[index].slab.length + 1, kpiName: this.productKpiName, kpiId: this.kpiId, prodKpiId: this.productKpiId, logic: false, rangeStart: '', rangeStartPercent: '', rangeEnd: '', rangeEndPercent: '', isSingle: false, isStartEnd: true, });
        }
        this.isLogic = this.newArray[index].slab.length > 1 ? true : false;
        if (this.isLogic) {
            for (let i = 0; i < this.newArray[index].slab.length; i++) {
                let logi = this.newArray[index].slab.length - i;
                this.newArray[index].slab[i].logic = logi == 1 ? false : true;
            }
        }
        this.subMenuItem(null, index);
        console.log('slabss  ', this.newArray[index].slab);
        for (let j = 0; j < this.newArray[index].slab.length; j++) {
            for (let k = 0; k < this.newArray[index].kpiMenuItemOptions.length; k++) {
                if (this.newArray[index].slab[j].kpiName == this.newArray[index].kpiMenuItemOptions[k].label) {
                    this.newArray[index].kpiMenuItemOptions[k].toShow = false;
                    break;
                }
            }
        }
        let addKPI = this.newArray[index].kpiMenuItemOptions.find((kpi) => kpi.toShow == true);
        this.newArray[index].isAdd = addKPI ? true : false;
    }

    handleChange(event) {
        this.handleDispatch('edit');
        this.showCancelSave = true;
        var index = event.target.dataset.index;
        var value = event.target.value;
        var name = event.target.name;
        if (name == 'operator') {
            this.newArray[index].conditionLogic = value;
        } else {
            this.newArray[index].amount = value;
        }
    }

    handleDispatch(eveName){
        const evtName = new CustomEvent('hideinputs', {
            detail: eveName
        });
        this.dispatchEvent(evtName);
    }

    @track slabIds = [];
    removeRow(event) {
        var index = event.target.dataset.index;
        var indx = event.target.dataset.indx;
        var slabId = event.target.dataset.slab;
        this.slabIds.push(slabId);
        this.newArray[index].showMenuItem = false;
        let kpi = this.newArray[index].slab[indx].kpiName;
        var volume = this.newArray[index].slab;
        volume.splice(indx, 1);
        this.newArray[index].slab = volume;
        if (volume.length == 0) {
            this.newArray[index].isKpi = false;
            this.newArray[index].conditionLogic = '';
            this.newArray[index].amount = '';
            this.newArray[index].adjustSize = "slds-grid slds-m-around_medium";
        }
        for (let i = 0; i < this.newArray[index].slab.length; i++) {
            this.newArray[index].slab[i].id = i + 1;
            let log = this.newArray[index].slab.length - i;
            this.newArray[index].slab[i].logic = log == 1 ? false : true;
        }
        if (this.slabIds?.length > 0) {
            let chunkedList = this.chunkArray(this.slabIds, 100);
            deleteRecordInDatabase({ deleteIds: chunkedList }).then(result => {
                this.slabIds = [];
                this.getMultiKPITargets();
            }).catch(error => { })
        }
        for (let k = 0; k < this.newArray[index].kpiMenuItemOptions.length; k++) {
            this.newArray[index].kpiMenuItemOptions[k].toShow = true;
            for (let j = 0; j < this.newArray[index].slab.length; j++) {
                if (this.newArray[index].slab[j].kpiName == this.newArray[index].kpiMenuItemOptions[k].label) {
                    this.newArray[index].kpiMenuItemOptions[k].toShow = false;
                    break;
                }
            }
        }
        let addKPI = this.newArray[index].kpiMenuItemOptions.find((kpi) => kpi.toShow == true);
        this.newArray[index].isAdd = addKPI ? true : false;
    }

    chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr?.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }

    multiId;
    deleteIds = { multiKpi: [], multiSlab: [] };
    removeEntireRow(event) {
        var index = event.target.dataset.index;
        this.index = index;
        var multiId = event.target.dataset.multi;
        this.multiId = multiId;
        if (multiId == undefined && this.newArray[this.index].slab.length == 0) {
            this.showDeleteConfirmation = false;
            var volume = this.newArray;
            volume.splice(this.index, 1);
        } else {
            this.showDeleteConfirmation = true;
        }
    }

    handleRangeVolume(event) {
        this.handleDispatch('edit');
        var name = event.target.name;
        var value = event.target.value;
        var index = event.target.dataset.index;
        this.showCancelSave = true;
        var currentIds = event.target.dataset.id;
        console.log('current ids  ===', currentIds);

        var productKpi = this.newArray[index].slab;
        for (let i = 0; i < productKpi.length; i++) {
            if (productKpi[i].id == currentIds) {
                if (name == 'rangeStart') {
                    productKpi[i].rangeStart = value;
                } else if (name == 'rangeInput') {
                    productKpi[i].rangeStartPercent = value;
                } else if (name == 'rangeEnd') {
                    productKpi[i].rangeEnd = value;
                } else if (name == 'rangeInput1') {
                    productKpi[i].rangeEndPercent = value;
                }
                if (productKpi[i].isSingle) {
                    productKpi[i].rangeSlab = productKpi[i].rangeStart + '' + productKpi[i].rangeStartPercent;
                } else if (productKpi[i].isStartEnd) {
                    productKpi[i].rangeSlab = productKpi[i].rangeStart + '' + productKpi[i].rangeStartPercent + 'to' + productKpi[i].rangeEnd + '' + productKpi[i].rangeEndPercent;
                }
            }
        }
        this.newArray[index].slab = productKpi;
    }


    handleDelete() {

        this.showDeleteConfirmation = false;
        this.deleteIds.multiKpi.push(this.multiId);
        for (let i = 0; i < this.newArray[this.index].slab?.length; i++) {
            if (this.newArray[this.index].slab[i].slabId) {
                this.deleteIds.multiSlab.push(this.newArray[this.index].slab[i].slabId);
            }
        }
        if (this.deleteIds) {
            let chunkedList = [];
            for (const key in this.deleteIds) {
                chunkedList = [...chunkedList, ...this.chunkArray(this.deleteIds[key], 100)];

            }
            if (chunkedList?.length > 0) {
                deleteRecordInDatabase({ deleteIds: chunkedList }).then(result => {
                    var volume = this.newArray;
                    volume.splice(this.index, 1);
                    this.toast('The record is deleted successfully!', 'success');
                    this.getMultiKPITargets();
                    this.deleteIds = { multiKpi: [], multiSlab: [] };
                }).catch(error => { })
            }
        }

    }

    handleCancel() {
        this.showDeleteConfirmation = false;
    }

    handleProductCancel() {
        this.showCancelSave = false;
        this.getMultiKPITargets();
        this.handleDispatch('cancel');
    }

    @track productMulti = {};
    handleProductSave() {
        if (!this.productMulti[this.productName]) {
            this.productMulti[this.productName] = {};
        }
        this.productMulti[this.productName].multiKpi = this.newArray;
        let isValid = this.requiredCheck();
        if (isValid) {
            this.prepareMultiKPITargets();
            this.saveMultipleKPITarget();
        } else {
            let validToSave = this.getValidToSave();
        }
    }

    productCategoryMultiKPI;
    prepareMultiKPITargets() {
        this.productCategoryMultiKPI = [];
        for (const key in this.productMulti) {
            let prodCategory = {};
            prodCategory.productTargetId = this.productMulti[key].productTargetId;
            prodCategory.year = this.year;
            prodCategory.month = this.month;
            prodCategory.productCategory = { name: this.productName, productId: this.productId };
            prodCategory.multiKpi = [];
            this.productMulti[key]?.multiKpi?.forEach(proTarg => {
                let productkpi = {};
                productkpi.multiKpiId = proTarg.multiKpiId;
                productkpi.conditionLogic = proTarg.conditionLogic;
                productkpi.year = proTarg.year;
                productkpi.month = proTarg.month;
                productkpi.incentiveAmount = proTarg.amount;
                productkpi.multiKpSlabs = [];
                if (proTarg.slab.length && proTarg.slab.length > 0) {
                    proTarg.slab.forEach(slab => {
                        slab.slabId = slab.slabId;
                        if (slab.isSingle) {
                            slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent;
                        } else if (slab.isStartEnd) {
                            slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent + ' to ' + slab.rangeEnd + ' ' + slab.rangeEndPercent;
                        }
                        let productKpi = { productKPIId: slab.prodKpiId, kpiName: slab.kpiName, kpiId: slab.kpiId };
                        slab.productKPI = productKpi;
                        productkpi.multiKpSlabs.push(slab);
                    });
                }
                prodCategory.multiKpi.push(productkpi);
            });
            if (prodCategory.multiKpi.length > 0) {
                this.productCategoryMultiKPI.push(prodCategory);
            }
        }
    }

    saveMultipleKPITarget() {
        saveMultipleKPITarget({ productTargets: this.productCategoryMultiKPI })
            .then(result => {
                this.toast('Configurations has been saved successfully !', 'success');
                this.getTargetsAndPayouts();
                this.getMultiKPITargets();
                this.handleDispatch('cancel');
                this.deleteIds = { multiKpi: [], multiSlab: [] };
                this.showCancelSave = false;
            }).catch(error => {
                console.log('error ', error);
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
                dealerIds: dealerIds,
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

    handleDeleteConfirmation(event) {
        this.showDeleteConfirmation = true;
        this.index = event.target.dataset.index;
    }

    @api getMultiKPITargets() {
        this.productCategoryMultiKPI = [];
        this.newArray = [];
        this.productMulti = {};
        getMultiKPITargets({ month: this.month, year: this.year, product: this.productName })
            .then(result => {
                this.productCategoryMultiKPI = result[0];
                if (this.productCategoryMultiKPI) {
                    this.setMultiTarget();
                } else {
                    this.getInitialData();
                }
            }).catch(error => {
                console.log('error ', error);
            })
    }

    setMultiTarget() {
        this.productMulti[this.productName] = {};
        let record = this.productCategoryMultiKPI;
        if (record) {
            let productTarget = {};
            productTarget.year = record.year;
            productTarget.month = record.month;
            productTarget.productTargetId = record.productTargetId;
            productTarget.productName = record.productCategory.name;
            productTarget.productId = record.productCategory.productId;
            productTarget.multiKpi = [];
            if (record.multiKpi && record.multiKpi.length > 0) {
                for (let k = 0; k < record.multiKpi.length; k++) {
                    let multiKpi = {};
                    multiKpi.isKpi = record.multiKpi[k].multiKpSlabs?.length > 0 ? true : false;
                    multiKpi.multiKpiId = record.multiKpi[k].multiKpiId;
                    multiKpi.conditionLogic = record.multiKpi[k].conditionLogic;
                    multiKpi.year = record.multiKpi[k].year;
                    multiKpi.month = record.multiKpi[k].month;
                    multiKpi.amount = record.multiKpi[k].incentiveAmount;
                    multiKpi.adjustSize = "slds-grid slds-m-around_medium slds-p-top_xx-large";
                    multiKpi.kpiMenuItemOptions = [];
                    multiKpi.slab = [];
                    let slabs = record.multiKpi[k].multiKpSlabs;
                    let len = slabs?.length;
                    for (let l = 0; l < slabs?.length; l++) {
                        let slab = {};
                        slab.slabId = slabs[l].slabId;
                        let log = len - l;
                        slab.logic = log == 1 ? false : true;
                        slab.id = l + 1;
                        slab.prodKpiId = slabs[l].productKPI.productKPIId;
                        slab.kpiName = slabs[l].productKPI.kpiName;
                        slab.kpiId = slabs[l].productKPI.kpiId;
                        if (slabs[l].slabRange) {
                            if (slabs[l].slabRange.includes('to')) {
                                slab.isSingle = false;
                                slab.isStartEnd = true;
                                let ranges = slabs[l].slabRange.split(' ');
                                slab.rangeStart = ranges[0];
                                slab.rangeStartPercent = ranges[1];
                                slab.rangeEnd = ranges[3];
                                slab.rangeEndPercent = ranges[4];
                                slab.rangeSlab = slab.rangeStart + slab.rangeStartPercent + '% to ' + slab.rangeEnd + slab.rangeEndPercent + '%';
                            } else {
                                slab.isSingle = true;
                                slab.isStartEnd = false;
                                let ranges = slabs[l].slabRange.split(' ');
                                slab.rangeStart = ranges[0];
                                slab.rangeStartPercent = ranges[1];
                                slab.rangeSlab = slab.rangeStart + slab.rangeStartPercent + '%';
                            }
                        }
                        multiKpi.slab.push(slab);
                        multiKpi.kpiMenuItemOptions = JSON.parse(JSON.stringify(this.totalKpiMenuItemOptions[this.productName]));
                        for (let k = 0; k < multiKpi.kpiMenuItemOptions.length; k++) {
                            multiKpi.kpiMenuItemOptions[k].toShow = true;
                            for (let j = 0; j < multiKpi.slab.length; j++) {
                                if (multiKpi.slab[j].kpiName == multiKpi.kpiMenuItemOptions[k].label) {
                                    multiKpi.kpiMenuItemOptions[k].toShow = false;
                                    break;
                                }
                            }
                        }
                        let addKPI = multiKpi.kpiMenuItemOptions.find((kpi) => kpi.toShow == true);
                        multiKpi.isAdd = addKPI ? true : false;
                    }
                    productTarget.multiKpi.push(multiKpi);
                }
            } else {
                this.productMulti[this.productName] = productTarget;
                this.getInitialData();
            }
            this.productMulti[this.productName] = productTarget;
        } else {
            this.getInitialData();
        }
        this.newArray = this.productMulti[this.productName].multiKpi;

    }

    requiredCheck() {
        let isValid = true;
        for (let i = 0; i < this.newArray.length; i++) {
            let multiKPI = this.newArray[i];
            if (!(multiKPI.conditionLogic)) {
                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                isValid = false;
                break;
            }
            if (multiKPI.slab.length == 0) {
                this.toast('Please Add Slabs', 'error');
                isValid = false;
                break;
            }
            if (multiKPI.isKpi) {
                for (let k = 0; k < multiKPI.slab.length; k++) {
                    let slab = multiKPI.slab[k];
                    if (slab.isSingle) {
                        if (!(slab.rangeStart && slab.rangeStartPercent)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    }
                    else if (slab.isStartEnd) {
                        if (!(slab.rangeStart && slab.rangeStartPercent && slab.rangeEnd && slab.rangeEndPercent)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    }
                }
            }
            if (!(multiKPI.amount)) {
                this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                isValid = false;
                break;
            }

        }
        return isValid;
    }

    getValidToSave() {
        const fields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        fields.forEach(inputCmp => {
            if (inputCmp.value == null || inputCmp.value == '') {
                inputCmp.classList.add('slds-has-error');
            }
        });
        return 'Required Fields are Missing';
    }

}