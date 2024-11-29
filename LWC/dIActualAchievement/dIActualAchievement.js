import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProductsAndKPI from '@salesforce/apex/dIFormulaController.getProductsAndKPI';
import getKpiTargetAndPayouts from '@salesforce/apex/dIFormulaController.getKpiTargetAndPayouts';
import getDealerIncentives from '@salesforce/apex/dIFormulaController.getDealerIncentives';
import saveKpiAchievements from '@salesforce/apex/dIFormulaController.saveKpiAchievements';
import getKPIAchivementsByDealers from '@salesforce/apex/dIFormulaController.getKPIAchivementsByDealers';
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/writeexcelfile";
import sheetjs from '@salesforce/resourceUrl/sheetmin';
import getProductsAndSubCategories from '@salesforce/apex/dIFormulaController.getProductsAndSubCategories';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';
import getSlabInfos from '@salesforce/apex/dIFormulaController.getSlabInfos';

let XLS = {};

export default class DIActualAchievement extends LightningElement {

    @track dealers;
    @track productkpi;
    @track kpiTargetsAndPayouts;
    @track achievements = [];
    @track isReadOnly = true;
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
    @track KpiInputValue = 0;
    @track standardColumnsInExcel = 3;
    @track noOfColumnsInExcel = new Set();
    @track table;
    @track accountIds = [];
    @track productsAndSubCategoriesList = [];
    @track product;
    @track productId;
    @track recordsToSave = [];
    @track KPIAChievements = [];
    @track accountIdsSet = new Set();
    @track previousDealerWiseEdit = null;
    @track showRecords = false;
    @track hideRecords = false;
    @track dealerNotification = "";
    @track disableImport = true;
    @track tempDealers = [];
    @track excelFormat = [];
    @track file = [];
    @track slabInfos = [];

    @api showDownloadUpload = false;
    @api month;
    @api year;
    @api productName;

    inputData = {};
    objects = [];
    sheetNames = [];
    objectArray = [];
    count = 1;

    connectedCallback() {
        this.isLoading = true;
        this.getProductsAndSubCategories();
        this.getKpiTargetAndPayouts();
    }

    @api handleRow(productName) {
        this.isLoading = true;
        this.productName = productName;
        this.getKpiTargetAndPayouts();
        this.isReadOnly = true;
        this.isEdit = true;
        this.isFooter = false;
    }

    getProductsAndSubCategories() {
        getProductsAndSubCategories()
            .then(result => {
                this.productsAndSubCategoriesList = result;
                this.product = this.productsAndSubCategoriesList.find(product => product?.Name == this.productName);
                this.productId = this.product?.Id;
                this.productName = this.productsAndSubCategoriesList[0]?.Name;
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    getKpiTargetAndPayouts() {
        getKpiTargetAndPayouts({ month: this.month, year: this.year, productName: this.productName })
            .then(result => {
                this.kpiTargetsAndPayouts = result;
                this.getSlabInfos();
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    getSlabInfos() {
        getSlabInfos({ month: this.month, year: this.year, productName: this.productName })
            .then(result => {
                this.slabInfos = result;
                this.kpiTargetsAndPayouts = [...this.kpiTargetsAndPayouts, ...this.slabInfos];
                if (this.kpiTargetsAndPayouts?.length > 0) {
                    this.getProductsAndKPI();
                    this.showRecords = true;
                    this.hideRecords = false;
                    this.dealerNotification = "";
                }
                else {
                    this.isLoading = false;
                    this.showRecords = false;
                    this.hideRecords = true;
                    this.dealerNotification = `For this month of ${this.month} ${this.year} KPI Target and Payout are not Configured for the "${this.productName}" product.`;
                }
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    getProductsAndKPI() {
        getProductsAndKPI()
            .then(result => {
                this.productkpi = result;
                this.getAchievementList();
            })
            .catch(error => {
                this.isLoading = false;
            });
    }

    getAchievementList() {
        this.achievements = [];
        this.kpis = this.productkpi[this.productName].filter(kpi => {
            return this.kpiTargetsAndPayouts.some(kpiTarget => kpiTarget.DI_Product_KPI__c === kpi.Id);
        });
        if (this.kpis?.length > 0) {
            this.getDealerIncentives();
            for (let i = 0; i < this.kpis?.length; i++) {
                let kpidata = {};
                kpidata.name = this.kpis[i].KPI__r.Name + " Achievement";
                kpidata.Id = this.kpis[i].Id;
                this.achievements.push(kpidata);
            }
            this.showRecords = true;
            this.hideRecords = false;
            this.dealerNotification = "";
        }
        else {
            this.achievements = [];
            this.isLoading = false;
            this.showRecords = false;
            this.hideRecords = true;
            this.dealerNotification = `For this month of ${this.month} ${this.year} KPI Target and Payout are not Configured for the "${this.productName}" product.`;
        }

        if (this.kpis?.length == undefined) {
            this.toast(`${this.productName} has No KPI. Choose other product to configure KPI Achievements`, 'info');
        }
    }

    getDealerIncentives() {
        this.dealers = [];
        getDealerIncentives({ month: this.month, year: this.year, search: this.searchDealer, productName: this.productName })
            .then(result => {
                this.dealers = result;
                this.tempDealers = result;
                if (this.dealers?.length > 0 && this.dealers[0]?.DI_Product_Target_and_Achievements__r) {
                    this.formatExcel();
                    this.getKPIAchivementsByDealers();
                    this.dealerNotification = "";
                    this.showRecords = true;
                    this.hideRecords = false;
                } else {
                    this.isLoading = false;
                    this.showRecords = false;
                    this.hideRecords = true;
                    this.dealerNotification = `For this month of ${this.month} ${this.year} Retail Target is Not Configured.`;
                }
            })
            .catch(error => {
                this.isLoading = false;
            });
    }
    formatExcel() {
        this.excelFormat = [];
        this.dealers?.forEach((dealer, index) => {
            let format = {};
            format['S.No'] = index + 1;
            format['Id'] = dealer?.Id;
            format['Dealer Name'] = dealer?.Dealer_Account__r?.Name;
            this.achievements?.forEach(achievement => {
                format[achievement?.name] = 0;
            });
            this.excelFormat.push(format);
        });
    }

    getKPIAchivementsByDealers() {
        getKPIAchivementsByDealers({ month: this.month, year: this.year, productName: this.productName, accountIds: this.accountIds }).then(result => {
            this.KPIAChievements = result;
            setTimeout(() => {
                this.setKPIachievements();
            }, 50);
        }).catch(error => {
            this.isLoading = false;
        });
    }

    setKPIachievements() {
        this.KPIAChievements.forEach(achievement => {
            let achieveId = achievement?.Product_KPI__c;
            let dealerId = achievement?.DI_Product_Target_and_Achivement__r?.Dealer_Incentive__c;
            let dealerAchieveElement = this.template.querySelectorAll(`lightning-input[data-dealerid = "${dealerId}"][data-achid = "${achieveId}"]`);
            if (dealerAchieveElement) {
                dealerAchieveElement.forEach(element => {
                    if (element?.dataset?.achid == achieveId && element?.dataset?.dealerid == dealerId) {
                        element.value = parseFloat(achievement?.Achieved_KPI_Perncentage__c) || 0;
                        element.dataset.value = parseFloat(achievement?.Achieved_KPI_Perncentage__c) || 0;
                        element.dataset.recordid = achievement.Id;
                        let achievementUpdate = this.excelFormat.find(dealer => dealer['Id'] == dealerId);
                        if (achievementUpdate) {
                            achievementUpdate[element?.dataset?.achievementname] = parseFloat(achievement?.Achieved_KPI_Perncentage__c) || 0;
                        }
                    }
                });
            }
            else {
            }
        });
        this.isLoading = false;
    }

    handleInputChange(event) {
        if (event) {
            let dealerid = event?.target?.dataset?.dealerid;
            let achieveId = event?.target?.dataset?.achid;
            let accountId = event?.target?.dataset?.accountid;
            if (event?.target?.value >= 1) {
                event.target.value = event.target.value.replace(/^0+/, '') || 0;
            }
        }
        this.isFooter = true;
        this.disableParent();
        this.isDisableCancel = false;
        this.isDisableSave = false;
    }

    handleInput(event) {
        event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    }

    handleKeyPress(event) {
        if (event.key.match(/[^0-9.]/)) {
            event.preventDefault();
        }
        if (event.key == '.' && event.target.value.includes('.')) {
            event.preventDefault();
        }
    }

    handlePaste(event) {
        const clipboardData = event.clipboardData?.getData('text');
        if (clipboardData?.match(/[^0-9.]/)) {
            event.preventDefault();
        }
    }

    handleCellClick(event) {
        let dealerid = event.target.dataset.dealerid;
        let achieveId = event.target.dataset.achid;
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

    disableCellEdit() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.readOnly = true;
        });
    }

    handleSearchClick() {
        if (!this.isDealerSearch) {
            this.dealers = this.tempDealers;
            setTimeout(() => {
                this.setKPIachievements();
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
            this.setKPIachievements();
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
            this.isDisableCancel = true;
            this.isDisableSave = true;
            this.disableCellEdit();
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
        this.accountIds = [];
        this.accountIdsSet.clear();
        this.disableCellEdit();
        this.getKPIAchivementsByDealers();
    }

    handleSave() {
        this.isLoading = true;
        const inputData = this.template.querySelectorAll('lightning-input');
        this.recordsToSave = [];
        inputData.forEach(input => {
            let dealerid = input.dataset?.dealerid;
            let achieveId = input.dataset?.achid;
            let value = parseFloat(input?.value) || 0;
            let recordId = input.dataset?.recordid;
            let accountId = input.dataset?.accountid;
            if (value != input.dataset?.value) {
                this.accountIdsSet.add(accountId);
            }
            if (!this.inputData[dealerid]) {
                this.inputData[dealerid] = {};
            }
            this.inputData[dealerid][achieveId] = value;
            let pushingData = {
                Product_KPI__c: achieveId,
                Achieved_KPI_Perncentage__c: value,
            };
            if (recordId) {
                pushingData.Id = recordId;
            }
            let checkPushingData = this.dealers.find(element => element.Id == dealerid);
            if (checkPushingData && checkPushingData.DI_Product_Target_and_Achievements__r && checkPushingData.DI_Product_Target_and_Achievements__r.length > 0) {
                pushingData.DI_Product_Target_and_Achivement__c = checkPushingData.DI_Product_Target_and_Achievements__r[0].Id;
            }
            this.recordsToSave.push(pushingData);
        });
        this.saveKpiAchievements();
        this.askConfirmation = false;
    }

    saveKpiAchievements() {
        this.accountIds = [...this.accountIdsSet];
        saveKpiAchievements({ inputData: this.recordsToSave, month: this.month, year: this.year, productName: this.productName, accountIds: this.accountIds })
            .then(result => {
                this.isEdit = true;
                this.isFooter = false;
                this.isReadOnly = true;
                this.isDisableSave = true;
                this.disableCellEdit();
                this.getTargetsAndPayouts();
                this.getKPIAchivementsByDealers();
                this.file = [];
                this.excelData = [];
                this.accountIds = [];
                this.accountIdsSet.clear();
                this.toast(`${this.month} - ${this.year} Achievements Has Been Successfully Saved !!!`, 'success');
                this.disableParent();
            })
            .catch(error => {
                this.toast(`Warning: Unable to Save the ${this.month} - ${this.year} Achievements.`, 'error');
                this.isLoading = false;
            });
    }

    // getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     getTargetsAndPayouts({month : this.month, year : this.year, dealerIds : dealerIds, isActual : true}).then(res => {
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
                fileName: `Achievement_Template_${this.month}_${this.productName}.xlsx`,
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
            this.toast(`For this month of ${this.month} ${this.year} Retail Target or KPI Target is not configured for "${this.productName}" Product.`, 'info');
            this.closeDownloadUploadModal();
        }
    }

    openfileUpload(event) {
        this.file = event?.target?.files[0];
        let isCurrentProductFile = this.file?.name.toLowerCase().includes(this.productName.toLowerCase()) && this.file?.name.toLowerCase().includes(this.month.toLowerCase());
        if (isCurrentProductFile) {
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
            this.toast(`Warning: The Uploaded File "${this.file?.name}" is not for "${this.productName}" Product in "${this.month}" month. Please upload the correct template.`, 'error');
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
        for (const key in this.achievements) {
            let achieve = {
                column: this.achievements[key].name,
                type: String,
                align: "center",
                width: 35,
                wrap: true,
                value: ele => null,
                borderColor: '#000000'
            }
            columns_Array.push(achieve);
        }

        columns_Array.push({ column: 'Id', type: String, value: ele => ele.Id, align: "center", width: 20, borderColor: '#000000', backgroundColor: '#C3C5C8' });
        this.objectArray.push(columns_Array);
        this.objects.push(this.dealers);
        this.sheetNames.push(this.productName);
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
                columnsArray.push({ column: header, type: Number, value: ele => ele[header], align: "center", width: 35, borderColor: '#000000', wrap: true });
            }
        })
        this.objectArray.push(columnsArray);
        this.objects.push(this.excelFormat);
        this.sheetNames.push(this.productName);
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
                var rowDealerId = ProductRows[i].Id;
                const inputs = this.template.querySelectorAll(`lightning-input[data-dealerid="${rowDealerId}"]`);
                inputs.forEach(input => {
                    var achievementName = input?.dataset?.achievementname;
                    var achievementValue = ProductRows[i][achievementName];
                    const achievementInput = this.template.querySelector(`lightning-input[data-dealerid = "${rowDealerId}"][data-achievementname = "${achievementName}"]`);
                    if (achievementValue != null && achievementInput && achievementInput.value >= 0) {
                        achievementInput.value = parseFloat(achievementValue) || 0;
                    }
                })
            }
        }
        this.isReadOnly = false;
        this.isFooter = true;
        this.disableParent();
        this.isDisableCancel = false;
        this.isDisableSave = false;
        this.disableImport = true;
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

    disableParent() {
        const disable = new CustomEvent('disableparent', {
            detail: { commonDisable: this.isFooter, isTabVisible: false }
        });
        this.dispatchEvent(disable);
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }
}