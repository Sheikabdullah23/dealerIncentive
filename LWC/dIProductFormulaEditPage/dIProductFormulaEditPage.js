import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DIProductFormulaEditPage extends LightningElement {
    @api sendData;
    @api salesData;
    @api product = [];
    @track productKpiIncentive = [];
    @track parentIndex;
    @track childIndex;
    @api targets;
    productKPISlabsTarget = {};
    @api width;
    @track selectedKPITarget = [];
    @track isThIncen = false;
    @track showIcon = true;
    @track thIncentive = false;
    @api incentiveName;
    @track showTargetType = false;
    @track showAddSlab = false;
    @track forAddIncentive = false;
    @track enablePayoutMode = false;
    @track showDate = false;
    @api prevYearVal;
    @api isSales;
    @track sales = false;
    @api prevMonthVal;
    getName;
    selectedIndex;
    selectedRangeIndex;
    selectedKpId;
    selectedSlabId;
    @track growthIncentive = false;
    @track multipleKpi = false;
    @track isEditedOrChanged = false;
    @track startValue = '';
    @track endValue = '';
    showErrorMessage = false;
    @track swapRange = false;
    @track achievePercentage;
    @track showDeleteForSlabInfo = false;
    @api isIndus;
    @track sizeEdit = "slds-size_3-of-12";

    @api getKpiTarget() {
        return this.selectedKPITarget;
    }

    @api getValidToSave() {
        const fields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        fields.forEach(inputCmp => {
            if ((inputCmp.value == null || inputCmp.value == '' || inputCmp.value == '.') && inputCmp.name != 'proRata') {
                inputCmp.classList.add('slds-has-error');
            }
        });
        return 'Required Fields are Missing';
    }

    get optionsRange() {
        return [{ label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Equal to', value: '==' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' },
        ];
    }

    get optionsIncentiveRange() {
        return [
            { label: 'Greater than', value: '>' },
            { label: 'Greater than or equal to', value: '>=' },
            { label: 'Equal to', value: '==' },
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

    @track endRangeOptions = [
        { label: 'Greater than', value: '>' },
        { label: 'Less than', value: '<' },
        { label: 'Equal to', value: '==' },
        { label: 'Greater than or equal to', value: '>=' },
        { label: 'Less than or equal to', value: '<=' },
    ];

    get incentiveOptions() {
        return [
            { label: 'Percentage', value: 'Percent' },
            { label: 'Amount', value: 'Amt' },
        ];
    }

    toast(title, toastType) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: toastType
        })
        this.dispatchEvent(toastEvent)
    }

    connectedCallback() {
        if (this.width == "Add") {
            setTimeout(() => {
                let setWidthCard = this.template.querySelector('.noneWidth');
                setWidthCard.classList.toggle('setWidth');
                setWidthCard.classList.remove('noneWidth');
                if (this.selectedKPITarget[0].incentiveSlabs.length > 0) {
                    let setMarginCard1 = this.template.querySelectorAll('.noneMargin');
                    setMarginCard1.forEach(margin => {
                        margin.classList.toggle('setMargin');
                        margin.classList.remove('noneMargin');
                    })
                }
            }, 1000);
            this.forAddIncentive = true;
            this.enablePayoutMode = true;
            if (this.incentiveName == 'growth') {
                this.showDate = true;
                var d = new Date();
                var pastYear = d.getFullYear() - 1;
                this.prevYearVal = pastYear;
                setTimeout(() => {
                    if (this.selectedKPITarget[0].incentiveSlabs.length > 0) {
                        let setMarginCard1 = this.template.querySelectorAll('.noneleft');
                        setMarginCard1.forEach(margin => {
                            margin.classList.toggle('setLeft');
                            margin.classList.remove('noneleft');
                        })

                    }
                }, 5);
            } else {
                this.showDate = false;
            }
        } else if (this.width == 'ratio') {
            this.sizeEdit = "slds-size_3-of-12 configPage";
            setTimeout(() => {
                if (this.selectedKPITarget[0].incentiveSlabs.length > 0) {
                    let setMarginCard1 = this.template.querySelectorAll('.noneMargin');
                    setMarginCard1.forEach(margin => {
                        margin.classList.toggle('setMargin');
                        margin.classList.remove('noneMargin');
                    })
                }
            }, 1000);
            this.forAddIncentive = true;
            this.enablePayoutMode = true;
            this.showAddSlab = true;
        }
        else {
            if (this.isSales || this.isIndus == 'Industry') {
                this.enablePayoutMode = true;
                this.showAddSlab = true;
                setTimeout(() => {
                    let setMarginCard1 = this.template.querySelectorAll('.noneMargin');
                    setMarginCard1.forEach(margin => {
                        margin.classList.toggle('setMargin');
                        margin.classList.remove('noneMargin');
                    })
                }, 5);
            }
        }
        this.sales = this.isSales ? this.isIndus == 'Industry' ? false : true : false;
        this.productKpiIncentive = JSON.parse(JSON.stringify(this.sendData));
        this.selectedKPITarget = JSON.parse(JSON.stringify(this.sendData));
        // if (this.selectedKPITarget.length > 0 && this.selectedKPITarget[0].productName == 'TH' && this.width == "Add" && this.selectedKPITarget[0].incentiveRange != undefined) {
        //     if (this.selectedKPITarget[0].incentiveRange.isSingle == true && this.selectedKPITarget[0].incentiveRange.singleRange == '==') {
        //         this.thIncentive = true;
        //         this.selectedKPITarget[0].showMessage = true;
        //         this.selectedKPITarget[0].showTargetMessage = false;
        //         this.achievePercentage = this.selectedKPITarget[0].incentiveRange.singlePercent;
        //         for(let i=0; i<this.selectedKPITarget[0].additionalTHIncentive?.length; i++){
        //             if(this.selectedKPITarget[0].additionalTHIncentive[i].volume == '=='){
        //                 this.selectedKPITarget[0].showButton = true;
        //             }
        //         }
        //     }

        // }
        for (let i = 0; i < this.selectedKPITarget.length; i++) {
            if (this.selectedKPITarget[i].isSlab == false) {
                if (!(this.selectedKPITarget[i].incentiveRange != null && (this.selectedKPITarget[i].incentiveRange.isSingle || this.selectedKPITarget[i].incentiveRange.isStart))) {
                    this.selectedKPITarget[i].isRange = true;
                    this.selectedKPITarget[i].incentiveRange = {};
                    this.selectedKPITarget[i].incentiveRange.isSingle = true;
                }
            }
            if (this.selectedKPITarget[i].productName == 'TH' && this.width == "Add" && this.selectedKPITarget[i].incentiveRange != undefined) {
                if (this.selectedKPITarget[i].incentiveRange.isSingle == true && this.selectedKPITarget[i].incentiveRange.singleRange == '==') {
                    this.selectedKPITarget[i].thIncentive = true;
                    this.selectedKPITarget[i].showMessage = true;
                    this.selectedKPITarget[i].showTargetMessage = false;
                    this.achievePercentage = this.selectedKPITarget[i].incentiveRange.singlePercent;
                    for (let j = 0; j < this.selectedKPITarget[i].additionalTHIncentive?.length; j++) {
                        if (this.selectedKPITarget[i].additionalTHIncentive[j].volume == '==') {
                            this.selectedKPITarget[i].showButton = true;
                        }
                    }
                }
            }
        }
    }

    handleSalesInput(event) {
        var value = event.target.value;
        var index = event.target.dataset.index;
        var name = event.target.name;
        var coverage = this.selectedKPITarget[index].salesCoverage;
        coverage[name] = value;
        coverage.coverageTarget = coverage.coverageRange + ' ' + coverage.coverageInput;
        this.selectedKPITarget[index].salesCoverage = coverage;
    }

    handlePrevChange(event) {
        let index = event.target.dataset.index;
        this.prevMonthVal = event.target.value;
        this.selectedKPITarget[index].prevYear = this.prevYearVal;
        this.selectedKPITarget[index].prevMonth = this.prevMonthVal;
    }


    addRow(event) {
        this.isEditedOrChanged = true;
        let propertyName = event.target.value;
        this.getName = propertyName;
        let isExist = false;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        this.parentIndex = index;
        this.childIndex = ind;
        var incentive;
        var symbols;
        if (this.width == 'Add' || this.width == 'ratio') {
            incentive = 'Incentive Amount';
            symbols = '₹';
            setTimeout(() => {
                let setMarginCard = this.template.querySelector('.noneMargin');
                setMarginCard.classList.toggle('setMargin');
                setMarginCard.classList.remove('noneMargin');
            }, 5);
            if (this.incentiveName == 'growth') {
                this.growthIncentive = true;
                this.multipleKpi = false;
                setTimeout(() => {
                    let setMarginCard1 = this.template.querySelectorAll('.noneleft');
                    setMarginCard1.forEach(margin => {
                        margin.classList.toggle('setLeft');
                        margin.classList.remove('noneleft');
                    })
                }, 5);
            } else if (this.incentiveName == 'customer') {
                this.growthIncentive = false;
                this.multipleKpi = true;
            } else {
                this.growthIncentive = false;
                this.multipleKpi = false;
            }
        } else {
            incentive = 'Incentive Percentage';
            symbols = '%';
            if (this.isSales || this.isIndus == 'Industry') {
                setTimeout(() => {
                    let setMarginCard = this.template.querySelector('.noneMargin');
                    setMarginCard.classList.toggle('setMargin');
                    setMarginCard.classList.remove('noneMargin');
                }, 5);
            }
        }
        if (propertyName == 'SingleRange') {
            var obj = { id: this.selectedKPITarget[index].incentiveSlabs.length + 1, rangeStart: '', rangeStartPercent: '', rangeEnd: '', rangeEndPercent: '', incentiveValue: '', incentiveRadio: 'Percent', incentive: incentive, incentiveSymbol: symbols, multiRange: '', multiPercent: '', growthRange: '', growthPercent: '', isSingle: true, isStartEnd: false, proRataIncentive: false, isGrowthIncentive: this.growthIncentive, isChanged: false };
            this.selectedKPITarget[index].incentiveSlabs.push(Object.assign({}, obj));
        }
        else {
            this.selectedKPITarget[index].incentiveSlabs.push({ id: this.selectedKPITarget[index].incentiveSlabs.length + 1, rangeStart: '', rangeStartPercent: '', rangeEnd: '', rangeEndPercent: '', incentiveValue: '', incentiveRadio: 'Percent', incentive: incentive, incentiveSymbol: symbols, multiRange: '', multiPercent: '', growthRange: '', growthPercent: '', isSingle: false, isGrowthIncentive: this.growthIncentive, isStartEnd: true, proRataIncentive: false, isChanged: false });
        }
    }

    removeStartRow(event) {
        this.isEditedOrChanged = true;
        this.selectedIndex = event.target.dataset.index;
        this.selectedRangeIndex = event.target.dataset.indx;
        this.selectedKpId = event.target.dataset.kpi;
        this.selectedSlabId = event.target.dataset.slab;
        var checkValues = this.selectedKPITarget[this.selectedIndex].incentiveSlabs[this.selectedRangeIndex];
        var volume = this.selectedKPITarget[this.selectedIndex].incentiveSlabs;
        if (checkValues.isSingle) {
            if (!(checkValues.rangeStart || checkValues.rangeStartPercent || checkValues.incentiveValue)) {
                volume.splice(this.selectedRangeIndex, 1);
            } else {
                this.showDeleteForSlabInfo = true;
            }
        } else if (checkValues.isStartEnd) {
            if (!(checkValues.rangeStart || checkValues.rangeStartPercent || checkValues.rangeEnd || checkValues.rangeEndPercent || checkValues.incentiveValue)) {
                volume.splice(this.selectedRangeIndex, 1);
            } else {
                this.showDeleteForSlabInfo = true;
            }
        }
    }

    handleSlabCancel() {
        this.showDeleteForSlabInfo = false;
    }

    handleSlabDelete() {
        var volume = this.selectedKPITarget[this.selectedIndex].incentiveSlabs;
        volume.splice(this.selectedRangeIndex, 1);
        this.selectedKPITarget[this.selectedIndex].incentiveSlabs = volume;
        this.selectedKPITarget[this.selectedIndex].hasSlabs = volume.length > 0;
        this.selectedKPITarget[this.selectedIndex].isSlab = volume.length > 0;
        if (volume.length == 0) {
            this.selectedKPITarget[this.selectedIndex].isSlab = true;
        }
        for (let i = 0; i < this.selectedKPITarget[this.selectedIndex].incentiveSlabs.length; i++) {
            this.selectedKPITarget[this.selectedIndex].incentiveSlabs[i].id = i + 1;
        }
        const eventDetail = {
            id: this.selectedSlabId,
            kpiId: this.selectedKpId,

        };
         this.removeErrorsFromSlabs();
        const evtName = new CustomEvent('slabinfoid', {
            detail: eventDetail
        });
        this.dispatchEvent(evtName);
        this.showDeleteForSlabInfo = false;
        this.toast('Slab deleted Successfully', 'success');
    }

    removeRange(event) {
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        this.selectedKPITarget[index].isRange = false;
        this.selectedKPITarget[index].incentiveRange = {};
        // this.thIncentive = false;
        this.selectedKPITarget[index].thIncentive = false;
        this.showTargetType = true;

    }

    targetRadio(event) {
        var value = event.target.value;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var indexs = event.target.dataset.indexs;
        if (value == 'range') {
            this.selectedKPITarget[index].isRange = true;
            this.selectedKPITarget[index].isSlab = false;
            this.selectedKPITarget[index].incentiveRange = this.selectedKPITarget[index].tempRange;
            this.selectedKPITarget[index].tempSlabs = this.selectedKPITarget[index].incentiveSlabs;
            this.selectedKPITarget[index].incentiveSlabs = [];
        } else {
            this.selectedKPITarget[index].isRange = false;
            this.selectedKPITarget[index].isSlab = true;
            this.selectedKPITarget[index].incentiveSlabs = this.selectedKPITarget[index].tempSlabs ? this.selectedKPITarget[index].tempSlabs : [];
            this.selectedKPITarget[index].tempRange = this.selectedKPITarget[index].incentiveRange;
            this.selectedKPITarget[index].incentiveRange = {};
        }
        for (let i = 0; i < this.selectedKPITarget[index].targetOptions.length; i++) {
            if (i == indexs) {
                this.selectedKPITarget[index].targetOptions[i].isSelected = event.target.checked;
            } else {
                this.selectedKPITarget[index].targetOptions[i].isSelected = !event.target.checked;
            }
        }
    }

    schemeTargets(event) {
        this.isEditedOrChanged = true;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var label = event.target.label;
        var payoutScheme = this.selectedKPITarget[index].incentiveRange ? this.selectedKPITarget[index].incentiveRange : {};
        if (label == 'Single Range') {
            payoutScheme.isSingle = true;
            payoutScheme.isStart = false;
        } else {
            payoutScheme.isSingle = false;
            payoutScheme.isStart = true;
            // this.thIncentive = false;
            this.selectedKPITarget[index].thIncentive = false;
        }
        this.selectedKPITarget[index].incentiveRange = payoutScheme;
        this.showTargetType = false;
    }

    handleChange(event) {
        this.isEditedOrChanged = true;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var value = event.target.value;
        var name = event.target.name;
        var payout = this.selectedKPITarget[index].incentiveRange;
        payout[name] = value;
        if(name == 'allMachineRetail') {
            this.selectedKPITarget[index].allMachineRetail = event.target.checked;
        } else if (payout.isSingle) {
            payout.targetRange = payout.singleRange + ' ' + payout.singlePercent;
            payout.startRange = null;
            payout.startPercent = null;
            payout.endRange = null;
            payout.endPercent = null;
            payout.incentiveAmountStart = null;
            this.achievePercentage = payout.singlePercent;
            if (this.width == 'Add' && this.selectedKPITarget[index].productName == 'TH' && (payout.singleRange == '==')) {
                // this.thIncentive = true;
                this.selectedKPITarget[index].thIncentive = true;
                this.selectedKPITarget[index].showButton = true;
                this.selectedKPITarget[index].showMessage = true;
                this.selectedKPITarget[index].showTargetMessage = false;
            }
            else {
                this.selectedKPITarget[index].showButton = false;
                this.selectedKPITarget[index].showTHIncentive = false;
                this.selectedKPITarget[index].showTargetMessage = true;
                this.selectedKPITarget[index].showMessage = false;
            }
        } else {
            payout.targetRange = payout.startRange + ' ' + payout.startPercent + ' to ' + payout.endRange + ' ' + payout.endPercent;
            payout.singleRange = null;
            payout.singlePercent = null;
            payout.incentiveAmount = null;
        }
        this.selectedKPITarget[index].incentiveRange = payout;
    }

    @api handleEditOrChange() {
        return this.isEditedOrChanged;
    }

    handleRangeVolume(event) {
        const eve = new CustomEvent('editmode', {
            detail: 'edit'
        });
        this.dispatchEvent(eve);
        if (event.target.name == 'rangeInput') this.startValue = event.target.value;
        if (event.target.name == 'rangeInput1') this.endValue = event.target.value;
        var id = event.target.dataset.id;
        this.isEditedOrChanged = true;
        var name = event.target.name;
        var value = event.target.value;
        var index = event.target.dataset.index;
        var ind = event.target.dataset.ind;
        var indx = event.target.dataset.indx;
        var incen = event.target.dataset.incen;
        var proKPI = event.target.dataset.prokpid;
        var currentIds = event.target.getAttribute('data-id');
        var productKpi = this.selectedKPITarget[index].incentiveSlabs;
        for (let i = 0; i < productKpi.length; i++) {
            if (productKpi[i].id == currentIds) {
                if (name == 'proRata') {
                    productKpi[i].disableIncentive = event.target.checked;
                    productKpi[i].incentiveValue = event.target.checked ? 'Pro-rata-basis' : null;
                    productKpi[i].incentiveSymbol = '%';
                    productKpi[i].proRataIncentive = event.target.checked;
                    productKpi[i].incentiveRadio = 'Percent';
                    productKpi[i].incentive = 'Incentive Percentage';

                }
                else if (name == 'rangeStart') {
                    productKpi[i].rangeStart = value;
                } else if (name == 'rangeInput') {
                    productKpi[i].rangeStartPercent = value;
                } else if (name == 'rangeEnd') {
                    productKpi[i].rangeEnd = value;
                } else if (name == 'rangeInput1') {
                    productKpi[i].rangeEndPercent = value;
                } else if (name == 'rangeInput2') {
                    productKpi[i].incentiveValue = value;
                } else if (name == 'multiStart') {
                    productKpi[i].multiRange = value;
                } else if (name == 'multiInput') {
                    productKpi[i].multiPercent = value;
                } else if (name == 'growthStart') {
                    productKpi[i].growthRange = value;
                } else if (name == 'growthInput') {
                    productKpi[i].growthPercent = value;
                } else {
                    productKpi[i].incentiveRadio = value;
                    if (value == 'Amt') {
                        productKpi[i].incentive = 'Incentive Amount';
                        productKpi[i].incentiveSymbol = '₹';
                        productKpi[i].disableIncentive = false;
                        productKpi[i].proRataIncentive = false;
                    } else {
                        productKpi[i].incentive = 'Incentive Percentage';
                        productKpi[i].incentiveSymbol = '%';
                    }
                    productKpi[i].incentiveValue = null;
                }
                if (productKpi[i].isSingle) {
                    productKpi[i].rangeSlab = productKpi[i].rangeStart + '' + productKpi[i].rangeStartPercent;
                    productKpi[i].growthSlab = productKpi[i].growthRange + '' + productKpi[i].growthPercent;
                } else if (productKpi[i].isStartEnd) {
                    productKpi[i].rangeSlab = productKpi[i].rangeStart + '' + productKpi[i].rangeStartPercent + 'to' + productKpi[i].rangeEnd + '' + productKpi[i].rangeEndPercent;
                    productKpi[i].growthSlab = productKpi[i].growthRange + '' + productKpi[i].growthPercent;
                }
            }
            productKpi[i].isChanged = true;
        }
        this.selectedKPITarget[index].incentiveSlabs = productKpi;
        const evtName = new CustomEvent('salesincentive', {
            detail: productKpi
        });
        this.dispatchEvent(evtName);
    }

    schemeTargetsSwap(event) {
        this.isEditedOrChanged = true;
        var index = event.target.dataset.index;
        var payoutScheme = this.selectedKPITarget[index].incentiveRange ? this.selectedKPITarget[index].incentiveRange : {};
        if (this.swapRange) {
            payoutScheme.isSingle = true;
            payoutScheme.isStart = false;
            this.swapRange = false;
            if (this.width == 'Add' && this.selectedKPITarget[index].productName == 'TH') {
                // this.thIncentive = true;
                this.selectedKPITarget[index].thIncentive = true;
            }
        } else {
            payoutScheme.isStart = true;
            payoutScheme.isSingle = false;
            this.swapRange = true;
            // this.thIncentive = false;
            this.selectedKPITarget[index].thIncentive = false;
        }
        this.selectedKPITarget[index].incentiveRange = payoutScheme;
    }

    @api deletedIds = [];
    targetRadioNew(event) {
        var value = event.target.checked;
        var index = event.target.dataset.index;
        var name = event.target.name;
        var slabIndex = event.target.dataset.slabindex;
        if(name == 'allMachineRetail') {
            this.selectedKPITarget[index].incentiveSlabs[slabIndex].allMachineRetail = value;
        } else {
            if (value) {
                // this.thIncentive = false;
                this.selectedKPITarget[index].thIncentive = false;
                if (this.selectedKPITarget[index].incentiveSlabs.length == 0 && this.sales == true) {
                    this.selectedKPITarget[index].salesCoverage.coverageRange = '';
                    this.selectedKPITarget[index].salesCoverage.coverageInput = '';
                }
                this.selectedKPITarget[index].incentiveRange.isStart = false;
                setTimeout(() => {
                    this.selectedKPITarget[index].isSlab = true;
                }, 10);
                this.selectedKPITarget[index].isRange = false;
                this.selectedKPITarget[index].incentiveSlabs = this.selectedKPITarget[index].tempSlabs ? this.selectedKPITarget[index].tempSlabs : [];
                this.selectedKPITarget[index].tempRange = this.selectedKPITarget[index].incentiveRange ? this.selectedKPITarget[index].incentiveRange : {};
                this.selectedKPITarget[index].incentiveRange = {};
                this.deletedIds = [];

            } else {
                this.selectedKPITarget[index].isRange = true;
                this.selectedKPITarget[index].isSlab = false;
                this.selectedKPITarget[index].incentiveRange = this.selectedKPITarget[index].tempRange ? this.selectedKPITarget[index].tempRange : {};
                this.selectedKPITarget[index].incentiveRange.isStart = false;
                this.selectedKPITarget[index].incentiveRange.isSingle = true;
                this.selectedKPITarget[index].tempSlabs = this.selectedKPITarget[index].incentiveSlabs;
                for (let i = 0; i < this.selectedKPITarget[index].incentiveSlabs.length; i++) {
                    if (this.selectedKPITarget[index].incentiveSlabs[i].slabId) {
                        this.deletedIds.push(this.selectedKPITarget[index].incentiveSlabs[i].slabId);
                    }
                }
                this.selectedKPITarget[index].incentiveSlabs = [];
            }
            this.showTargetType = false;
        }
        if(this.width == 'Add'){
        setTimeout(() => {
                // let setWidthCard = this.template.querySelector('.noneWidth');
                // setWidthCard.classList.toggle('setWidth');
                // setWidthCard.classList.remove('noneWidth');
                if (this.selectedKPITarget[0].incentiveSlabs.length > 0) {
                    let setMarginCard1 = this.template.querySelectorAll('.noneMargin');
                    setMarginCard1.forEach(margin => {
                        margin.classList.toggle('setMargin');
                        margin.classList.remove('noneMargin');
                    })
                }
            }, 500);
            }
        if (this.incentiveName == 'growth') {
                this.growthIncentive = true;
                this.multipleKpi = false;
                setTimeout(() => {
                    let setMarginCard1 = this.template.querySelectorAll('.noneleft');
                    setMarginCard1.forEach(margin => {
                        console.log('')
                        margin.classList.toggle('setLeft');
                        margin.classList.remove('noneleft');
                    })
                }, 5);
            }
    }

    changeRangeHandler(event) {
        var index = event.target.dataset.index;
        var indx = event.target.dataset.indx;
        if (this.selectedKPITarget[index].incentiveSlabs[indx].isStartEnd) {
            this.selectedKPITarget[index].incentiveSlabs[indx].isStartEnd = false;
            this.selectedKPITarget[index].incentiveSlabs[indx].isSingle = true;
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeEnd = "";
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeEndPercent = "";
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeSlab = this.selectedKPITarget[index].incentiveSlabs[indx].rangeStart + '' + this.selectedKPITarget[index].incentiveSlabs[indx].rangeStartPercent;
        } else {
            this.selectedKPITarget[index].incentiveSlabs[indx].isStartEnd = true;
            this.selectedKPITarget[index].incentiveSlabs[indx].isSingle = false;
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeSlab = "";
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeStart = "";
            this.selectedKPITarget[index].incentiveSlabs[indx].rangeStartPercent = "";
        }
    }

    addIncentive(event) {
        var ind = event.target.dataset.index;
        this.selectedKPITarget[ind].showButton = false;
        if (this.selectedKPITarget[ind].additionalTHIncentive && this.selectedKPITarget[ind].additionalTHIncentive.length > 0 && !(this.selectedKPITarget[ind].additionalTHIncentive[0].target == '==')) {
            this.selectedKPITarget[ind].showTargetMessage = true;
            this.selectedKPITarget[ind].showMessage = false;
        }
        else {
            this.selectedKPITarget[ind].showTHIncentive = true;
            this.selectedKPITarget[ind].showMessage = true;
            this.selectedKPITarget[ind].showTargetMessage = false;
            let additionalTHIncentive = this.selectedKPITarget[ind].additionalTHIncentive ? this.selectedKPITarget[ind].additionalTHIncentive : [];
            additionalTHIncentive.push({ target: '', volume: '', amount: '' });
            this.selectedKPITarget[ind].additionalTHIncentive = additionalTHIncentive;
        }
    }

    handleAddIncentive(event) {
        var ind = event.target.dataset.index;
        var incentive = event.target.dataset.incentive;
        var value = event.target.value;
        var name = event.target.name;
        var addTHIncentive = this.selectedKPITarget[ind].additionalTHIncentive[incentive];
        addTHIncentive[name] = value;
        addTHIncentive.targetVolume = addTHIncentive.target + '' + addTHIncentive.volume;
        this.selectedKPITarget[ind].additionalTHIncentive[incentive] = addTHIncentive;
        this.selectedKPITarget[ind].additionalTHIncentive;
        const last = this.selectedKPITarget[ind].additionalTHIncentive.length - incentive;
        if (this.selectedKPITarget[ind].additionalTHIncentive[incentive].target == '==' && last == 1) {
            this.selectedKPITarget[ind].showButton = true;
        } else {
            this.selectedKPITarget[ind].showButton = false;
        }
    }

    removeTHIncentive(event) {
        var ind = event.target.dataset.index;
        var incentive = event.target.dataset.incentive;
        var incen = this.selectedKPITarget[ind].additionalTHIncentive;
        incen.splice(incentive, 1);
    }

    overlapMessage = '';
    showOverlap = false;
    @track slab1;
    @track slab2;
    @api slabValidation(range1, range2) {
        this.slab1 = range1;
        this.slab2 = range2;
        const fields = this.template.querySelectorAll('lightning-input, lightning-combobox');
        const slabs = this.template.querySelectorAll('.slab-class, .overlap, .error-content');


        fields.forEach(inputCmp => {
            if ((inputCmp.dataset.id == range1 || inputCmp.dataset.id == range2) && inputCmp.name != 'proRata') {
                inputCmp.classList.add('slds-has-error');
            }
            else {
                inputCmp.classList.remove('slds-has-error');
            }
        });
        slabs.forEach(slab => {
            if (slab.dataset.id == range1 || slab.dataset.id == range2) {
                slab.classList.remove('overlap');
                if (slab.dataset.name == 'slab') {
                    slab.classList.add('slab-error');
                }
                else {
                    slab.classList.remove('slab-error');
                }
            }
            else {
                slab.classList.remove('slab-error');
                if (slab.classList.contains('error-content')) {
                    slab.classList.add('overlap');
                }

            }
            return slab;
        });
        return;
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

    removeErrorsFromSlabs(){      
        const slab = this.template.querySelectorAll('.slab-class,.overlap,.error-content');
        const fields = this.template.querySelectorAll('lightning-input, lightning-combobox');

        slab.forEach(element => {
            if (element.classList.contains('error-content')) {
                element.classList.add('overlap');
            }
            element.classList.remove('slab-error');

        });

        fields.forEach(inputCmp => {
            if (inputCmp.name != 'proRata') {
                inputCmp.classList.remove('slds-has-error');
            }  
        });
    }
}