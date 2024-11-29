import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/writeexcelfile";
import sheetjs from '@salesforce/resourceUrl/sheetmin';
import getDealerIncentivesForStock from '@salesforce/apex/dIFormulaController.getDealerIncentivesForStock';
import getProductsAndSubCategories from '@salesforce/apex/dIFormulaController.getProductsAndSubCategories';
import getProductTargets from '@salesforce/apex/dIFormulaController.getProductTargets';
import saveInHandProductTargetAndAchievements from '@salesforce/apex/dIFormulaController.saveInHandProductTargetAndAchievements';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';

let XLS = {};

export default class DIStockCondition extends LightningElement {

    @track dealers;
    @track tempDealers = [];
    @track achievements = [];
    @track isReadOnly = true;
    @track alwaysReadOnly = true;
    @track isFooter = false;
    @track isEdit = true;
    @track isDisableCancel = true;
    @track isDisableSave = true;
    @track isLoading = true;
    @track askConfirmation = false;
    @track kpis = {};
    @track isDealerSearch = true;
    @track searchDealer = '';
    @track acceptedFormats = ['.xlsx', '.xls'];
    @track fileData;
    @track isLibraryLoaded = false;
    @track excelData;
    @track shouldHaveValues = 0;
    @track inHandvalues = 0;
    @track standardColumnsInExcel = 3;
    @track noOfColumnsInExcel = new Set();
    @track table;
    @track productsAndSubCategoriesList = [];
    @track previousDealerWiseEdit = null;
    @track previousProductWiseEdit = null;
    @track productTargets = [];
    @track file = [];
    @track recordsToSave = [];
    @track showRecords = false;
    @track hideRecords = false;
    @track configuredProducts = [];
    @track configuredStockProducts = [];
    @track dealerNotification = "";
    @track excel = [];
    @track disableImport = true;
    @track filteredDealerList = [];
    @track excelFormat = [];
    @track months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    @track noOfDaysOfParticularMonth = 0;


    @api showDownloadUpload = false;
    @api month;
    @api year;

    inputData = {};
    objects = [];
    sheetNames = [];
    objectArray = [];
    count = 1;
    oppCount;
    totalRetail;

    connectedCallback() {
        this.isLoading = true;
        this.getDealerIncentivesForStock();
    }

    @api handleRow() {
        this.isLoading = true;
        this.getDealerIncentivesForStock();
        this.isReadOnly = true;
        this.isEdit = true;
        this.isFooter = false;
    }

    getDealerIncentivesForStock() {
        this.dealers = [];
        this.tempDealers = [];
        let monthIndex = this.months.indexOf(this.month) + 1;
        this.noOfDaysOfParticularMonth = parseInt(new Date(this.year, monthIndex, 0).getDate()) || 30;
        getDealerIncentivesForStock({ month: this.month, year: this.year })
            .then(result => {
                this.dealers = result;
                this.tempDealers = result;
                this.configuredProducts = [];
                if (this.dealers?.length > 0) {
                    this.dealers[0]?.DI_Product_Target_and_Achievements__r.forEach(prdtTrgt => {
                        this.configuredProducts.push(prdtTrgt?.Product_Category__r?.Name);
                    })
                    this.hideRecords = false;
                    this.showRecords = true;
                    this.dealerNotification = "";
                    this.getProductTargets();
                } else {
                    this.productsAndSubCategoriesList = [];
                    this.hideRecords = true;
                    this.showRecords = false;
                    this.dealerNotification = `For this month of  ${this.month} ${this.year} Retail Target is not configured`;
                    this.isLoading = false;
                }
            })
            .catch(error => {
                console.error('error is:', error.body.message);
                this.isLoading = false;
            });
    }

    getProductsAndSubCategories() {
        getProductsAndSubCategories()
            .then(result => {
                this.productsAndSubCategoriesList = result.filter(result => this.configuredStockProducts.includes(result?.Name)).filter(result => this.configuredProducts.includes(result?.Name));
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    getProductTargets() {
        this.productTargets = [];
        getProductTargets({ month: this.month, year: this.year })
            .then(result => {
                this.productTargets = result;
                if (this.productTargets.length == 0) {
                    this.hideRecords = true;
                    this.showRecords = false;
                    this.dealerNotification = `For this month of ${this.month} ${this.year} Stock Policy is not configured`;
                    this.isLoading = false;
                } else {
                    this.configuredStockProducts = [];
                    result.filter(stockPolicy => stockPolicy?.Stock_Policy__c > 0).forEach(stock => {
                        this.configuredStockProducts.push(stock?.DI_Product_Category__r?.Name);
                    });
                    if (this.configuredStockProducts?.length > 0) {
                        this.getProductsAndSubCategories();
                        this.dealerNotification = "";
                        this.showRecords = true;
                        this.hideRecords = false;
                        setTimeout(() => {
                            if (this.productsAndSubCategoriesList?.length > 0) {
                                this.assignProductTargets();
                                this.dealerNotification = "";
                                this.showRecords = true;
                                this.hideRecords = false;
                            } else {
                                this.hideRecords = true;
                                this.showRecords = false;
                                this.dealerNotification = `For this month of ${this.month} ${this.year} Stock Policy or Retail Target is not configured`;
                                this.isLoading = false;
                            }
                        }, 500);
                    } else {
                        this.hideRecords = true;
                        this.showRecords = false;
                        this.dealerNotification = `For this month of ${this.month} ${this.year} Stock Policy is not configured`;
                        this.isLoading = false;
                    }
                }
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    assignProductTargets() {
        this.productTargets.forEach(productTarget => {
            let productId = productTarget?.DI_Product_Category__c;
            let productName = productTarget?.DI_Product_Category__r?.Name;
            let stockPolicy = parseInt(productTarget?.Stock_Policy__c) || 0;
            const inputs = this.template.querySelectorAll(`lightning-formatted-text[data-productname = "${productName}"][data-productid =${productId}]`);
            inputs.forEach(input => {
                input.dataset.producttarget = stockPolicy;
            });
        })
        this.assignShouldHaveAndInHandValues(this.dealers);
    }

    assignShouldHaveAndInHandValues(dealers) {
        this.excelFormat = [];
        dealers.forEach((dealer, index) => {
            let excelColumnFormat = {};
            let dealerId = dealer?.Id;
            let dealerAccountId = dealer?.Dealer_Account__c;
            excelColumnFormat['S.No'] = index + 1;
            excelColumnFormat['Id'] = dealerId;
            excelColumnFormat['Dealer Name'] = dealer?.Dealer_Account__r?.Name;
            dealer?.DI_Product_Target_and_Achievements__r?.forEach(prdTrgtAchvmnt => {
                let prdTrgtAchvmntId = prdTrgtAchvmnt?.Id;
                let productName = prdTrgtAchvmnt?.Product_Category__r?.Name;
                let productId = prdTrgtAchvmnt?.Product_Category__c;
                let stockPolicy = parseInt(this.productTargets.find(prdTrgt => prdTrgt.DI_Product_Category__r.Name == productName)?.Stock_Policy__c) || this.noOfDaysOfParticularMonth;
                let totalRetailAchieved = 0;
                let totalRetailTarget = parseInt(prdTrgtAchvmnt?.Total_Retail_Target__c) || 0;
                let calculatedTotalRetailTarget = Math.ceil((totalRetailTarget / this.noOfDaysOfParticularMonth) * stockPolicy) || totalRetailTarget;
                let shouldHave = calculatedTotalRetailTarget;
                if (prdTrgtAchvmnt.hasOwnProperty('Should_Have__c')) {
                    shouldHave = parseInt(prdTrgtAchvmnt?.Should_Have__c) || 0;
                }
                let inStock = parseInt(prdTrgtAchvmnt?.In_Stock__c) || 0;
                if (this.productsAndSubCategoriesList.some(product => product.Name == productName)) {
                    let shouldHaveProduct = productName + ' (Should Have)';
                    let inHandProduct = productName + ' (In Hand)';
                    excelColumnFormat[shouldHaveProduct] = shouldHave;
                    excelColumnFormat[inHandProduct] = inStock;
                }
                const inHandInputs = this.template.querySelectorAll(`lightning-input[data-dealerid="${dealerId}"][data-productid="${productId}"][data-productname="${productName}"]`);
                inHandInputs.forEach(input => {
                    let inputType = input?.dataset?.name;
                    if (inputType == "shouldhave") {
                        input.value = shouldHave;
                        input.dataset.value = shouldHave;
                        input.dataset.inhandvalue = inStock;
                        input.dataset.recordid = prdTrgtAchvmntId;
                        input.dataset.totalretailachieved = totalRetailAchieved;
                        input.dataset.totalretailtarget = totalRetailTarget;
                        input.dataset.stockpolicy = stockPolicy;
                    }
                    else if (inputType == "inhand") {
                        input.value = inStock;
                        input.dataset.value = inStock;
                        let inHandValue = parseInt(input?.dataset?.value) || 0;
                        input.dataset.recordid = prdTrgtAchvmntId;
                        input.dataset.shouldhavevalue = shouldHave;
                        if (inHandValue >= shouldHave) {
                            input.classList.add('stock_maintained');
                            input.classList.remove('stock_not_maintained');
                        }
                        else {
                            input.classList.add('stock_not_maintained');
                            input.classList.remove('stock_maintained');
                        }
                    }
                });
            });
            this.excelFormat.push(excelColumnFormat);
        });
        this.handleInhandStockPolicy();
    }

    handleInputChange(event) {
        if (event) {
            let dealerId = event?.target?.dataset?.dealerid;
            let accountId = event?.target?.dataset?.accountid;
            let productId = event?.target?.dataset?.productid;
            let inputName = event?.target?.dataset?.name;
            let value = parseInt(event?.target?.value) || 0;
            if (inputName == "inhand") {
                let shouldHaveValue = parseInt(this.template.querySelector(`lightning-input[data-productid="${productId}"][data-name="shouldhave"][data-dealerid="${dealerId}"]`)?.value) || 0;
                if (value >= shouldHaveValue) {
                    event?.target?.classList?.add('stock_maintained');
                    event?.target?.classList?.remove('stock_not_maintained');
                }
                else {
                    event?.target?.classList?.add('stock_not_maintained');
                    event?.target?.classList?.remove('stock_maintained');
                }
            }
        }
        this.isFooter = true;
        this.disableParent();
        this.isDisableCancel = false;
        this.isDisableSave = false;
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

    handleCellClick(event) {
        let dealerid = event.target.dataset.dealerid;
    }

    handleRowEdit(event) {
        let dealerId = event?.target?.dataset?.dealerid;
        this.isFooter = true;
        if (dealerId == this.previousDealerWiseEdit) {
            this.disableCellEdit();
            this.previousDealerWiseEdit = null;
            if (this.isFooter && this.isDisableSave) {
                this.isFooter = false;
            }
        }
        else if (dealerId != this.previousDealerWiseEdit) {
            this.disableCellEdit();
            const inputs = this.template.querySelectorAll(
                `lightning-input[data-dealerid="${dealerId}"]`
            );
            inputs.forEach(input => {
                input.readOnly = false;
            });
            this.previousDealerWiseEdit = dealerId;
        }
    }

    handleColumnEdit(event) {
        let productId = event?.target?.dataset?.productid;
        let productName = event?.target?.dataset?.productname;
        this.isFooter = true;
        if (productId == this.previousProductWiseEdit) {
            this.disableCellEdit();
            this.previousProductWiseEdit = null;
            if (this.isFooter && this.isDisableSave) {
                this.isFooter = false;
            }
        }
        else if (productId != this.previousProductWiseEdit) {
            this.disableCellEdit();
            const inputs = this.template.querySelectorAll(
                `lightning-input[data-productid="${productId}"][data-name="inhand"][data-productname="${productName}"]`
            );
            inputs.forEach(input => {
                input.readOnly = false;
            });
            this.previousProductWiseEdit = productId;
        }
    }

    disableParent() {
        const disable = new CustomEvent('disableparent', {
            detail: { commonDisable: this.isFooter, isTabVisible: true }
        });
        this.dispatchEvent(disable);
    }

    disableCellEdit() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.readOnly = true;
        });
    }

    handleInhandStockPolicy() {
        const inHandInputs = this.template.querySelectorAll('lightning-input[data-name="inhand"]');
        inHandInputs.forEach(input => {
            let dealerId = input?.dataset?.dealerid;
            let productId = input?.dataset?.productid;
            let inHandValue = parseInt(input?.value) || 0;
            let shouldHaveValue = parseInt(this.template.querySelector(`lightning-input[data-productid="${productId}"][data-name="shouldhave"][data-dealerid="${dealerId}"]`)?.value) || 0;
            if (inHandValue >= shouldHaveValue) {
                input?.classList?.add('stock_maintained');
                input?.classList?.remove('stock_not_maintained');
            }
            else {
                input?.classList?.remove('stock_maintained');
                input?.classList?.add('stock_not_maintained');
            }
        });
        this.isLoading = false;
    }

    handleSearchClick() {
        if (!this.isDealerSearch) {
            this.dealers = this.tempDealers;
            setTimeout(() => {
                this.assignShouldHaveAndInHandValues(this.dealers);
            }, 500);
        }
        this.isDealerSearch = !this.isDealerSearch;
    }

    handleCaseSensitive() {
        this.template.querySelectorAll('.tbody-tr').forEach(row => {
            row.dataset.searchname = row.dataset.dealername.trim().toLowerCase();
        });
    }

    handleSearchDealer(event) {
        this.searchDealer = event.target.value;
        this.dealers = this.tempDealers.filter(dealer => dealer.Dealer_Account__r.Name.toLowerCase().includes(this.searchDealer.toLowerCase()));
        setTimeout(() => {
            this.assignShouldHaveAndInHandValues(this.dealers);
        }, 500);
    }

    handleSort() {
        this.dealers = this.dealers.reverse();
    }

    focusFilteredDealerRow() {
        const previouslyHighlightedDealerRow = this.template.querySelectorAll('.highlightSelectedDealerRow');
        previouslyHighlightedDealerRow.forEach(row => {
            row.classList.remove('highlightSelectedDealerRow');
        });

        const dealerRow = this.template.querySelectorAll(`.tbody-tr[data-searchname*="${this.searchDealer}"]`);
        this.filteredDealerList = [];
        if (dealerRow.length > 0) {
            dealerRow.forEach(row => {
                this.filteredDealerList.push(row.dataset?.dealerid);
                if (dealerRow[0] === row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                row.classList.add('highlightSelectedDealerRow');
            });

            setTimeout(() => {
                dealerRow.forEach(row => {
                    row.classList.remove('highlightSelectedDealerRow');
                });
            }, 5000);
        }
    }

    handleCancel() {
        if (!this.isDisableSave) {
            this.askConfirmation = true;
        } else {
            this.isEdit = true;
            this.isReadOnly = true;
            this.isFooter = false;
            this.disableParent();
            this.disableCellEdit();
            this.isDisableCancel = true;
            this.isDisableSave = true;
        }
    }

    closeConfirmation() {
        this.askConfirmation = false;
    }

    handleClose() {
        this.isLoading = true;
        this.askConfirmation = false;
        this.isEdit = true;
        this.isReadOnly = true;
        this.isFooter = false;
        this.disableParent();
        this.isDisableCancel = true;
        this.isDisableSave = true;
        this.file = [];
        this.excelData = [];
        this.disableCellEdit();
        this.getDealerIncentivesForStock();
    }

    handleSave() {
        this.isLoading = true;
        const inputData = this.template.querySelectorAll(`lightning-input[data-name="inhand"]`);
        this.recordsToSave = [];
        inputData.forEach((input, index) => {
            let dealerId = input?.dataset?.dealerid;
            let productId = input?.dataset?.productid;
            let accountId = input?.dataset?.accountid;
            let inHandValue = parseInt(input?.value) || 0;
            let shouldHaveValue = parseInt(this.template.querySelector(`lightning-input[data-productid="${productId}"][data-name="shouldhave"][data-dealerid="${dealerId}"]`)?.value) || 0;
            let recordId = input?.dataset?.recordid;

            let pushingData = {
                Product_Category__c: productId,
                In_Stock__c: inHandValue,
                Should_Have__c: shouldHaveValue,
                Incentive_Status__c: inHandValue >= shouldHaveValue ? "Eligible" : "InEligible",
                Dealer_Incentive__c: dealerId
            };
            if (recordId) {
                pushingData.Id = recordId;
            }
            this.recordsToSave.push(pushingData);
        });
        this.saveInHandProductTargetAndAchievements();
        this.askConfirmation = false;
    }

    saveInHandProductTargetAndAchievements() {
        saveInHandProductTargetAndAchievements({ inputData: this.recordsToSave, month: this.month, year: this.year })
            .then(result => {
                this.isEdit = true;
                this.isFooter = false;
                this.isDisableSave = true;
                this.disableParent();
                this.isReadOnly = true;
                this.disableCellEdit();
                this.getDealerIncentivesForStock();
                this.isDealerSearch = true;
                this.file = [];
                this.excelData = [];
                this.toast(`${this.month} - ${this.year} InHand Stock Has Been Successfully Saved !!!`, 'success');
                this.getTargetsAndPayouts();
            })
            .catch(error => {
                this.toast(`Warning: Unable to Save the ${this.month} - ${this.year} InHand Stocks.`, 'error')
                this.isLoading = false;
            });
    }

    // getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     getTargetsAndPayouts({ month: this.month, year: this.year, dealerIds: dealerIds, isActual: false }).then(res => {
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

    getDealerCounts() {
        getDealerCounts({ dealerId: this.dealerAccountId, month: this.month, year: this.year })
            .then(result => {
            }).catch(error => {
            });
    }

    enableCommonEdit() {
        this.isReadOnly = !this.isReadOnly;
        this.isEdit = this.isReadOnly ? true : false;
        this.isFooter = true;
        if (this.isFooter && this.isDisableSave && this.isEdit) {
            this.isFooter = false;
        }
    }

    async downloadTemplate() {
        if (this.showRecords) {
            this.createExcelTemplate();
            await writeXlsxFile(this.objects, {
                sheets: this.sheetNames,
                schema: this.objectArray,
                fileName: `Stock_Condition_Template_${this.month}_${this.year}.xlsx`,
                headerStyle: {
                    backgroundColor: '#E7AF28',
                    fontWeight: 'bold',
                    align: 'center',
                    color: '#000000',
                    borderColor: '#000000'
                },
            })
        }
        else {
            this.toast(`For this month of ${this.month} ${this.year} Retail Target or Stock Policy is not configured.`, 'info');
            this.closeDownloadUploadModal();
        }

    }

    openfileUpload(event) {
        this.file = event?.target?.files[0];
        let isCurrentMonthFile = this.file?.name.toLowerCase().includes(this.month.toLowerCase());
        if (isCurrentMonthFile) {
            if (this.file?.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || this.file?.type == 'application/vnd.ms-excel') {
                var reader = new FileReader()
                reader.onload = () => {
                    var base64 = reader.result.split(',')[1]
                    this.excelData = {
                        'filename': this.file?.name,
                        'base64': base64,
                    }
                    this.disableImport = !(this.excelData != null && this.excelData != undefined);
                }
                reader.readAsDataURL(this.file)
            } else {
            }
        }
        else {
            this.toast(`Warning: The Uploaded File "${this.file?.name}" is not for "${this.month}" month. Please upload the correct template.`, 'error');
            this.file = [];
        }
    }

    closeDownloadUploadModal() {
        this.showDownloadUpload = false;
        this.file = [];
        this.excelData = {};
        this.disableImport = true;
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

    createExcelFormat() {
        this.objectArray = []; this.objects = []; this.sheetNames = [];
        let columns_Array = [
            {
                column: 'S.No',
                type: Number,
                value: ele => {
                    if (this.count <= this.dealers.length) {
                        return this.count++
                    }
                    else {
                        this.count = 1;
                        return this.count++
                    }
                },
                align: "center",
                width: 10,
                borderColor: '#000000'
            },
            {
                column: 'Dealer Name',
                type: String,
                value: ele => ele.Dealer_Account__r.Name,
                width: 30,
                borderColor: '#000000'
            }
        ];
        for (const key in this.productsAndSubCategoriesList) {
            let product = {
                column: `${this.productsAndSubCategoriesList[key].Name} (Should Have)`,
                type: String,
                align: "center",
                width: 20,
                wrap: true,
                value: ele => null,
                borderColor: '#000000',
            }
            columns_Array.push(product);
            let prod = {
                column: `${this.productsAndSubCategoriesList[key].Name} (In Hand)`,
                type: String,
                align: "center",
                width: 20,
                wrap: true,
                value: ele => null,
                borderColor: '#000000',
            }
            columns_Array.push(prod);
        }
        columns_Array.push({ column: 'Id', type: String, value: ele => ele.Id, align: "center", width: 20, borderColor: '#000000', backgroundColor: '#C3C5C8' });
        this.objectArray.push(columns_Array);
        this.objects.push(this.dealers);
        this.sheetNames.push('Stock Condition');
    }

    createExcelTemplate() {
        this.objectArray = []; this.objects = []; this.sheetNames = [];
        let headers = Object.keys(this.excelFormat[0]);
        let columnsArray = [];
        headers.forEach((header, index) => {
            if (header == 'Id' || header == 'Dealer Name' || header == 'S.No') {
                if (header == 'Id') {
                    columnsArray.push({ column: header, type: String, value: ele => ele[header], align: "center", width: 25, borderColor: '#000000', backgroundColor: '#C3C5C8' });
                }
                else if (header == 'Dealer Name') {
                    columnsArray.push({ column: header, type: String, value: ele => ele[header], align: "center", width: 30, borderColor: '#000000', backgroundColor: '#C3C5C8', wrap: true });
                }
                else if (header == 'S.No') {
                    columnsArray.push({ column: header, type: Number, value: ele => ele[header], align: "center", width: 10, borderColor: '#000000', backgroundColor: '#C3C5C8' });
                }

            } else {
                columnsArray.push({ column: header, type: Number, value: ele => ele[header], align: "center", width: 20, borderColor: '#000000' });
            }
        })
        this.objectArray.push(columnsArray);
        this.objects.push(this.excelFormat);
        this.sheetNames.push('Stock Condition');
    }


    readFileHandler(event) {
        Promise.all([
            loadScript(this, sheetjs)
        ]).then(() => {
            XLS = XLSX;
            this.readFromFile();
        })
        this.showDownloadUpload = false;
    }

    readFromFile() {
        let wb = XLS.read(this.excelData?.base64, { type: 'base64', WTF: false });
        this.table = this.to_json(wb);
        this.noOfColumnsInExcel.clear();
        this.convertExcelDataToTable();
    }

    convertExcelDataToTable() {
        for (const key in this.table) {
            var ProductRows = this.table[key];
            for (let i = 0; i < ProductRows?.length; i++) {
                var rowDealerId = ProductRows[i]?.Id;
                const inputs = this.template.querySelectorAll(`lightning-input[data-dealerid="${rowDealerId}"]`);
                if (inputs) {
                    inputs.forEach(input => {
                        var productName = input?.dataset?.productname;
                        var shouldHaveProduct = `${productName} (Should Have)`;
                        var inHandProduct = `${productName} (In Hand)`;
                        var shouldHaveproductvalue = ProductRows[i][shouldHaveProduct];
                        var inHandproductvalue = ProductRows[i][inHandProduct];
                        const shouldHaveAndInHandInputs = this.template.querySelectorAll(`lightning-input[data-dealerid = "${rowDealerId}"][data-productname = "${productName}"]`);
                        if (shouldHaveAndInHandInputs) {
                            shouldHaveAndInHandInputs?.forEach(anyInput => {
                                let inputName = anyInput?.dataset?.name;
                                if (inputName == 'shouldhave') {
                                    if (shouldHaveproductvalue != null && anyInput?.value >= 0) {
                                        anyInput.value = parseFloat(shouldHaveproductvalue) || 0;
                                    }
                                }
                                else if (inputName == 'inhand') {
                                    if (inHandproductvalue != null && anyInput?.value >= 0) {
                                        anyInput.value = parseFloat(inHandproductvalue) || 0;
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
        this.handleInhandStockPolicy();
        this.isReadOnly = false;
        this.isFooter = true;
        this.disableParent();
        this.isDisableCancel = false;
        this.isDisableSave = false;
        this.disableImport = true;
        this.toast('Data imported from Excel to Config page successfully !!!', 'success');
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

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent);
    }
}