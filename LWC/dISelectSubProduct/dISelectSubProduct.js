/* eslint-disable no-empty */
import { LightningElement,track,api } from 'lwc';
export default class DISelectSubProduct extends LightningElement {

    @api isSelect = false;
    @track options = [];
    @api productCategoryList;
    @api currentTab;
    @track selectedList=[];
    @track values=[];
    @track showDealerFormulaConfigPage = false;
    @api month;
    @api year;
    @api selectedProducts ={};
    @track selectedProduct;
    @track removedSubProducts = {};
    @api isContains;
    @track isCancel = false;
    @track closeModal = false;

    connectedCallback() {
        this.isCancel = this.isContains == true ? false : true;
        this.isSelect = true;
        this.selectedProduct = JSON.parse(JSON.stringify(this.selectedProducts));
        if(this.productCategoryList && this.currentTab) {
            const subcategorylist = this.productCategoryList[this.currentTab].subCategoryList
            this.prodctglist(this.currentTab,subcategorylist);
            if(this.selectedProduct && this.selectedProduct[this.currentTab] && this.selectedProduct[this.currentTab].length > 0){
                this.values = this.selectedProduct[this.currentTab].map(product => {
                    return product.subProductId;
                });
            }else{}
        }else{}
    }
    get isOk(){
        return this.values.length > 0 ? false : true;
    }

    prodctglist(currentTab,subcategory){
        for(let i=0;i<subcategory.length;i++){
            this.options.push({label:subcategory[i].name,value:subcategory[i].subCategoryId});
        }
    }
    handleSelect(event){
        this.values = event.detail.value;
    }

    handleProceed(){
        if(this.selectedProduct){
            let templist = this.values.map(value => {
                const option = this.options.find(opt => opt.value === value);
                return { subProductName: option.label, subProductId: option.value };
            });
            let tempsubprds = [];
            if(this.selectedProduct && this.selectedProduct[this.currentTab]){
                for(let i =0 ;i<this.selectedProduct[this.currentTab]?.length;i++){
                    let ischeck = false;
                    for(let j =0;j<templist.length;j++){
                        if(this.selectedProduct[this.currentTab][i].subProductId === templist[j].subProductId){
                            ischeck = true;
                        }
                    }
                    if(ischeck === false){
                        tempsubprds.push(this.selectedProduct[this.currentTab][i]);
                    }
                }
            }
            this.removedSubProducts[this.currentTab] = tempsubprds;
            this.selectedProduct[this.currentTab] = templist;
            const selectedsubproducts = new CustomEvent("selectedsubproducts", {
                detail: {'selectedproducts':this.selectedProduct,'removedproducts':this.removedSubProducts,'enableedit':true}
            });
            this.dispatchEvent(selectedsubproducts);
            this.isSelect = false;
        }else{
            this.handleCancel();
        }

    }

    handleClose(){
        if(this.selectedProduct && this.selectedProduct[this.currentTab] && this.selectedProduct[this.currentTab]?.length > 0 ){
            this.handleCancel();
        }else{
            this.isSelect = false;
            const closesubproductsmodal = new CustomEvent("closesubproductsmodal", {
                detail: false
            });
            this.dispatchEvent(closesubproductsmodal);
        }
    }
    handleCancel(){
        this.isSelect = false;
        const closemodal = new CustomEvent("closemodal", {
            detail: false
        });
        this.dispatchEvent(closemodal);
    }
}