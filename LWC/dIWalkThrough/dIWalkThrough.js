import { api, LightningElement } from 'lwc';

export default class DIWalkThrough extends LightningElement {
  @api currentStep; // Passed from parent
  @api totalSteps;  // Passed from parent
  @api isWalkthroughVisible;   // Controls visibility of the walkthrough
  @api steps = [];  // Step content array passed from parent

  get currentStepContent() {
    return this.steps[this.currentStep - 1]?.content || '';
  }

  get isFirstStep() {
    return this.currentStep === 1;
  }

  get isLastStep() {
    return this.currentStep === this.totalSteps;
  }

  get dynamiClass() {
    const baseClass = 'slds-popover slds-popover_walkthrough';
    let nubbinClass;

    // Assign class based on the current step
    switch (this.currentStep) {
    
      default:
        nubbinClass = 'slds-nubbin_top';
    }

    return `${baseClass} ${nubbinClass}`;
  }
  handleNext() {
    if (!this.isLastStep) {
      this.dispatchEvent(new CustomEvent('stepchange', { detail: this.currentStep + 1 }));
    } else {
      this.completeWalkthrough();
    }
  }

  handlePrev() {
    if (!this.isFirstStep) {
      this.dispatchEvent(new CustomEvent('stepchange', { detail: this.currentStep - 1 }));
    }
  }

  completeWalkthrough() {
    this.dispatchEvent(new CustomEvent('walkthroughcomplete'));
  }

  handleRestartTour() {
    this.dispatchEvent(new CustomEvent('stepchange', { detail: 1 }));
  }
}