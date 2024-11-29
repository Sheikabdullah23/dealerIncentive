import { LightningElement, track, api } from 'lwc';
import saveSalesmanIncentive from '@salesforce/apex/dIFormulaController.saveSalesmanIncentive';
import saveIndustryIncentive from '@salesforce/apex/dIFormulaController.saveIndustryIncentive';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteRecordInDatabase from '@salesforce/apex/dIFormulaController.deleteRecordInDatabase';
import getTargetsAndPayouts from '@salesforce/apex/dIFormulaController.getTargetsAndPayouts';
import { getDealerTargetsAndPayouts } from 'c/jCBActualIncentiveCalc';

export default class DISalemanIncentiveConfigModal extends LightningElement {

    @api kpiData;
    @api kpiIndex;
    @api salesPersonIncentive = [];
    @api industryVolumeIncentive = [];
    @track selectedKPITarget = [];
    @api isSales;
    @api month;
    @api year;
    @api isIndustry;
    productSalesPersonIncentive;
    slabIds = [];
    @api configureSalesIndustryIncentive = [];
    @track setHeadingName;
    @api productName;

    connectedCallback() {
        if (this.isIndustry == 'Industry') {
            this.setHeadingName = 'Configure Volume Industry Incentive (' + this.productName + ' Variable Incentive Payout%)';
            this.getIndustryIncentive();
        } else {
            this.setHeadingName = 'Configure Salesperson Incentive';
            this.getSalesmanIncentiveData();
        }
    }

    getIndustryIncentive() {
        this.selectedKPITarget = JSON.parse(JSON.stringify(this.kpiData));
        let tivSlab = this.selectedKPITarget[this.kpiIndex].slabInfo.filter(ele => ele.slabType == 'Total Volume Industry Incentive');
        if (tivSlab?.length > 0) {
            var industryVolume = this.selectedKPITarget[this.kpiIndex];
            let kpiTarget = {};
            kpiTarget.recordId = industryVolume.recordId;
            kpiTarget.type = this.typeName;
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = true;
            kpiTarget.kpiName = industryVolume.productKPI.kpiName;
            kpiTarget.kpiId = industryVolume.kpiId;
            kpiTarget.kpiTargetName = industryVolume.kpiTargetName;
            kpiTarget.incentiveSlabs = [];
            if (industryVolume.slabInfo && industryVolume.slabInfo.length > 0) {
                let slabInfo = industryVolume.slabInfo?.length > 0 ? industryVolume.slabInfo.filter(element => element.slabType == 'Total Volume Industry Incentive') : [];
                kpiTarget.hasSlabs = true;
                kpiTarget.isSlab = true;
                for (let k = 0; k < slabInfo.length; k++) {
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
                    } else {
                        slab.className = 'slds-size_1-of-5';
                        slab.rangeSlab = slabInfo[k].slabRange + '%';
                        slab.isSingle = true;
                        slab.isStartEnd = false;
                        let ranges = slabInfo[k].slabRange.split(' ');
                        slab.rangeStart = ranges[0];
                        slab.rangeStartPercent = ranges[1];
                    }
                    slab.incentive = 'Incentive Percentage';
                    slab.incentiveSymbol = '%';
                    slab.incentiveValue = slabInfo[k].payoutPercentage;
                    kpiTarget.incentiveSlabs.push(slab);
                }
            }
            this.industryVolumeIncentive.push(kpiTarget);
            this.configureSalesIndustryIncentive = this.industryVolumeIncentive;
        }
        else {
            let kpiTarget = {};
            kpiTarget.recordId = this.selectedKPITarget[this.kpiIndex].recordId;
            kpiTarget.hasSlabs = false;
            kpiTarget.type = this.typeName;
            kpiTarget.incentiveSlabs = [{ id: 1, isSingle: true, rangeStart: '', rangeStartPercent: '', incentiveValue: '', incentive: 'Incentive Percentage', incentiveSymbol: '%' }];
            kpiTarget.isSlab = true;
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = true;
            kpiTarget.productKPI = this.selectedKPITarget[this.kpiIndex].productKPI;
            kpiTarget.kpiName = this.selectedKPITarget[this.kpiIndex].productKPI.kpiName;
            kpiTarget.kpiId = this.selectedKPITarget[this.kpiIndex].kpiId;
            kpiTarget.kpiTargetName = this.selectedKPITarget[this.kpiIndex].kpiTargetName;
            kpiTarget.salesCoverage = {};
            this.industryVolumeIncentive.push(kpiTarget);
            this.configureSalesIndustryIncentive = this.industryVolumeIncentive;
            this.selectedKPITarget[this.kpiIndex].industryVolumeIncentive = this.configureSalesIndustryIncentive;
        }
    }

    getSalesmanIncentiveData() {
        this.selectedKPITarget = JSON.parse(JSON.stringify(this.kpiData));
        if (this.selectedKPITarget[this.kpiIndex].salesPersonTarget != null) {
            var salesperson = this.selectedKPITarget[this.kpiIndex];
            let kpiTarget = {};
            kpiTarget.recordId = salesperson.recordId;
            kpiTarget.type = this.typeName;
            kpiTarget.isRange = salesperson.target != null;
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = true;
            kpiTarget.kpiName = salesperson.productKPI.kpiName;
            kpiTarget.kpiId = salesperson.kpiId;
            kpiTarget.kpiTargetName = salesperson.kpiTargetName;
            kpiTarget.incentiveSlabs = [];
            if (salesperson.slabInfo && salesperson.slabInfo.length > 0) {
                let slabInfo = salesperson.slabInfo?.length > 0 ? salesperson.slabInfo.filter(element => element.slabType == 'Salesperson Incentive') : [];
                kpiTarget.hasSlabs = true;
                kpiTarget.isSlab = true;
                for (let k = 0; k < slabInfo.length; k++) {
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
                    } else if (slabInfo[k].payoutMode == 'Percent') {
                        slab.incentive = 'Incentive Percentage';
                        slab.incentiveSymbol = '%';
                        slab.incentiveValue = slabInfo[k].payoutPercentage;
                        slab.incentiveRadio = slabInfo[k].payoutMode;
                    } else {
                        slab.incentive = 'Incentive Percentage';
                        slab.incentiveRadio = 'Percent';
                        slab.incentiveValue = 'Pro-rata-basis';
                        slab.proRataIncentive = true;
                        slab.disableIncentive = true;
                    }
                    kpiTarget.incentiveSlabs.push(slab);
                }
            }
            var salesCoverage = {};
            let ranges = salesperson.salesPersonTarget.split(' ');
            salesCoverage.coverageRange = ranges[0];
            salesCoverage.coverageInput = ranges[1];
            kpiTarget.salesCoverage = salesCoverage;
            this.salesPersonIncentive.push(kpiTarget);
            this.configureSalesIndustryIncentive = this.salesPersonIncentive;
        } else {
            let kpiTarget = {};
            kpiTarget.recordId = this.selectedKPITarget[this.kpiIndex].recordId;
            kpiTarget.hasSlabs = false;
            kpiTarget.type = this.typeName;
            kpiTarget.incentiveSlabs = [];
            kpiTarget.incentiveRange = {};
            kpiTarget.isSlab = true;
            kpiTarget.isRange = false;
            kpiTarget.showContainer = true;
            kpiTarget.callComponent = true;
            kpiTarget.productKPI = this.selectedKPITarget[this.kpiIndex].productKPI;
            kpiTarget.kpiName = this.selectedKPITarget[this.kpiIndex].productKPI.kpiName;
            kpiTarget.kpiId = this.selectedKPITarget[this.kpiIndex].kpiId;
            kpiTarget.kpiTargetName = this.selectedKPITarget[this.kpiIndex].kpiTargetName;
            kpiTarget.salesCoverage = {};
            this.salesPersonIncentive.push(kpiTarget);
            this.configureSalesIndustryIncentive = this.salesPersonIncentive;
            this.selectedKPITarget[this.kpiIndex].salesPersonIncentive = this.configureSalesIndustryIncentive;
        }
    }

    handleSalesSave() {
        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
            this.configureSalesIndustryIncentive = this.template.querySelector('c-d-i-product-formula-edit-page').getKpiTarget();
            if (this.isIndustry == 'Industry') {
                this.industryVolumeIncentive = this.configureSalesIndustryIncentive;
                for (let i = 0; i < this.industryVolumeIncentive[0].incentiveSlabs.length; i++) {
                    this.industryVolumeIncentive[0].incentiveSlabs[i].slabType = 'Total Volume Industry Incentive';
                }
            } else {
                this.salesPersonIncentive = this.configureSalesIndustryIncentive;
                for (let i = 0; i < this.salesPersonIncentive[0].incentiveSlabs.length; i++) {
                    this.salesPersonIncentive[0].incentiveSlabs[i].slabType = 'Salesperson Incentive';
                }
            }
        }
        let isValid = this.requiredCheck();
        if (isValid) {
            this.prepareSalesmanIncentive();
            this.saveSalesKPITarget();
        } else {
            let validToSave = this.template.querySelector('c-d-i-product-formula-edit-page').getValidToSave();
        }
    }

    prepareSalesmanIncentive() {
        this.productSalesPersonIncentive = {};
        if (this.isIndustry == 'Industry') {
            var indTarget = this.industryVolumeIncentive[0];
            let ind = {};
            ind.recordId = indTarget.recordId;
            ind.isIndustryIncentive = true;
            ind.slabInfo = [];
            if (indTarget.incentiveSlabs && indTarget.incentiveSlabs.length > 0) {
                ind.hasSlabs = true;
                indTarget.incentiveSlabs.forEach(slab => {
                    if (slab.isSingle) {
                        slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent;
                    } else if (slab.isStartEnd) {
                        slab.slabRange = slab.rangeStart + ' ' + slab.rangeStartPercent + ' to ' + slab.rangeEnd + ' ' + slab.rangeEndPercent;
                    }
                    slab.payoutMode = slab.incentiveRadio;
                    slab.payoutPercentage = slab.incentiveValue;
                    ind.slabInfo.push(slab);
                });
                ind.hasSlabs = true;
            } else if (indTarget.showKPI) {
                if (indTarget.incentiveRange) {
                    var range = indTarget.incentiveRange;
                    if (!indTarget.isSlab) {
                        if (range.isSingle == true) {
                            ind.target = range.singleRange + ' ' + range.singlePercent;
                        } else if (range.isStart) {
                            ind.target = range.startRange + ' ' + range.startPercent + ' to ' + range.endRange + ' ' + range.endPercent;
                        }
                        ind.hasSlabs = false;
                        ind.slabInfo = [];
                    }
                }
            }
            if (((ind.slabInfo.length > 0 || ind.target) && ind.recordId == null) || ind.recordId) {
                this.productSalesPersonIncentive = ind;
            }
        } else {
            var kpiTarget = this.salesPersonIncentive[0];
            let kpi = {};
            kpi.recordId = kpiTarget.recordId;
            kpi.salesPersonTarget = kpiTarget.salesCoverage.coverageRange + ' ' + kpiTarget.salesCoverage.coverageInput;
            kpi.isSalesmanIncentive = kpiTarget.salesCoverage != null ? true : false;
            if (kpiTarget.incentiveSlabs.length == 0) {
                kpi.salesPersonTarget = '';
            }
            kpi.slabInfo = [];
            if (kpiTarget.incentiveSlabs && kpiTarget.incentiveSlabs.length > 0) {
                kpi.hasSlabs = true;
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
                    kpi.slabInfo.push(slab)
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
            if (((kpi.slabInfo.length > 0 || kpi.target) && kpi.recordId == null) || kpi.recordId) {
                this.productSalesPersonIncentive = kpi;
            }
        }
    }

    saveSalesKPITarget() {
        if (this.isIndustry == 'Industry') {
            saveIndustryIncentive({ industryKPITarget: this.productSalesPersonIncentive })
                .then(result => {
                    this.toast('Configurations has been saved successfully !', 'success');
                    this.getTargetsAndPayouts();
                    this.getIndustryIncentive();
                    this.showSalesCloseModal();
                    const saveEvent = new CustomEvent('closemodal', {
                        detail: 'save'
                    });
                    this.dispatchEvent(saveEvent);
                }).catch(error => {

                })
        } else {
            saveSalesmanIncentive({ salesKPITarget: this.productSalesPersonIncentive })
                .then(result => {
                    this.toast('Configurations has been saved successfully !', 'success');
                    this.getTargetsAndPayouts();
                    this.getSalesmanIncentiveData();
                    this.showSalesCloseModal();
                    const saveEvent = new CustomEvent('closemodal', {
                        detail: 'save'
                    });
                    this.dispatchEvent(saveEvent);
                }).catch(error => {

                })
        }

    }

    // getTargetsAndPayouts() {
    //     let dealerIds = [];
    //     getTargetsAndPayouts({ month: this.month, year: this.year, dealerIds: dealerIds, isActual: false }).then(res => {
    //         getDealerTargetsAndPayouts(res);
    //     }).catch(error => {
    //         console.error('get targets error ====    ', error);
    //     })
    // }

    async getTargetsAndPayouts() {
        try {
            let dealerIds = [];

            const res = await getTargetsAndPayouts({
                month: this.month,
                year: this.year,
                dealerIds: dealerIds,
                isActual: false
            });

            if (res?.dealerIncIds?.length > 0) {
                const message = await getDealerTargetsAndPayouts(res);

                if (message === 'SUCCESS') {
                    this.toast('New configurations have been saved, and the payouts have been recalculated successfully!.', 'success');
                } else {
                    this.toast('An error occurred while recalculating the payouts.', 'error');
                }
            } else {
                this.recalculateLoading = false;
            }
        } catch (error) {
            console.error('get targets error:', error);
            this.toast('An error occurred while fetching targets.', 'error');
        }
    }

    requiredCheck() {
        let isValid = true;
        let prodKPI = this.salesPersonIncentive[0];
        let prodIndKPI = this.industryVolumeIncentive[0];
        if (this.isIndustry == 'Industry') {
            if (prodIndKPI.isSlab) {
                if (prodIndKPI.incentiveSlabs.length == 0) {
                    this.toast('Please Add Slabs', 'error');
                    isValid = false;
                }
                for (let k = 0; k < prodIndKPI.incentiveSlabs.length; k++) {
                    let slab = prodIndKPI.incentiveSlabs[k];
                    if (slab.isSingle) {
                        if (!(slab.rangeStart && slab.rangeStartPercent && slab.incentiveValue)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    } else if (slab.isStartEnd) {
                        if (!(slab.rangeStart && slab.rangeStartPercent && slab.rangeEnd && slab.rangeEndPercent && slab.incentiveValue)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    }
                }
            }
        } else {
            if (prodKPI.isSlab) {
                if (prodKPI.incentiveSlabs.length == 0) {
                    this.toast('Please Add Slabs', 'error');
                    isValid = false;
                }
                for (let k = 0; k < prodKPI.incentiveSlabs.length; k++) {
                    let slab = prodKPI.incentiveSlabs[k];
                    if (slab.isSingle) {
                        if (!(slab.rangeStart && slab.rangeStartPercent && slab.incentiveValue && slab.incentiveRadio)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    } else if (slab.isStartEnd) {
                        if (!(slab.rangeStart && slab.rangeStartPercent && slab.rangeEnd && slab.rangeEndPercent && slab.incentiveValue && slab.incentiveRadio)) {
                            this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                            isValid = false;
                            break;
                        }
                    }
                }
                if (prodKPI.salesCoverage) {
                    if (!(prodKPI.salesCoverage.coverageRange && prodKPI.salesCoverage.coverageInput)) {
                        this.toast('Required fields are missing. Please complete all fields and try again.', 'error');
                        isValid = false;
                    }
                }
            }
        }
        if (isValid) {
            this.slabs = [];
            if (this.isIndustry == 'Industry') {
                if (prodIndKPI.callComponent) {
                    for (let j = 0; j < prodIndKPI.incentiveSlabs?.length; j++) {
                        let slab = {};
                        let temp = prodIndKPI.incentiveSlabs[j];
                        slab = { id: temp.id, startCondition: temp.rangeStart, minValue: temp.rangeStartPercent, endCondition: temp.rangeEnd, maxValue: temp.rangeEndPercent };
                        this.slabs.push(slab);
                    }
                    this.validateSlabs();
                }
            } else {
                if (prodKPI.callComponent) {
                    for (let j = 0; j < prodKPI.incentiveSlabs?.length; j++) {
                        let slab = {};
                        let temp = prodKPI.incentiveSlabs[j];
                        slab = { id: temp.id, startCondition: temp.rangeStart, minValue: temp.rangeStartPercent, endCondition: temp.rangeEnd, maxValue: temp.rangeEndPercent };
                        this.slabs.push(slab);
                    }
                    this.validateSlabs();
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
                        this.errorMessage = `Error: Overlap detected between Slab ${ranges[i].id} and Slab ${ranges[j].id} conditions. Please review the errors and try saving again.`;
                        if (this.template.querySelector('c-d-i-product-formula-edit-page')) {
                            let showError = this.template.querySelector('c-d-i-product-formula-edit-page').slabValidation(ranges[i].id, ranges[j].id);
                        }
                        return;
                    }
                }
            }
            this.successMessage = 'Slab validation completed successfully. No overlaps detected between the conditions in the slabs.';
        }
    }

    validateEndRange() {
        let status = '';
        this.slabs.forEach(slab => {
            if (slab.hasOwnProperty('minValue') && slab.hasOwnProperty('maxValue') && slab.minValue !== '' && slab.maxValue !== '') {
                if (parseFloat(slab.minValue) > parseFloat(slab.maxValue)) {
                    status = `Error in Slab ${slab.id}!!! End range must be greater than Start Range. Start (${slab.minValue}%) & End (${slab.maxValue}%)`;
                }
                else {
                    status = '';
                }
            }
        });
        return status;
    }

    rangesOverlap(range1, range2) {
        return range1.start <= range2.end && range1.end >= range2.start;
    }

    showSalesCloseModal() {
        const sendDataEvent = new CustomEvent('closemodal', {
            detail: false,
        });
        this.dispatchEvent(sendDataEvent);
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    handleSlabInfo(event) {
        this.slabIds.push(event.detail.id);
        if (this.slabIds?.length > 0) {
            let chunkedList = this.chunkArray(this.slabIds, 100);
            deleteRecordInDatabase({ deleteIds: chunkedList })
                .then(res => {
                    this.slabIds = [];
                }).catch(err => { })
            var salesPersonDelete = this.selectedKPITarget[this.kpiIndex];
            if (salesPersonDelete.kpiId == event.detail.kpiId) {
                for (let j = 0; j < salesPersonDelete.slabInfo.length; j++) {
                    if (salesPersonDelete.slabInfo[j].slabId == event.detail.id) {
                        salesPersonDelete.slabInfo.splice(j, 1);
                    }
                }
            }
        }
    }

    chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr?.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }
}