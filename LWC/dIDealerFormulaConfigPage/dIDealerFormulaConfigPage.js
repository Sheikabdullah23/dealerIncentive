import { LightningElement, api, track, wire } from 'lwc';
import getAccountByRegion from '@salesforce/apex/dIFormulaController.getAccountByRegion';
import saveDealerFormula from '@salesforce/apex/dIFormulaController.saveDealerFormula';
import getProductAndSubProducts from '@salesforce/apex/JCBDealerIncentiveController.getProductAndSubProducts';
import sheetjs from '@salesforce/resourceUrl/sheetmin';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isDataPresent from '@salesforce/apex/dIFormulaController.isDataPresent';
import getProductsAndSubCategories from '@salesforce/apex/dIFormulaController.getProductsAndSubCategories';
import workbook from "@salesforce/resourceUrl/writeexcelfile";
import getAccounts from '@salesforce/apex/dIFormulaController.getAccounts';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts, updateActualRetail } from 'c/jCBActualIncentiveCalc';
import getOppsAndOrders from '@salesforce/apex/JCBActualCalcController.getOppsAndOrders';
import updateActualForAllDealers from '@salesforce/apex/JCBActualCalcController.updateActualForAllDealers';
import saveKpiPayouts from '@salesforce/apex/dIFormulaController.saveKpiPayouts';
import getDemoConducted from '@salesforce/apex/JCBActualCalcController.getDemoConducted';

let XLS = {};

export default class DIDealerFormulaConfigPage extends LightningElement {
    @track isDealerFormula = true;
    @track showDealerCard = false;
    @track editname;
    @track zoneIndex;
    @track editRecordIndex;
    @track alertonoff = false;
    @track productsAndSubCategoriesList = [];
    @track currentproduct;
    @api currentTab;
    @track disabletab = "";
    @track dealers = [];
    @track productList;
    @track prodAndSubCategory;
    @track showfooter = false;
    @api productCategory;
    @api subCategory = [];
    @track productVolumes;
    @track dataList = [];
    @track tempDataList = [];
    // @track isLoading = true;
    @track retailLoading = false;
    @track isClone = false;
    @track dealerOptions = [];
    @track allDealerOptions = [];
    @track dealerId = [];
    @track cloneRegIndex;
    @track cloneRecIndex;
    @track cloneSubIndex;
    @track cloneName;
    @api month;
    @api year;
    @track tabName;
    @track isZone;
    @track dealersByZone;
    @track allList;
    @api productCategoryList;
    @api subCategoryList;
    @api recordId;
    @track isTHProduct = false;
    @track fileData;
    @api showImport = false;
    @track dealerClass = 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name tab-border';
    @track zoneClass = 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name';
    @track colspan;
    @track isDealerTab = false;
    @track isZoneTab = false;
    @track zoneOptions = [];
    @track allZoneOptions = [];
    @track zoneNames = [];
    @track disableApplyBtn = true;
    @track disableImport = true;
    @track disableSave = true;
    @track startIndex;
    @track endIndex;
    @track cloneMsg;
    @track isDealerRowClone;
    @track isZoneRowClone;
    @track isCellClone;
    @track showDealerModal = false;
    @track dealerList;
    @track subList;
    @track hot;
    @track isEdited = false;
    @track table;
    @track showAlert = false;
    @track alwaysfalse = false;
    @track acceptedFormats = ['.xlsx', '.xls'];
    @track checkedit = {};
    @track showSubProductSelection = false;
    @track selectedsubproducts;
    @track showSelectmodalpage = false;
    @track showDealerFormulaConfig = false;
    @track removedSubProducts = {};
    @track tempRemovableProduct = [];
    @track askConfirmation = false;
    @track subprdlist = [];
    @track totalsubtgt;
    @track selectedproduct = { demoTarget: 0, totalRetailTarget: 0, subTargetAndAchievement: [] };
    @track isContain;
    @track isFromExcel = false;
    @track isDealerSearch = true;
    @track searchDealer = '';
    @track noOfRowsInExcel = new Set();
    @track noOfColumnsInExcel = new Set();
    @track countingProductColumns = {};
    @track countingProductRows = {};
    @track dealersCount = 0;
    @track isConvert = true;
    @track startTime;
    @track endTime;
    @track totalRetailLoadingTime;
    @track firstProduct;
    @track excelFormat;
    oldDealerIds = [];

    dealerRecords = [];
    sheetNames = []; objects = []; objectArray = [];
    count = 1;

    @wire(getAccounts) wiredData({ error, data }) {
        if (data) {
            this.dealerRecords = data;
        } else if (error) {
        }
    }
    connectedCallback() {
        // this.isLoading = true;
        this.hasCalledValues = false;
        this.startTime = performance.now();
        this.getProductsAndSubCategories();
        this.isData();
    }

    @api isData() {
        // this.isLoading = true;
        // const retailloading = new CustomEvent('retailloading', {
        //     detail: this.isLoading
        // });
        // this.dispatchEvent(retailloading);
        isDataPresent({ month: this.month, year: this.year }).then(result => {
            this.isContain = result;
            this.dataList = [];
            if (this.isContain == true) {
                this.showSelectmodalpage = false;
                this.selectedsubproducts = null;
                this.getAccountByRegion();
            } else {
                let prdcount = {};
                for (const key in this.productCategoryList) {
                    prdcount[key] = 0;
                }
                const productcount = new CustomEvent('handlecount', {
                    detail: prdcount
                });
                this.dispatchEvent(productcount);
                this.showDealerFormulaConfig = false;
                this.showSelectmodalpage = true;
                this.selectedsubproducts = {};
            }
        }).catch(error => {
            // this.isLoading = false;
        }
        )
    }
    handleSelectedSubProducts(event) {
        // this.isLoading = true;
        this.showSelectmodalpage = false;
        this.selectedsubproducts = event?.detail?.selectedproducts;
        this.removedSubProducts = event?.detail?.removedproducts;
        if (event?.detail?.enableedit) {
            this.editname = "overalledit";
            this.isZone = false;
            this.enableEdit();
            this.disableSave = false;
            this.disableParent();
        }

        this.subprdlist = this.selectedsubproducts[this.productCategory];
        if (this.dataList?.length > 0) {
            this.getTempAccountsByRegion();
        } else {
            this.getAccountByRegion();
        }
    }

    getProductsAndSubCategories() {
        getProductsAndSubCategories()
            .then(result => {
                this.productsAndSubCategoriesList = result;
                this.productCategory = this.productsAndSubCategoriesList[0].Name;
                this.firstProduct = this.productsAndSubCategoriesList[0].Name;
            })
            .catch(error => {
            });
    }

    handleCloseSubProductsModal(event) {
        // this.isLoading = true;
        // const retailloading = new CustomEvent('retailloading', {
        //     detail: this.isLoading
        // });
        // this.dispatchEvent(retailloading);
        this.retailLoading = true;
        this.showSelectmodalpage = false;
        this.selectedsubproducts = null;
        this.getAccountByRegion();
        setTimeout(() => {
            this.retailLoading = false;
        }, 1000);
    }
    handleCloseModal(event) {
        this.showSelectmodalpage = false;
    }

    getTempAccountsByRegion() {
        // this.isLoading = true;
        for (let i = 0; i < this.dataList?.length; i++) {
            if (this.dataList[i].productTargetsAndAchievements && this.dataList[i].productTargetsAndAchievements.length > 0) {
                this.isExist = false;
                for (let j = 0; j < this.dataList[i].productTargetsAndAchievements.length; j++) {
                    if (this.dataList[i].productTargetsAndAchievements[j].productName == this.productCategory) {
                        this.isExist = true;
                        if (this.selectedsubproducts && this.selectedsubproducts[this.productCategory] && this.selectedsubproducts[this.productCategory].length > 0) {
                            for (let k = 0; k < this.selectedsubproducts[this.productCategory].length; k++) {
                                let isname = false;
                                for (let l = 0; l < this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement.length; l++) {
                                    if (this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement[l].subProductName == this.selectedsubproducts[this.productCategory][k].subProductName) {
                                        isname = true;
                                        break;
                                    }
                                }
                                if (!isname) {
                                    let tempsubctg = this.constructSubCategoryValues(this.selectedsubproducts[this.productCategory][k]);
                                    this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement.push(tempsubctg);
                                }
                            }
                        }

                        if (this.removedSubProducts && this.removedSubProducts[this.productCategory] && this.removedSubProducts[this.productCategory].length > 0) {
                            for (let x = 0; x < this.removedSubProducts[this.productCategory].length; x++) {
                                for (let y = 0; y < this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement.length; y++) {
                                    if (this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement[y].subProductName == this.removedSubProducts[this.productCategory][x].subProductName) {
                                        this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement.splice(y, 1);
                                        break;
                                    }
                                }
                            }
                        }

                        if (this.selectedsubproducts && this.selectedsubproducts[this.productCategory] && this.selectedsubproducts[this.productCategory].length > 0) {
                            var tempSubProduct = [];
                            for (let a = 0; a < this.selectedsubproducts[this.productCategory].length; a++) {
                                let subProduct = this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement.find(e => e.subProductName == this.selectedsubproducts[this.productCategory][a].subProductName);
                                if (subProduct) {
                                    tempSubProduct.push(subProduct);
                                }
                            }
                            this.dataList[i].productTargetsAndAchievements[j].subTargetAndAchievement = tempSubProduct;
                        }
                        break;
                    }
                }
                if (!this.isExist) {
                    var tempPush = this.constructDefaultValues(this.productCategory);
                    this.dataList[i].productTargetsAndAchievements.push(tempPush);
                }
            } else {
                data.productTargetsAndAchievements = [];
                var tempPush = this.constructDefaultValues(this.productCategory);
                this.dataList[i].productTargetsAndAchievements.push(tempPush);
            }
            for (let a = 0; a < this.dataList[i].value.length; a++) {
                if (this.dataList[i].value[a].productTargetsAndAchievements && this.dataList[i].value[a].productTargetsAndAchievements.length > 0) {
                    this.isExist = false;
                    for (let b = 0; b < this.dataList[i].value[a].productTargetsAndAchievements.length; b++) {
                        if (this.dataList[i].value[a].productTargetsAndAchievements[b].productName == this.productCategory) {
                            this.isExist = true;
                            if (this.selectedsubproducts && this.selectedsubproducts[this.productCategory] && this.selectedsubproducts[this.productCategory].length > 0) {
                                for (let c = 0; c < this.selectedsubproducts[this.productCategory].length; c++) {
                                    let isname = false;
                                    for (let d = 0; d < this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement.length; d++) {
                                        if (this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement[d].subProductName == this.selectedsubproducts[this.productCategory][c].subProductName) {
                                            isname = true;
                                            break;
                                        }
                                    }
                                    if (!isname) {
                                        let tempsubctg = this.constructSubCategoryValues(this.selectedsubproducts[this.productCategory][c]);
                                        this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement.push(tempsubctg);
                                    }
                                }
                            }
                            if (this.removedSubProducts && this.removedSubProducts[this.productCategory] && this.removedSubProducts[this.productCategory].length > 0) {
                                for (let c = 0; c < this.removedSubProducts[this.productCategory].length; c++) {
                                    let ischeck = false;
                                    for (let d = 0; d < this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement.length; d++) {
                                        if (this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement[d].subProductName == this.removedSubProducts[this.productCategory][c].subProductName) {
                                            this.tempRemovableProduct.push(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement[d].subTargetAndAchievementId);
                                            this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement.splice(d, 1);
                                            break;
                                        }
                                    }
                                }
                            }
                            if (this.selectedsubproducts && this.selectedsubproducts[this.productCategory] && this.selectedsubproducts[this.productCategory].length > 0) {
                                var tempSubProduct = [];
                                for (let k = 0; k < this.selectedsubproducts[this.productCategory].length; k++) {
                                    let subProduct = this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement.find(e => e.subProductName == this.selectedsubproducts[this.productCategory][k].subProductName);
                                    if (subProduct) {
                                        tempSubProduct.push(subProduct);
                                    }
                                }
                                this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement = tempSubProduct;
                                this.dataList[i].value[a].productTargetsAndAchievements[b].totalRetailTarget = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'subCategoryRetailTarget');
                                this.dataList[i].value[a].productTargetsAndAchievements[b].total2WDRetailPredicted = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'twoWDRetailPredicted');
                                this.dataList[i].value[a].productTargetsAndAchievements[b].total4WDRetailPredicted = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'fourWDRetailPredicted');
                                this.dataList[i].value[a].productTargetsAndAchievements[b].totalRetailPredicted = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'subCategoryRetailPredicted');

                                this.dataList[i].value[a].productTargetsAndAchievements[b].total2WDRetailAchieved = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'twoWDRetailAchieved');
                                this.dataList[i].value[a].productTargetsAndAchievements[b].total4WDRetailAchieved = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'fourWDRetailAchieved');
                                this.dataList[i].value[a].productTargetsAndAchievements[b].totalRetailAchieved = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements[b].subTargetAndAchievement, 'subCategoryRetailAchieved');
                            }
                            break;
                        }
                    }
                    this.dataList[i].value[a].totalRetailPredicted = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements, 'totalRetailPredicted');
                    this.dataList[i].value[a].totalRetailAchieved = this.calculateTotalRetailVolumeTarget(this.dataList[i].value[a].productTargetsAndAchievements, 'totalRetailAchieved');
                    if (!this.isExist) {
                        var tempPush = this.constructDefaultValues(this.productCategory);
                        this.dataList[i].value[a].productTargetsAndAchievements.push(tempPush);
                    }
                }
            }
        }
        this.handleRecordByProduct();
        this.removedSubProducts = {};
        this.dimZero();
        this.showDealerFormulaConfig = true;
        this.getZoneValues();
    }
    addOrRemoveProducts() {
        this.showSelectmodalpage = !this.showSelectmodalpage;
        if (this.showSelectmodalpage) {
            if (this.template.querySelector('c-d-i-select-sub-product')) {
                this.template.querySelector('c-d-i-select-sub-product').productCategoryList = this.productCategoryList;
                this.template.querySelector('c-d-i-select-sub-product').currenTab = this.productCategory;
                this.template.querySelector('c-d-i-select-sub-product').month = this.month;
                this.template.querySelector('c-d-i-select-sub-product').year = this.year;
            }
        }
    }

    handleKeyDown(event) {
        const key = event.key;
        if (key === 'ArrowRight') {
            this.moveFocus(event.target, 'right');
        } else if (key === 'ArrowLeft') {
            this.moveFocus(event.target, 'left');
        } else if (key === 'ArrowUp') {
            this.moveFocus(event.target, 'up');
        } else if (key === 'ArrowDown') {
            this.moveFocus(event.target, 'down');
        }
    }

    moveFocus(currentInput, direction) {
        const inputs = Array.from(this.template.querySelectorAll('lightning-input'));
        const regIndex = parseInt(currentInput.dataset.regindex, 10);
        const prodIndex = parseInt(currentInput.dataset.prodindex, 10);
        const subIndex = parseInt(currentInput.dataset.subindex, 10);
        const recordIndex = parseInt(currentInput.dataset.recordindex, 10);

        let nextInput = null;

        inputs.some(input => {
            const inputRegIndex = parseInt(input.dataset.regindex, 10);
            const inputProdIndex = parseInt(input.dataset.prodindex, 10);
            const inputSubIndex = parseInt(input.dataset.subindex, 10);
            const inputRecordIndex = parseInt(input.dataset.recordindex, 10);

            if (direction === 'right') {
                if (inputSubIndex === subIndex + 1 && inputRecordIndex === recordIndex) {
                    nextInput = input;
                    return true;
                }
            } else if (direction === 'left') {
                if (inputRegIndex === regIndex && inputProdIndex === prodIndex && inputSubIndex === subIndex - 1 && inputRecordIndex === recordIndex) {
                    nextInput = input;
                    return true;
                }
            } else if (direction === 'up') {
                if (inputRegIndex === regIndex && inputProdIndex === prodIndex && inputSubIndex === subIndex && inputRecordIndex === recordIndex - 1) {
                    nextInput = input;
                    return true;
                }
            } else if (direction === 'down') {
                if (inputRegIndex === regIndex && inputProdIndex === prodIndex && inputSubIndex === subIndex && inputRecordIndex === recordIndex + 1) {
                    nextInput = input;
                    return true;
                }
            }
            return false;
        });

        if (nextInput) {
            nextInput.focus();
        }
    }
    getProductAndSubCategory() {
        getProductAndSubProducts({}).then(result => {
            if (result) {
                this.productList = Object.keys(result);
                this.productCategoryList = result;
            }
        })
            .catch(error => {
            })
    }

    @api handleRow(productName, prodAndSubCategory) {
        this.retailLoading = true;

        this.hasCalledGetZoneValues = false;
        this.deselectclone();
        this.dimZero();
        this.currentproduct = productName;
        this.productCategory = productName;
        this.isTHProduct = this.productCategory === 'TH';
        this.productCategoryList = prodAndSubCategory;
        this.subCategoryList = this.productCategoryList[this.productCategory].subCategoryList;

        let product = this.productCategoryList[this.productCategory];
        let productfilter = [];

        if (this.dataList[0] && this.dataList[0].value && this.dataList[0].value.length > 0) {
            productfilter = this.dataList[0].value[0].productTargetsAndAchievements.find(x => x.productName === product.name);

            if (!productfilter) {
                this.showSelectmodalpage = true;
                this.isContain = false;

                if (this.showSelectmodalpage && this.template.querySelector('c-d-i-select-sub-product')) {
                    let subProductComponent = this.template.querySelector('c-d-i-select-sub-product');
                    subProductComponent.month = this.month;
                    subProductComponent.year = this.year;
                    subProductComponent.productCategoryList = this.productCategoryList;
                    subProductComponent.currenTab = this.productCategory;
                    subProductComponent.isSelect = true;
                    subProductComponent.selectedproducts = this.selectedsubproducts;
                } else {
                    this.retailLoading = true;
                    setTimeout(() => {
                        this.retailLoading = false;
                    }, 1000);
                }
            } else {
                this.getTempAccountsByRegion();
                this.subprdlist = this.selectedsubproducts ? this.selectedsubproducts[this.productCategory] : [];
                this.isContain = true;
            }

            this.getZoneValues();
        } else {
            this.showDealerFormulaConfig = false;
            this.showSelectmodalpage = true;
            this.isContain = false;

            if (this.showSelectmodalpage && this.template.querySelector('c-d-i-select-sub-product')) {
                let subProductComponent = this.template.querySelector('c-d-i-select-sub-product');
                subProductComponent.month = this.month;
                subProductComponent.year = this.year;
                subProductComponent.productCategoryList = this.productCategoryList;
                subProductComponent.currenTab = this.productCategory;
                subProductComponent.isSelect = true;
                subProductComponent.selectedproducts = this.selectedsubproducts;
            }
        }

        this.alertonoff = false;

        // Preserve `isEdited` and `showfooter` during toggling if values were uploaded from Excel
        if (this.disableSave !== true) {
            this.isEdited = true; // Ensure editing state remains active
            this.showfooter = true; // Keep Save and Cancel options visible
        } else {
            this.isEdited = false;
            this.showfooter = false;
        }

        setTimeout(() => {
            this.retailLoading = false;
        }, 1000);
    }


    handleClick(event) {
        this.tabName = event.target.value;
        this.isDealerTab = this.tabName == 'dealer';
        this.isZoneTab = this.tabName == 'zone';
    }

    handleInputChange(event) {
        var expression = new RegExp('^[0-9]+$');
        if (event.target.value == null || event.target.value == '') { event.target.value = 0; }
        var zoneIndex = event.target.dataset.regindex;
        var recordIndex = event.target.dataset.recordindex;
        var prodIndex = event.target.dataset.prodindex;
        var name = event.target.name;
        var prodRecord = this.dataList[zoneIndex].value[recordIndex].productTargetsAndAchievements[prodIndex];
        prodRecord = this.validateVolumeTarget(event, prodRecord);
        this.disableSave = false;
        const zerovalue = event.target;
        zerovalue.value == 0 ? zerovalue.classList.add('dimZero') : zerovalue.classList.remove('dimZero');

        if (name == 'demoTarget') {
            if (prodRecord.demoTarget != prodRecord.oldDemoTarget) {
                prodRecord.demoOverRide = true;
            } else if (prodRecord.demoTarget == prodRecord.oldDemoTarget && prodRecord.demoOverRide) {
                prodRecord.demoOverRide = false;
            }
        } else {
            this.dataList[zoneIndex].value[recordIndex].productTargetsAndAchievements[prodIndex].subTargetAndAchievement.forEach(subTarget => {
                if (subTarget.subCategoryRetailTarget != subTarget.oldRetailTarget) {
                    subTarget.targetOverRide = true;
                    this.hasCalledGetZoneValues = false;
                } else if (subTarget.subCategoryRetailTarget == subTarget.oldRetailTarget && subTarget.targetOverRide) {
                    subTarget.targetOverRide = false;
                }
                return subTarget;
            });
        }
        this.dataList[zoneIndex].value[recordIndex].productTargetsAndAchievements[prodIndex] = prodRecord;
        this.dimZero();
        this.negativeAndBlankCheck();
        this.showfooter = true;
        this.disableParent();
    }

    handleInput(event) {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }

    handleKeyPress(event) {
        if (event.key.match(/[^0-9]/)) {
            event.preventDefault();
        }
    }

    handlePaste(event) {
        const clipboardData = (event.clipboardData || window.clipboardData)?.getData('text');
        if (clipboardData?.match(/[^0-9]/)) {
            event.preventDefault();
        }
    }


    handleVolumeChange(event) {
        var demoname = event.target.name;
        var zoneIndex = event.target.dataset.regindex;
        var recordIndex = event.target.dataset.recordindex;
        var prodIndex = event.target.dataset.prodindex;
        var prodId = event.target.dataset.prodid;
        var prodRecord = this.dataList[zoneIndex].productTargetsAndAchievements[prodIndex];
        this.dataList[zoneIndex].productTargetsAndAchievements[prodIndex] = this.validateVolumeTarget(event, prodRecord);
        this.applyValuesToDealers(zoneIndex, prodId, prodRecord, demoname);
        this.disableSave = false;
        const zerovalue = event.target;
        zerovalue.value == 0 ? zerovalue.classList.add('dimZero') : zerovalue.classList.remove('dimZero');
        this.negativeAndBlankCheck();
    }

    applyValuesToDealers(zoneIndex, prodId, prodRecord, demoname) {
        let recordList = this.dataList[zoneIndex].value;
        for (let i = 0; i < recordList.length; i++) {
            let prodTarget;
            let index;
            for (let j = 0; j < recordList[i].productTargetsAndAchievements.length; j++) {
                if (recordList[i].productTargetsAndAchievements[j].productId == prodId) {
                    prodTarget = recordList[i].productTargetsAndAchievements[j];
                    index = j;
                    break;
                }
            }
            if (prodTarget) {
                if (demoname == 'demoTarget') {
                    prodTarget.demoTarget = prodRecord.demoTarget;
                    if (prodTarget.demoTarget != prodTarget.oldDemoTarget) {
                        prodTarget.demoOverRide = true;
                    } else if (prodTarget.demoTarget == prodTarget.oldDemoTarget && prodTarget.demoOverRide) {
                        prodTarget.demoOverRide = false;
                    }
                } else {
                    for (let j = 0; j < prodTarget.subTargetAndAchievement.length; j++) {
                        let subctg = prodTarget.subTargetAndAchievement[j];
                        let subRecord = prodRecord.subTargetAndAchievement.find((sub) => sub.subProductId == subctg.subProductId);
                        if (subRecord) {
                            subctg.subCategoryRetailTarget = subRecord.subCategoryRetailTarget;
                        }
                        if (subctg.subCategoryRetailTarget != subctg.oldRetailTarget) {
                            subctg.targetOverRide = true;

                        } else if (subctg.subCategoryRetailTarget == subctg.oldRetailTarget && subctg.targetOverRide) {
                            subctg.targetOverRide = false;
                        }
                        prodTarget.subTargetAndAchievement[j] = subctg;
                    }

                    prodTarget.totalRetailTarget = prodRecord.totalRetailTarget;
                }
                recordList[i].productTargetsAndAchievements[index] = prodTarget;
            }
        }
        this.dataList[zoneIndex].value = recordList;
    }

    validateVolumeTarget(event, prodRecord) {
        var subIndex = event.target.dataset.subindex;
        var name = event.target.name;
        var expression = new RegExp('^[0-9]+$');
        if (expression.test(event.target.value)) {
            if (name == 'demoTarget') {
                prodRecord.demoTarget = parseInt(event.target.value);
            } else {
                prodRecord.subTargetAndAchievement[subIndex].subCategoryRetailTarget = parseInt(event.target.value);
                prodRecord.totalRetailTarget = this.calculateTotalRetailVolumeTarget(prodRecord.subTargetAndAchievement, 'subCategoryRetailTarget');
            }
            event.target.value = parseInt(event.target.value);
        } else {
            if (name == 'demoTarget') {
                prodRecord.demoTarget = '';
            } else {
                prodRecord.subTargetAndAchievement[subIndex].subCategoryRetailTarget = '';
            }
            event.target.value = '';
            prodRecord.totalRetailTarget = this.calculateTotalRetailVolumeTarget(prodRecord.subTargetAndAchievement, 'subCategoryRetailTarget');

        }
        return prodRecord;
    }

    validateTarget(value) {
        var expression = new RegExp('^[0-9]+$');
        if (expression.test(value)) {
            return parseInt(value);
        }
        else {
            prodRecord.totalRetailTarget = this.calculateTotalRetailVolumeTarget(prodRecord.subTargetAndAchievement, 'subCategoryRetailTarget');
        }
        return prodRecord;
    }

    calculateTotalRetailVolumeTarget(subTargets, propertyName) {
        var totalVolumeTarget = 0;
        for (var i = 0; i < subTargets.length; i++) {
            let subTarget = subTargets[i];
            if (subTarget[propertyName]) {
                totalVolumeTarget = totalVolumeTarget + parseInt(subTarget[propertyName]);
            }
        }
        return totalVolumeTarget;
    }

    calculateRegionTotalTarget() {
        for (var i = 0; i < this.dataList.length; i++) {
            var totalTargets = { productTargetsAndAchievements: [] };
            var recordList = this.dataList[i].value;
            for (var j = 0; j < recordList.length; j++) {
                var record = recordList[j];
                for (var k = 0; k < record.productTargetsAndAchievements.length; k++) {
                    var product = record.productTargetsAndAchievements[k];
                    if (!(totalTargets.productTargetsAndAchievements && totalTargets.productTargetsAndAchievements[k])) {
                        totalTargets.productTargetsAndAchievements.push(product);
                    }
                    for (var l = 0; l < product.subTargetAndAchievement.length; l++) {
                        var subProduct = product.subTargetAndAchievement[l];
                        if (!(totalTargets.productTargetsAndAchievements[k].subTargetAndAchievement && totalTargets.productTargetsAndAchievements[k].subTargetAndAchievement[l])) {
                            totalTargets.productTargetsAndAchievements[k].subTargetAndAchievement.push(subProduct);
                        } else {
                            var subCategoryRetailTarget = totalTargets.productTargetsAndAchievements[k].subTargetAndAchievement[l].subCategoryRetailTarget;
                            totalTargets.productTargetsAndAchievements[k].subTargetAndAchievement[l].subCategoryRetailTarget += subProduct.subCategoryRetailTarget;
                        }
                        var subTargetAndAchievement = subProduct;
                        if (totalTargets.length && totalTargets[i]) {
                            totalTargets[k].subTargets
                        } else {
                            totalTargets[j].totalTarget.ProductId = product.ProductId;
                            totalTargets.productName = product.productName;
                            totalTargets.subTargets = [{ key: subProduct.subProductName, value: subProduct.subCategoryRetailTarget }];
                        }

                    }
                }
            }
            this.dataList[i].totalTargets = totalTargets;
        }
    }

    handleSave() {
        this.retailLoading = true;
        this.rejoinAllRecords(); // Ensures all products and subcategories are joined
        this.negativeAndBlankCheck();
        const countNgtEmpties = this.negativeAndBlankCheck();

        if (countNgtEmpties == 0) {
            saveDealerFormula({ dealerIncentiveWraps: this.allList, removableId: this.tempRemovableProduct }).then(res => {
                if (res.message == "SUCCESS") {
                    this.oldDealerIds = res.oldDealerIds;
                    if (res?.demoDealerIds?.length > 0) {
                        this.updateDemoConducted(res.newDealerIds);
                    } else if (res?.newDealerIds?.length > 0) {
                        this.updateActualForAllDealers(res.newDealerIds, false);
                    } else if (res?.oldDealerIds?.length > 0) {
                        this.getTargetsAndPayouts();
                    }
                    this.hideFooter();
                    this.tempRemovableProduct = [];
                    this.getAccountByRegion();
                    this.hasCalledGetZoneValues = false;
                    this.dimZero();
                    this.askConfirmation = false;
                    this.isFromExcel = false;
                    this.showfooter = false;
                    this.disableSave = true;
                    this.isEdited = false;
                    this.isContain = true;

                    setTimeout(() => {
                        this.disableParent();
                        // Updated toast message
                        let title = `Retail Targets for All Products in ${this.month} ${this.year} Have Been Successfully Set!`;
                        this.toast(title, 'success');
                        this.retailLoading = false;
                    }, 3000);
                }
            }).catch(error => {
                // Error handling
                let title = `An Error Occurred While Saving Retail Targets.`;
                this.toast(title, 'error');
            });
        } else {
            let title = `Please Ensure All Retail Targets Are Filled Out Correctly Before Saving.`;
            this.toast(title, 'error');
        }
    }

    // getOppsAndOrders(dealerIds) {
    //     this.isLoading = true;
    //     getOppsAndOrders({ dealerIds: dealerIds, month: this.month, year: this.year ,productCategory : this.productCategory}).then(res => {
    //         if (res.dealerList && res.dealerList.length > 0) {
    //             let updatedList = updateActualRetail(res);
    //             if (updatedList.kpiAchievements.length > 0 || updatedList.subTargetList.length > 0 || updatedList.productList.length > 0 || updatedList.dealerList.length > 0) {
    //                 this.saveKPIAchievements(updatedList);
    //             }
    //         }
    //     }).catch(error => {
    //         console.error(' get opps and orders error --- ', error);
    //         if (this.oldDealerIds?.length > 0) {
    //             this.getTargetsAndPayouts();
    //         } else {
    //             this.isLoading = false;
    //         }
    //     })
    // }

    updateDemoConducted(dealerIds) {
        this.isLoading = true;
        getDemoConducted({ month: this.month, year: this.year }).then(result => {
            if (result == 'SUCCESS') {
                this.updateActualForAllDealers(dealerIds, true);
            }
        }).catch(error => {
            console.error('Error : ', error);
            this.updateActualForAllDealers(dealerIds, true);
        })
    }

    updateActualForAllDealers(dealerIds, isDemo) {
        updateActualForAllDealers({ dealerIds: dealerIds, month: this.month, year: this.year, productCategory: this.productCategory }).then(res => {
            // if (res.dealerList && res.dealerList.length > 0) {
            //     let updatedList = updateActualRetail(res);
            //     if (updatedList.kpiAchievements.length > 0 || updatedList.subTargetList.length > 0 || updatedList.productList.length > 0 || updatedList.dealerList.length > 0) {
            //         this.saveKPIAchievements(updatedList);
            //     }
            // }
            if (res == 'SUCCESS') {
                let title = `"${this.productCategory}" Product Actual Retail Targets in ${this.month} ${this.year} Has Been Successfully Saved !!`;
                this.toast(title, 'success');
                // if(isDemo){
                //     this.getTargetsAndPayouts();
                // }
            }
        }).catch(error => {
            console.error(' get opps and orders error --- ', error);
            if (this.oldDealerIds?.length > 0) {
                this.getTargetsAndPayouts();
            } else {
                // this.isLoading = false;
            }
        })
    }

    saveKPIAchievements(updatedList) {
        saveKpiPayouts({ kpiAchievements: updatedList.kpiAchievements, subTargets: updatedList.subTargetList, productTargets: updatedList.productList, dealerIncentives: updatedList.dealerList }).then(res => {
            let title = `"${this.productCategory}" Product Actual Retail Targets in ${this.month} ${this.year} Has Been Successfully Saved !!`;
            this.toast(title, 'success');
            this.getTargetsAndPayouts();
        }).catch(error => {
            console.error('Update Actual Retails error ', error);
            if (this.oldDealerIds?.length > 0) {
                this.getTargetsAndPayouts();
            } else {
                // this.isLoading = false;
            }
        })
    }

    // getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     getTargetsAndPayouts({ month: this.month, year: this.year, dealerIds: dealerIds, isActual: false }).then(res => {
    //         getDealerTargetsAndPayouts(res);
    //         this.oldDealerIds = [];
    //         this.isLoading = false;
    //     }).catch(error => {
    //         this.oldDealerIds = [];
    //         console.error('get targets error ====    ', error);
    //         this.isLoading = false;
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
                this.oldDealerIds = [];
                if (message === 'SUCCESS') {
                    this.recalculateLoading = false;
                    this.toast('New configurations have been saved, and the payouts have been recalculated successfully!.', 'success');
                } else {
                    this.recalculateLoading = false;
                    this.toast('An error occurred while recalculating the payouts.', 'error');
                    console.log('ERROR: ', message);
                }
            } else {
                this.recalculateLoading = false;
            }
        } catch (error) {
            console.error('get targets error:', error);
            this.oldDealerIds = [];
            this.recalculateLoading = false;
            this.toast('An error occurred while fetching targets.', 'error');
        }
    }

    setPresentProductTab() {

    }

    rejoinAllRecords() {
        this.allList = [];
        for (let i = 0; i < this.dataList.length; i++) {
            let recordList = this.dataList[i].value;
            this.allList = [...this.allList, ...recordList];
        }
        // Remove the filtering logic, so all subcategories remain intact
        this.allList.forEach(dealer => {
            dealer.productTargetsAndAchievements = [...dealer.productTargetsAndAchievements];
        });
    }

    cloneFormula(event) {
        this.dealerOptions = Object.assign([], this.allDealerOptions);
        this.zoneOptions = Object.assign([], this.allZoneOptions);
        this.cloneRegIndex = event.target.dataset.regindex;
        this.cloneRecIndex = event.target.dataset.recordindex;
        this.cloneProdIndex = event.target.dataset.prodindex;
        this.cloneName = event.target.name;
        this.cloneMsg = '';
        let cloneRecords = this.dataList[this.cloneRegIndex].value;
        let subRecords;
        if (this.cloneName == 'zoneRowClone') {
            subRecords = this.dataList[this.cloneRegIndex].productTargetsAndAchievements[this.cloneProdIndex].subTargetAndAchievement;
        } else if (this.cloneName == 'dealerRowClone') {
            let prodRecords = cloneRecords[this.cloneRecIndex].productTargetsAndAchievements;
            subRecords = prodRecords[this.cloneProdIndex].subTargetAndAchievement;
        }
        if (this.cloneName == 'cellClone') {
            this.cloneSubIndex = event.target.dataset.subindex;
            for (var i = this.startIndex; i <= this.endIndex; i++) {
                this.cloneMsg = i == 0 ? this.cloneMsg + subRecords[i].subProductName : this.cloneMsg + ', ' + subRecords[i].subProductName;
            }
            this.cloneMsg = this.cloneMsg + ' in ' + cloneRecords[this.cloneRecIndex].dealerName;
        } else {
            for (var k = 0; k < subRecords.length; k++) {
                this.cloneMsg = k == 0 ? this.cloneMsg + subRecords[k].subProductName : this.cloneMsg + ', ' + subRecords[k].subProductName;
            }
            if (this.cloneName == 'dealerRowClone') {
                this.cloneMsg = this.cloneMsg + ' in ' + cloneRecords[this.cloneRecIndex].dealerName;
                for (let j = 0; j < this.dealerOptions.length; j++) {
                    if (this.dealerOptions[j].value == cloneRecords[this.cloneRecIndex].dealerId) {
                        this.dealerOptions.splice(j, 1);
                        break;
                    }
                }
            } else {
                this.cloneMsg = this.cloneMsg + ' in ' + this.dataList[this.cloneRegIndex].key + ' Zone';
                for (let j = 0; j < this.zoneOptions.length; j++) {
                    if (this.zoneOptions[j].value == this.dataList[this.cloneRegIndex].key) {
                        this.zoneOptions.splice(j, 1);
                        break;
                    }
                }
            }
        }
        this.withOutSelectedDealers = Object.assign([], this.dealerOptions);
        this.withOutSelectedZone = Object.assign([], this.zoneOptions);
        this.isClone = true;
    }

    closeModal(event) {
        var name = event.target.name;
        if (name == 'clone') {
            this.isClone = false;
            this.dealerId = [];
            this.zoneNames = [];
        } else if (name == 'import') {
            this.showImport = false;
            this.showImport = false;
            this.fileData = {};
            this.disableImport = true;
        } else if (name == 'alert') {
            this.showAlert = false;
        }
    }

    closeImportModal() {
        this.showImport = false;
    }

    handleChange(event) {
        let value = event.detail.value;
        let name = event.target.name;
        if (name == 'All Dealer') {
            this.dealerId = [];
            if (event.target.checked) {
                for (var i = 0; i < this.dealerOptions.length; i++) {
                    this.dealerId.push(this.dealerOptions[i].value);
                }
            }
        } else if (name == 'All Zone') {
            this.zoneNames = [];
            if (event.target.checked) {
                for (var j = 0; j < this.zoneOptions.length; j++) {
                    this.zoneNames.push(this.zoneOptions[j].value);
                }
            }
        } else if (name == 'dealer') {
            this.dealerId = value;
        } else if (name == 'zone') {
            this.zoneNames = value;
        }
        this.disableApplyBtn = !(this.dealerId.length > 0 || this.zoneNames.length > 0);
    }

    applyToDealers() {
        this.disableSave = false;
        var cloneRecords = this.dataList[this.cloneRegIndex].value;
        var record = cloneRecords[this.cloneRecIndex];
        this.deselectclone();
        for (var i = 0; i < this.dataList.length; i++) {
            var recordList = this.dataList[i].value;
            if (this.cloneName == 'dealerRowClone') {
                for (var rec = 0; rec < recordList.length; rec++) {
                    if (this.zoneNames.includes(this.dataList[i].key)) {
                        this.assignValuesToDealer(recordList, record, rec);
                    } else if (this.dealerId.includes(recordList[rec].dealerId)) {
                        this.assignValuesToDealer(recordList, record, rec);
                    }
                }
                this.hideCloneBtn();
            }
            else if (this.cloneName == 'zoneRowClone') {
                if (this.zoneNames.includes(this.dataList[i].key)) {
                    this.dataList[i].productTargetsAndAchievements = this.dataList[this.cloneRegIndex].productTargetsAndAchievements;
                    for (var r = 0; r < recordList.length; r++) {
                        this.assignValuesToDealer(recordList, this.dataList[this.cloneRegIndex], r);
                    }
                }
                this.disableClone();
            }
            this.dataList[i].value = recordList;
        }
        this.toast(`Values Cloned Successfully !!!`, 'success');
        this.dealerId = [];
        this.zoneNames = [];
        this.isClone = false;
        this.hasCalledGetZoneValues = false;
        this.showfooter = true;
        this.disableParent();
        this.disableApplyBtn = true;
    }

    assignValuesToDealer(recordList, record, index) {
        var recprod = recordList[index].productTargetsAndAchievements[this.cloneProdIndex];
        if (this.cloneName == 'dealerRowClone' || this.cloneName == 'zoneRowClone') {

            var recsubprod = record.productTargetsAndAchievements[this.cloneProdIndex];
            recprod.totalRetailTarget = record.productTargetsAndAchievements[this.cloneProdIndex].totalRetailTarget;

            recsubprod.subTargetAndAchievement.forEach(sub => {
                recprod.subTargetAndAchievement.find(subItem => subItem.subProductId == sub.subProductId).subCategoryRetailTarget = sub.subCategoryRetailTarget;
            });
            for (let recprd = 0; recprd < recprod.subTargetAndAchievement.length; recprd++) {
                if (recprod.subTargetAndAchievement[recprd].subCategoryRetailTarget == recprod.subTargetAndAchievement[recprd].oldRetailTarget && recprod.subTargetAndAchievement[recprd].targetOverRide) {
                    recprod.subTargetAndAchievement[recprd].targetOverRide = false;
                }
                else if (recprod.subTargetAndAchievement[recprd].subCategoryRetailTarget != recprod.subTargetAndAchievement[recprd].oldRetailTarget) {
                    recprod.subTargetAndAchievement[recprd].targetOverRide = true;
                }
            }
            recprod.demoTarget = recsubprod.demoTarget;
            if (recprod.demoTarget == recprod.oldDemoTarget && recprod.demoOverRide) {
                recprod.demoOverRide = false;
            }
            else if (recprod.demoTarget != recprod.oldDemoTarget) {
                recprod.demoOverRide = true;
            }
            recordList[index].productTargetsAndAchievements[this.cloneProdIndex] = recprod;
        } else {
            for (var s = this.startIndex; s <= this.endIndex; s++) {
                recordList[index].productTargetsAndAchievements[this.cloneProdIndex].subTargetAndAchievement[s] = record.productTargetsAndAchievements[this.cloneProdIndex].subTargetAndAchievement[s];
            }
        }
    }

    handleEventChange(event) {
        this.showDealerCard = event.detail.value;
        this.month = event.detail.month;
        this.year = event.detail.year;
    }

    hasCalledGetZoneValues = false;
    handleTab(event) {
        this.dataList = this.tempDataList;
        if (!this.hasCalledGetZoneValues) {
            this.getZoneValues();
            this.hasCalledGetZoneValues = true;
        }
        var title = event.currentTarget.title;
        this.isZone = title == 'zone';
        this.dealerClass = this.isZone ? 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name' : 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name tab-border';
        this.zoneClass = this.isZone ? 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name tab-border' : 'slds-p-left_small slds-p-top_small slds-p-right_small tab-name';
        if (!this.isZone) {
            this.alertonoff = false;
        }
        this.hideFooter();
        this.dimZero();
        this.showfooter = false;
        this.negativeAndBlankCheck();
    }

    getZoneValues() {
        this.selectedproduct = { demoTarget: 0, totalRetailTarget: 0, subTargetAndAchievement: [] };
        // this.isLoading = true;
        this.totalsubtgt = new Map();
        this.dataList.forEach((ele, ind) => {
            ele.value.forEach((dealer, index) => {
                dealer.productTargetsAndAchievements.forEach((prod) => {
                    var product = ele.productTargetsAndAchievements.find((pr) => pr.productId == prod.productId);
                    if (product) {
                        var count = 0;
                        product.totalRetailTarget = index == 0 ? 0 : (parseInt(product?.totalRetailTarget) || 0);
                        if (product.productName == 'TH') {
                            if (index == 0) {
                                product.demoTarget = 0;
                            }
                            product.demoTarget += (parseInt(prod?.demoTarget) || 0);
                        }
                        product.subTargetAndAchievement.forEach((sub) => {
                            if (index == 0) {
                                sub.subCategoryRetailTarget = 0;
                            }
                            var subTarget = prod.subTargetAndAchievement.find((sb) => sub.subProductId == sb.subProductId);
                            sub.subCategoryRetailTarget = parseInt(sub?.subCategoryRetailTarget) + subTarget?.subCategoryRetailTarget;
                            product.totalRetailTarget = (parseInt(subTarget?.subCategoryRetailTarget) || 0) + (parseInt(product?.totalRetailTarget) || 0);
                            return sub;
                        })
                    }

                })
            })
            ele.productTargetsAndAchievements.forEach((product) => {
                let tempSub;
                if (this.totalsubtgt) {
                    tempSub = this.totalsubtgt.get(product.productName);
                }
                if (tempSub) {
                    tempSub.totalRetailTarget += (parseInt(product?.totalRetailTarget) || 0);
                    product.subTargetAndAchievement.forEach((sub) => {
                        for (let i = 0; i < tempSub.subTargetAndAchievement.length; i++) {
                            if (sub.subProductId == tempSub.subTargetAndAchievement[i].subProductId) {
                                tempSub.subTargetAndAchievement[i].subCategoryRetailTarget += sub.subCategoryRetailTarget;
                            }
                        }
                    })
                    if (product.productName == 'TH') {
                        tempSub.demoTarget += (parseInt(product?.demoTarget) || 0);
                    }
                    this.totalsubtgt.set(product.productName, tempSub);
                }
                else {
                    tempSub = { productName: product.productName, totalRetailTarget: product.totalRetailTarget, subTargetAndAchievement: [] };
                    if (product.productName == 'TH') {
                        tempSub.demoTarget = parseInt(product?.demoTarget) || 0;
                    }
                    tempSub.subTargetAndAchievement = JSON.parse(JSON.stringify(product.subTargetAndAchievement));
                    this.totalsubtgt.set(product.productName, tempSub);
                }
            })
        })
        if (this.totalsubtgt?.get(this.productCategory)) {
            this.selectedproduct = this.totalsubtgt.get(this.productCategory);
        } else {
            this.selectedproduct = { demoTarget: 0, totalRetailTarget: 0, subTargetAndAchievement: [] };
        }
        this.endTime = performance.now();
        this.totalRetailLoadingTime = this.endTime - this.startTime;
        this.createExcelFormat();
        this.dimZero();
        // this.isLoading = false;

        // const retailloading = new CustomEvent('retailloading', {
        //     detail: this.isLoading
        // });
        // this.dispatchEvent(retailloading);
    }

    createExcelFormat(productCategory) {
        const excelFormat = [];
        // Iterate over each dealer and prepare the base structure
        this.dealerRecords?.forEach((dealer, index) => {
            let format = {};
            format['S.No'] = index + 1;
            format['Id'] = dealer.Id;
            format['Dealer Name'] = dealer.Name;

            // Add 'Demo Target' column if product is 'TH'
            if (productCategory === 'TH') {
                format['Demo Target'] = 0;
            }

            // Add subcategory columns for the product and initialize them to 0
            this.productsAndSubCategoriesList
                .filter(prod => prod.Name === productCategory)
                .flatMap(prod => prod.DI_Product_Sub_Categories__r)
                .sort((a, b) => a.Name.localeCompare(b.Name))
                .forEach(sub => {
                    format[sub.Name] = 0;
                });

            excelFormat.push(format);
        });

        // Populate data from dataList
        this.dataList.forEach(zone => {
            zone.value.forEach(dealer => {
                dealer.productTargetsAndAchievements
                    .filter(prdtrgt => prdtrgt.productName === productCategory)
                    .forEach(sub => {
                        if (productCategory === 'TH') {
                            const filteredTHDealer = excelFormat.find(dlr => dlr.Id === dealer?.dealerId);
                            if (filteredTHDealer) {
                                filteredTHDealer['Demo Target'] = parseInt(sub?.demoTarget) || 0;
                            }
                        }
                        sub.subTargetAndAchievement.forEach(subname => {
                            const filteredDealer = excelFormat.find(dlr => dlr.Id === dealer?.dealerId);
                            if (filteredDealer && subname?.subProductName) {
                                filteredDealer[subname?.subProductName] = parseInt(subname?.subCategoryRetailTarget) || 0;
                            }
                        });
                    });
            });
        });

        return excelFormat;
    }

    hideFooter() {
        if (this.editname == 'overalledit') {
            this.isEdited = false;
        } else if (this.editname == 'dealerrowedit') {
            if (this.checkedit && Object.keys(this.checkedit).length > 0) {
                let regionindex = Object.keys(this.checkedit)[0];
                let recordindex = this.checkedit[regionindex];
                this.dataList[regionindex].value[recordindex].isEdited = false;
                this.checkedit = {};
            }
        } else if (this.editname == 'zonerowedit') {
            if (this.checkedit && Object.keys(this.checkedit).length > 0) {
                let regionindex = Object.keys(this.checkedit)[0];
                let recordindex = this.checkedit[regionindex];
                this.dataList[regionindex].isEdited = false;
                this.checkedit = {};
                this.showfooter = false;
                this.disableSave = true;
            }
        }
    }

    @api getAccountByRegion() {
        getAccountByRegion({ month: this.month, year: parseInt(this.year) }).then(res => {
            this.dealersByZone = res.accountMap;
            this.dataList = [];
            this.constructTableData();
            const productcount = new CustomEvent('handlecount', {
                detail: res.productCount
            });
            this.dispatchEvent(productcount);
            let len = this.dataList.length;
            console.log('dataList length ****   ', len);
            this.showDealerFormulaConfig = true;
            console.log('dataList length ****   ', this.dataList.length);
        }).catch(error => {
            // this.isLoading = false;
        })
    }

    dimZero() {
        const formattedNumbers = this.template.querySelectorAll('lightning-formatted-number');
        formattedNumbers.forEach(formatted => {
            if (formatted.value === '0' || formatted.value === 0) {
                formatted.classList.add('dimZero');
            } else {
                formatted.classList.remove('dimZero');
            }
        });
        const inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(input => {
            if (input.value === '0' || input.value === 0) {
                input.classList.add('dimZero');
            } else {
                input.classList.remove('dimZero');
            }
        });
    }

    negativeAndBlankCheck() {
        let tempcount = 0;
        const inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(input => {
            if (input.value === '' || input.value === null) {
                input.value = 0;
            }
            else if (input.value < 0) {
                input.parentElement.classList.add('formattedHighlightNegative');
                tempcount++;
            }
            else {
                input.parentElement.classList.remove('highlightNull', 'formattedHighlightNegative');
            }
        });

        const formattedNumbers = this.template.querySelectorAll('lightning-formatted-number');
        formattedNumbers.forEach(input => {
            if (input.value === '' || input.value === null) {
                input.value = 0;
            }
            else if (input.value < 0) {
                input.parentElement.classList.add('formattedHighlightNegative');
                tempcount++;
            }
            else {
                input.parentElement.classList.remove('formattedHighlightNegative', 'highlightNull');
            }
        });
        return tempcount;
    }

    @api handleRecordByProduct() {
        if (this.productCategory == 'TH') {
            this.isTHProduct = true;
        } else {
            this.isTHProduct = false;
        }
        if (this.dataList && this.dataList.length > 0) {
            for (var i = 0; i < this.dataList.length; i++) {
                var recordList = this.dataList[i].value;
                if (recordList && recordList.length > 0) {
                    for (var j = 0; j < recordList.length; j++) {
                        for (var k = 0; k < recordList[j].productTargetsAndAchievements.length; k++) {
                            var product = recordList[j].productTargetsAndAchievements[k];
                            product = this.setVisibility(product);
                            recordList[j].productTargetsAndAchievements[k] = product;
                        }
                    }
                }
                if (this.dataList[i].productTargetsAndAchievements && this.dataList[i].productTargetsAndAchievements.length > 0) {
                    for (var m = 0; m < this.dataList[i].productTargetsAndAchievements.length; m++) {
                        var product = this.dataList[i].productTargetsAndAchievements[m];
                        product = this.setVisibility(product);
                        this.dataList[i].productTargetsAndAchievements[m] = product;
                    }
                }
                this.dataList[i].value = recordList;
            }
        }
    }

    setVisibility(product) {
        if (product.productName == this.productCategory) {
            product.isVisible = true;
        } else {
            product.isVisible = false;
        }
        return product;
    }

    getsubprd() {
        this.selectedsubproducts = {};
        let zonename = Object.keys(this.dealersByZone)[0];
        let dealers = this.dealersByZone[zonename];
        for (var i = 0; i < dealers[0].productTargetsAndAchievements?.length; i++) {
            let subprd = dealers[0].productTargetsAndAchievements[i].subTargetAndAchievement;
            let subprod = [];
            for (var j = 0; j < subprd.length; j++) {
                subprod.push({ subProductId: subprd[j].subProductId, subProductName: subprd[j].subProductName });
            }
            this.selectedsubproducts[dealers[0].productTargetsAndAchievements[i].productName] = subprod;
        }
        this.subprdlist = this.selectedsubproducts[this.productCategory];


    }
    constructTableData() {
        this.allDealerOptions = [];
        this.allZoneOptions = [];
        this.dataList = [];
        let zonename = Object.keys(this.dealersByZone)[0];
        let dealer = this.dealersByZone[zonename];
        if (!this.selectedsubproducts) {
            this.getsubprd();
        }
        else if (this.selectedsubproducts && this.isContain) {
            this.getsubprd();
        }
        for (const key in this.dealersByZone) {
            var dealers = this.dealersByZone[key];
            var dataList = [];
            var regSubTargets = [];
            var regSubTargetObj = {};
            for (var i = 0; i < dealers.length; i++) {
                var data = {};
                data = dealers[i];
                if (dealers[i] && dealers[i].productTargetsAndAchievements && dealers[i].productTargetsAndAchievements.length > 0) {
                    this.constructTempTableData(data);
                } else {
                    data.month = this.month;
                    data.year = this.year;
                    data.productTargetsAndAchievements = [];

                    data.productTargetsAndAchievements.push(this.constructDefaultValues(this.productCategory));
                }
                data.isEdited = false;
                dataList.push(data);
                this.allDealerOptions.push({ label: dealers[i].dealerName, value: dealers[i].dealerId });
            }
            var regObj = { key, value: dataList, iconName: 'utility:down', isExpand: !this.isZone, isEdited: false, productTargetsAndAchievements: [] };
            regObj.productTargetsAndAchievements.push(this.constructDefaultValues(this.productCategory));
            this.dataList.push(regObj);
            this.allZoneOptions.push({ label: key, value: key });
        }
        this.tempDataList = JSON.parse(JSON.stringify(this.dataList));
        this.getZoneValues();
    }
    constructSubCategoryValues(subctg) {
        return { subProductName: subctg.subProductName, subProductId: subctg.subProductId, subCategoryRetailTarget: 0 };
    }

    constructTempTableData(data) {
        var isExist = false;
        if (data.productTargetsAndAchievements && data.productTargetsAndAchievements.length > 0) {
            for (var k = 0; k < data.productTargetsAndAchievements.length; k++) {
                if (!isExist) {
                    if (data.productTargetsAndAchievements[k].productName == this.productCategory) {
                        data.productTargetsAndAchievements[k].isVisible = true;
                    } else {
                        data.productTargetsAndAchievements[k].isVisible = false;
                    }
                    data.productTargetsAndAchievements[k].isTHCategory = data.productTargetsAndAchievements[k].productName == 'TH';
                    if (this.productCategory == data.productTargetsAndAchievements[k].productName) {
                        isExist = true;
                        let subprdt = this.selectedsubproducts[this.productCategory];
                        if (subprdt && subprdt.length > 0) {
                            for (var m = 0; m < subprdt.length; m++) {
                                var isExistSub = false;
                                if (data.productTargetsAndAchievements[k].subTargetAndAchievement && data.productTargetsAndAchievements[k].subTargetAndAchievement.length > 0) {
                                    for (var n = 0; n < data.productTargetsAndAchievements[k].subTargetAndAchievement.length; n++) {
                                        if (!isExistSub) {
                                            if (data.productTargetsAndAchievements[k].subTargetAndAchievement[n].subProductName == subprdt[m].subProductName) {
                                                isExistSub = true;
                                            }
                                        }
                                    }
                                }
                                if (!isExistSub) {
                                    data.productTargetsAndAchievements[k].subTargetAndAchievement.push(this.constructSubCategoryValues(subprdt[m]));
                                }
                            }
                        }
                    }
                }
            }
            if (!isExist) {
                data.productTargetsAndAchievements.push(this.constructDefaultValues(this.productCategory));
            }
        }
    }

    constructDefaultValues(key) {
        var productCategoryList = this.productCategoryList[key];
        var productVolumeTarget = { productName: productCategoryList.name, productId: productCategoryList.productId, subTargetAndAchievement: [], totalRetailTarget: 0 };
        var subcategorylist = this.selectedsubproducts && this.selectedsubproducts[key] && this.selectedsubproducts[key]?.length > 0 ? this.selectedsubproducts[key] : [];
        for (var j = 0; j < subcategorylist?.length; j++) {
            var subProductTarget = { subProductName: subcategorylist[j].subProductName, subProductId: subcategorylist[j].subProductId, subCategoryRetailTarget: 0 };
            productVolumeTarget.subTargetAndAchievement.push(subProductTarget);
        }
        productVolumeTarget.isVisible = this.productCategory == productVolumeTarget?.productName;
        productVolumeTarget.isTHCategory = productVolumeTarget.productName == 'TH';
        if (key == 'TH') {
            productVolumeTarget.demoTarget = 0;
        }
        return productVolumeTarget;
    }

    enableEdit(event) {
        if (this.disableSave && !this.isEdited) {
            this.showfooter = true;
        } else if (this.disableSave && this.isEdited) {
            this.showfooter = false;
        }
        this.deselectclone();
        this.negativeAndBlankCheck();
        if (event) {
            this.editname = event.target.name;
            this.zoneIndex = event.target.dataset.regindex;
        }
        var zoneRecord = this.dataList[this.zoneIndex];
        if (this.editname == "dealerrowedit") {
            this.negativeAndBlankCheck();
            this.editRecordIndex = event.target.dataset.recordindex;
            var records = zoneRecord.value;
            if (this.showfooter && this.disableSave && records[this.editRecordIndex].isEdited) {
                this.showfooter = false;
            }
            records[this.editRecordIndex].isEdited = !records[this.editRecordIndex].isEdited;
            if (records[this.editRecordIndex].isEdited) {
                if (this.checkedit && Object.keys(this.checkedit).length > 0) {
                    let regionindex = Object.keys(this.checkedit)[0];
                    let recordindex = this.checkedit[regionindex];
                    this.dataList[regionindex].value[recordindex].isEdited = false;
                    this.checkedit = {};
                }
                this.checkedit[this.zoneIndex] = this.editRecordIndex;
            }
            else {
                this.checkedit = {};
            }
            this.dataList[this.zoneIndex].value = records;

        } else if (this.editname == "overalledit") {
            if (this.isZone && !this.isEdited) {
                if (this.alertonoff) {
                    if (this.checkedit && Object.keys(this.checkedit).length > 0) {
                        let regionindex = Object.keys(this.checkedit)[0];
                        this.dataList[regionindex].isEdited = false;
                        this.checkedit = {};
                    }
                    this.isEdited = true;
                } else {
                    this.showAlert = true;
                }
            } else if (!this.isZone) {
                this.negativeAndBlankCheck();
                this.isEdited = !this.isEdited;
                if (this.isEdited) {
                }
                else {
                }
                if (this.checkedit && Object.keys(this.checkedit).length > 0) {
                    let regionindex = Object.keys(this.checkedit)[0];
                    let recordindex = this.checkedit[regionindex];
                    this.dataList[regionindex].value[recordindex].isEdited = false;
                    this.checkedit = {};

                }
            } else if (this.isZone && this.isEdited) {

                this.isEdited = false;
            }
            this.negativeAndBlankCheck();
        }
        this.negativeAndBlankCheck();
    }

    disableParent() {
        const disable = new CustomEvent('disableparent', {
            detail: { commonDisable: this.showfooter, isTabVisible: false }
        });
        this.dispatchEvent(disable);

        let tabName = this.template.querySelectorAll('.tab-name');
        if (this.showfooter && tabName) {
            tabName.forEach(tab => tab.classList.add('disableTab'));
        } else if (!this.showfooter && tabName) {
            tabName.forEach(tab => tab.classList.remove('disableTab'));
        }
    }

    setZoneLevelTarget() {
        this.showAlert = false;
        this.alertonoff = true;
        if (this.editname == "overalledit") {
            this.isEdited = true;
        }
        else {
            this.dataList[this.zoneIndex].isEdited = true;
            this.checkedit[this.zoneIndex] = this.zoneIndex;
        }
        this.dimZero();
        this.disableSave = false;
    }

    breakdownRegion(event) {
        var zoneIndex = event.target.dataset.regindex;
        this.dataList[zoneIndex].iconName = this.dataList[zoneIndex].iconName == 'utility:up' ? 'utility:down' : 'utility:up';
        this.dataList[zoneIndex].isExpand = !this.dataList[zoneIndex].isExpand;
    }

    openfileUpload(event) {
        this.searchDealer = '';
        const file = event.target.files[0];
        let isCurrentProductFile = file?.name.toLowerCase().includes("incentive_template") &&
            file?.name.toLowerCase().includes("all_products") &&
            file?.name.toLowerCase().includes(this.month.toLowerCase()) &&
            file?.name.toLowerCase().includes(this.year.toString().toLowerCase());
        if (isCurrentProductFile) {
            if (file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type == 'application/vnd.ms-excel') {
                var reader = new FileReader()
                reader.onload = () => {
                    var base64 = reader.result.split(',')[1]
                    this.fileData = {
                        'filename': file.name,
                        'base64': base64,
                    }
                    this.disableImport = !(this.fileData != null && this.fileData != undefined);
                }
                reader.readAsDataURL(file)
            } else {
                let title = `Invalid file Format. Only ${this.acceptedFormats.join(', ')} are allowed.`;
                this.toast(title, 'error');
                this.disableImport = true;
            }
        }
        else {
            this.toast(`Warning: The Uploaded File "${file?.name}" is not in "${this.month}" month. Please upload the correct template.`, 'error');
            this.fileData = [];
        }
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    readFileHandler(event) {
        // this.isLoading = true;
        this.showImport = false;
        Promise.all([
            loadScript(this, sheetjs)
        ]).then(() => {
            XLS = XLSX;
            this.readFromFile();
        })
        this.isFromExcel = true;
    }

    readFromFile() {
        let wb = XLS.read(this.fileData.base64, { type: 'base64', WTF: false });
        this.table = this.to_json(wb);
        this.dealersCount = 0;
        for (const key in this.dealersByZone) {
            this.dealersCount += Object.values(this.dealersByZone[key]).length;
        }
        this.countingProductColumns = {};
        this.countingProductRows = {};
        const standardColumnsInExcel = 3;
        for (const key in this.table) {
            let columnarray = this.table[key];
            if (!this.countingProductColumns.hasOwnProperty(key)) {
                this.countingProductColumns[key] = new Set();
                this.countingProductColumns[key] = {
                    excelRows: 0,
                    excelColumns: new Set(),
                    dealerRow: this.dealersCount,
                    ProductColumns: 0
                }
            }
            this.countingProductColumns[key].ProductColumns = key != 'TH' ? parseInt(this.productsAndSubCategoriesList.find(product => product.Name == key).DI_Product_Sub_Categories__r.length) + standardColumnsInExcel || 0 : parseInt(this.productsAndSubCategoriesList.find(product => product.Name == key).DI_Product_Sub_Categories__r.length) + standardColumnsInExcel + 1 || 0;
            this.countingProductColumns[key].excelRows = parseInt(columnarray.length) || 0;
            columnarray.forEach(column => { this.countingProductColumns[key].excelColumns.add(Object.keys(column).length) });
        }
        var alteredExcelProducts = [];
        Object.keys(this.countingProductColumns).forEach(key => {
            if (this.countingProductColumns[key].excelRows != this.countingProductColumns[key].dealerRow || this.countingProductColumns[key].excelColumns.size != 1 || this.countingProductColumns[key].ProductColumns != this.countingProductColumns[key].excelColumns.values().next().value) {
                alteredExcelProducts.push(key);
                this.isConvert = false;
            }
        });
        this.convertSheetToJSOn();
    }

    to_json(workbook) {
        let result = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLS.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (roa.length) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    convertSheetToJSOn() {
        var importList = {};
        for (const key in this.table) {
            var records = this.table[key];
            for (var i = 0; i < records.length; i++) {
                var data = {};
                var record = records[i];
                var accountId = record['Id'];
                var dealer = importList[accountId] ? importList[accountId] : {};
                dealer[key] = record;
                importList[accountId] = dealer;
            }
        }

        this.dataList = [];
        var zoneNames = Object.keys(this.dealersByZone);

        for (var r = 0; r < zoneNames.length; r++) {
            var values = [];
            var zoneName = zoneNames[r];
            var dealerList = this.dealersByZone[zoneName];

            for (var j = 0; j < dealerList.length; j++) {
                var dealerRecord = dealerList[j];
                var recordByProduct = importList[dealerRecord.dealerId] ? importList[dealerRecord.dealerId] : {};
                var productTargetsAndAchievements = [];
                var data = {};

                for (const key in this.productCategoryList) { // Loop through all products
                    var product = this.productCategoryList[key];
                    var importRecord = recordByProduct[key];
                    if (importRecord) {
                        data.dealerId = importRecord['Id'];
                        data.dealerName = importRecord['Dealer Name'];
                        data.month = importRecord['Month'];
                        data.year = importRecord['Year'];
                    } else {
                        data.dealerId = dealerRecord.dealerId;
                        data.dealerName = dealerRecord.dealerName;
                    }
                    data.recordId = dealerRecord.recordId;
                    data.month = this.month;
                    data.year = this.year;
                    data.isEdited = false;

                    var productTarget;
                    for (let z = 0; z < dealerRecord?.productTargetsAndAchievements?.length; z++) {
                        productTarget = {};
                        if (dealerRecord.productTargetsAndAchievements[z].productId == product.productId) {
                            productTarget = dealerRecord.productTargetsAndAchievements[z];
                            break;
                        }
                    }

                    var productVolumeTarget = { productId: product.productId, productName: product.name };
                    if (productTarget) {
                        productVolumeTarget.productTargetAndAchievementId = productTarget.productTargetAndAchievementId;
                    }
                    productVolumeTarget.isVisible = true; // Ensure all products are visible
                    productVolumeTarget.isTHCategory = product.name == 'TH';
                    productVolumeTarget.demoTarget = importRecord ? importRecord['Demo Target'] : 0;
                    productVolumeTarget.demoOverRide = product.name == 'TH';

                    var subTargetAndAchievement = [];
                    var totalRetailTarget = 0;
                    let subctglist = [];
                    for (var s = 0; s < product.subCategoryList.length; s++) {
                        var subProduct = product.subCategoryList[s];
                        var subProductTarget = { subProductId: subProduct.subCategoryId, subProductName: subProduct.name };

                        if (productTarget && productTarget.subTargetAndAchievement && productTarget.subTargetAndAchievement.length > 0) {
                            var subPrdtgt;
                            for (let y = 0; y < productTarget.subTargetAndAchievement.length; y++) {
                                subPrdtgt = {};
                                if (productTarget.subTargetAndAchievement[y].subProductId == subProduct.subCategoryId) {
                                    subPrdtgt = productTarget.subTargetAndAchievement[y];
                                    break;
                                }
                            }
                            if (subPrdtgt) {
                                subProductTarget.subTargetAndAchievementId = subPrdtgt.subTargetAndAchievementId;
                            }
                        }

                        let subtgt = importRecord ? importRecord[subProduct.name] : 0;
                        subProductTarget.subCategoryRetailTarget = subtgt != null
                            ? (parseInt(subtgt) || 0)
                            : (parseInt(subPrdtgt?.subCategoryRetailTarget) || 0);
                        subProductTarget.targetOverRide = true;
                        totalRetailTarget += (parseInt(subProductTarget.subCategoryRetailTarget) || 0);
                        subTargetAndAchievement.push(subProductTarget);

                        if (j == 0) {
                            subctglist.push({ subProductName: subProduct.name, subProductId: subProduct.subCategoryId });
                        }
                    }

                    if (j == 0) {
                        this.selectedsubproducts[product.name] = subctglist;
                    }

                    productVolumeTarget.subTargetAndAchievement = subTargetAndAchievement;
                    productVolumeTarget.totalRetailTarget = totalRetailTarget;
                    productTargetsAndAchievements.push(productVolumeTarget);
                }

                data.productTargetsAndAchievements = productTargetsAndAchievements;
                values.push(data);
            }

            let recObj = {
                key: zoneName,
                value: values,
                isExpand: true,
                iconName: 'utility:down',
                isEdited: false,
                productTargetsAndAchievements: []
            };

            for (const key in this.productCategoryList) {
                recObj.productTargetsAndAchievements.push(this.constructDefaultValues(key));
            }

            this.dataList.push(recObj);
        }

        this.subprdlist = this.selectedsubproducts[this.productCategory];
        let title = `${this.fileData.filename} uploaded successfully!!`;
        this.toast(title, 'success');
        this.fileData = {};
        this.disableImport = true;
        this.isEdited = true;
        this.disableSave = false;
        this.editname = 'overalledit';
        this.showfooter = true;
        this.disableParent();
        this.dimZero();
        this.getZoneValues();
        this.negativeAndBlankCheck();
    }


    handleCancel() {
        if (!this.disableSave) {
            this.askConfirmation = true;
        } else {
            this.hideFooter();
            this.dimZero();
            this.showfooter = false;
            this.disableSave = true;
            this.disableParent();
        }
    }

    handleClose() {
        // this.isLoading = true;
        this.hideFooter();
        this.selectedsubproducts = null;
        this.getAccountByRegion();
        this.askConfirmation = false;
        this.showfooter = false;
        this.disableSave = true;
        setTimeout(() => {
            this.disableParent();
        }, 2000);
    }

    closeConfirmation() {
        this.askConfirmation = false;
    }

    showCloneBtn(event) {
        if (this.recordIndex && this.regIndex && this.recordIndex == event.target.dataset.recordid && this.regIndex == event.target.dataset.regid) {
            this.hideCloneBtn(event);
        } else if (this.recordIndex && this.regIndex && (this.recordIndex != event.target.dataset.recordid || this.regIndex != event.target.dataset.regid)) {
            this.hideCloneBtn(event);
            this.highlightRow(event);
        } else {
            this.highlightRow(event);
        }
    }

    enableClone(event) {
        if (this.isZoneRowClone && this.regIndex && this.regIndex == event.target.dataset.regindex) {
            this.disableClone(event);
        }
        else if (this.isZoneRowClone && this.regIndex && this.regIndex != event.target.dataset.regindex) {
            this.disableClone(event);
            this.addCSSProperties(event);
        } else {
            this.addCSSProperties(event);
        }
    }

    addCSSProperties(event) {
        this.regIndex = event.target.dataset.regindex;
        let queryName = '[data-region="' + this.regIndex + '"]';
        var zoneTag = this.template.querySelectorAll(queryName);
        let lastIndex;
        for (let i = 0; i < zoneTag.length; i++) {
            if (zoneTag[i]) {
                if (i == 0) {
                    zoneTag[i].classList.add('dealer-select');
                } else {
                    zoneTag[i].classList.add('volumeTarget');
                }
                lastIndex = i;
            }
        }
        if (lastIndex) {
            zoneTag[lastIndex].classList.add('lastChild-border');
        }
        let regattr = '[data-zonekey="' + this.regIndex + '"]';
        var cloneButton = this.template.querySelectorAll(regattr);
        cloneButton[0].style.display = 'block';
        this.isZoneRowClone = true;
    }

    disableClone() {
        let queryName = '[data-region="' + this.regIndex + '"]';
        var zoneTag = this.template.querySelectorAll(queryName);
        let lastIndex;
        for (let i = 0; i < zoneTag.length; i++) {
            if (zoneTag[i]) {
                if (i == 0) {
                    zoneTag[i].classList.remove('dealer-select');
                } else {
                    zoneTag[i].classList.remove('volumeTarget');
                }
                lastIndex = i;
            }
        }
        if (lastIndex) {
            zoneTag[lastIndex].classList.remove('lastChild-border');
        }
        let regattr = '[data-zonekey="' + this.regIndex + '"]';
        var cloneButton = this.template.querySelectorAll(regattr);
        if (cloneButton && cloneButton[0]) {
            cloneButton[0].style.display = 'none';
            this.regIndex = '';
            this.isZoneRowClone = false;
        }
    }

    highlightRow(event) {
        this.recordIndex = event.target.dataset.recordid;
        this.regIndex = event.target.dataset.regid;
        let dataQueryName = '[data-recordid="' + this.recordIndex + '"]';
        this.inputval = this.template.querySelectorAll(`[data-recordid="${this.recordIndex}"][data-regid="${this.regIndex}"]`);
        let lastIndex;
        for (var i = 0; i < this.inputval.length; i++) {
            if (i == 0) {
                this.inputval[i].classList.add('dealer-select');
            } else {
                this.inputval[i].classList.add('volumeTarget');
            }
            lastIndex = i;
        }
        if (lastIndex) {
            this.inputval[lastIndex].classList.add('lastChild-border');
        }
        let regattr = '[data-zonekey="' + this.regIndex + '"]';
        var cloneButton = this.template.querySelectorAll(regattr);
        cloneButton[this.recordIndex].style.display = 'block';
        this.isDealerRowClone = true;
        this.isCellClone = false;
    }

    hideCloneBtn() {
        let dataQueryName = '[data-recordid="' + this.recordIndex + '"]';
        var inputval = this.template.querySelectorAll(`[data-recordid="${this.recordIndex}"][data-regid="${this.regIndex}"]`);
        let lastIndex;
        for (var i = 0; i < inputval.length; i++) {
            if (inputval[i]) {
                if (i == 0) {
                    inputval[i].classList.remove('dealer-select');
                } else {
                    inputval[i].classList.remove('volumeTarget');
                }
            }
            lastIndex = i;
        }
        if (lastIndex && inputval[lastIndex]) {
            inputval[lastIndex].classList.remove('lastChild-border');
        }
        let regattr = '[data-zonekey="' + this.regIndex + '"]';
        var cloneButton = this.template.querySelectorAll(regattr);
        if (cloneButton && cloneButton[this.recordIndex]) {
            cloneButton[this.recordIndex].style.display = 'none';
            this.recordIndex = '';
            this.regIndex = '';
            this.isDealerRowClone = false;
        }
    }

    deselectclone(event) {
        this.hideCloneBtn(); this.disableClone();
    }

    showDealersByZone(event) {
        let regIndex = event.target.dataset.regindex;
        if (this.subprdlist) {
            this.subList = JSON.parse(JSON.stringify(this.subprdlist));
        } else {
            this.subList = [];
        }
        this.dealerList = JSON.parse(JSON.stringify(this.dataList[regIndex]));
        this.showDealerModal = true;
    }

    closeDealerModal() {
        this.showDealerModal = false;
    }

    onkeyPressed(event) {
        let recordIndex = event.target.dataset.row;
        let cellIndex = event.target.dataset.id;
    }

    handleSearch(event) {
        let value = event.target.value;
        this.dealerOptions = [];
        for (let a = 0; a < this.withOutSelectedDealers.length; a++) {
            if (this.withOutSelectedDealers[a].label.toLowerCase().includes(value.toLowerCase())) {
                this.dealerOptions.push(this.withOutSelectedDealers[a]);
            }
        }
    }

    handleSearchClick() {
        if (!this.isDealerSearch) {
            this.dataList = this.tempDataList;
        }
        this.isDealerSearch = !this.isDealerSearch;
    }

    handleCaseSensitive() {
        this.template.querySelectorAll('.second-tbody-tr').forEach(row => {
            row.dataset.searchname = row.dataset.dealername.trim().toLowerCase();
        });
    }

    handleSearchDealer(event) {
        let searchTerm = event.target.value;
        this.dataList = [];
        this.tempDataList.forEach(zone => { this.dataList.push({ value: zone.value.filter(dealer => dealer.dealerName.toLowerCase().includes(searchTerm.toLowerCase())), isExpand: zone.isExpand, isEdited: zone.isEdited, key: zone.key }); });
    }


    focusFilteredDealerRow() {
        const previouslyHighlightedDealerRow = this.template.querySelectorAll('.highlightSelectedDealerRow');
        previouslyHighlightedDealerRow.forEach(row => {
            row.classList.remove('highlightSelectedDealerRow');
        });
        const dealerRow = this.template.querySelectorAll(`.second-tbody-tr[data-searchname*="${this.searchDealer}"]`);
        if (dealerRow.length > 0) {
            dealerRow.forEach(row => {
                if (dealerRow[0] === row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                row.classList.add('highlightSelectedDealerRow');
            });
            setTimeout(() => {
                dealerRow.forEach(row => {
                    row.classList.remove('highlightSelectedDealerRow');
                });
            }, 3000);
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
    }

    async exportToXLSX() {
        this.createExcelTemplate();
        await writeXlsxFile(this.objects, {
            sheets: this.sheetNames, // Use dynamically generated sheet names
            schema: this.objectArray,
            fileName: `Incentive_Template_All_Products_${this.month}_${this.year}.xlsx`,
            headerStyle: {
                backgroundColor: '#E7AF28',
                fontWeight: 'bold',
                align: 'center',
                color: '#000000',
                borderColor: '#000000'
            },
        });
    }

    createObjectArray() {
        this.objectArray = []; this.objects = []; this.sheetNames = [];
        this.productsAndSubCategoriesList.forEach(prodAndSubCategory => {
            if (prodAndSubCategory.Name == this.productCategory) {
                let columns_Array = [{ column: 'S.No', type: Number, value: d => { if (this.count <= this.dealerRecords.length) { return this.count++ } else { this.count = 1; return this.count++ } }, align: "center", width: 10, borderColor: '#000000' }, { column: 'Dealer Name', type: String, value: d => d.Name, width: 25, borderColor: '#000000' }];
                prodAndSubCategory.DI_Product_Sub_Categories__r.sort((a, b) => {
                    if (a.Name < b.Name) {
                        return -1;
                    }
                    if (a.Name > b.Name) {
                        return 1;
                    }
                    return 0;
                });
                for (let j = 0; j < prodAndSubCategory.DI_Product_Sub_Categories__r.length; j++) {
                    let obj = {
                        column: prodAndSubCategory.DI_Product_Sub_Categories__r[j].Name,
                        type: String,
                        align: "center",
                        width: 20,
                        wrap: true,
                        value: d => null,
                        borderColor: '#000000'
                    }
                    columns_Array.push(obj);
                }
                if (prodAndSubCategory.Name == 'TH') {
                    columns_Array.push({ column: 'Demo Target', type: String, align: "center", width: 20, wrap: true, value: d => null, borderColor: '#000000' });
                }
                columns_Array.push({ column: 'Id', type: String, value: d => d.Id, align: "center", width: 20, borderColor: '#000000' });
                this.objectArray.push(columns_Array);
                this.objects.push(this.dealerRecords);
            }
        });
        this.sheetNames.push(this.productCategory);
    }

    createExcelTemplate() {
        this.objectArray = [];
        this.objects = [];
        this.sheetNames = [];
        this.productsAndSubCategoriesList.forEach(product => {
            const productName = product.Name;
            const excelFormat = this.createExcelFormat(productName);
            const headers = Object.keys(excelFormat[0]);
            const columnsArray = headers.map(header => {
                if (header === 'Id') {
                    return { column: header, type: String, value: ele => ele[header], align: "center", width: 25, borderColor: '#000000', backgroundColor: '#C3C5C8' };
                }
                if (header === 'Dealer Name') {
                    return { column: header, type: String, value: ele => ele[header], align: "center", width: 30, borderColor: '#000000', backgroundColor: '#C3C5C8', wrap: true };
                }
                if (header === 'S.No') {
                    return { column: header, type: Number, value: ele => ele[header], align: "center", width: 10, borderColor: '#000000', backgroundColor: '#C3C5C8' };
                }
                return { column: header, type: Number, value: ele => ele[header], align: "center", width: 20, borderColor: '#000000', wrap: true };
            });
            this.objectArray.push(columnsArray);
            this.objects.push(excelFormat);
            this.sheetNames.push(productName);
        });
    }
}