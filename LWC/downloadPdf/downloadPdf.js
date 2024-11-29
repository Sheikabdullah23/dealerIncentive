import { LightningElement, track } from 'lwc';
import getPdfcontent from '@salesforce/apex/IncentiveReportBackup.getPdfcontent';
import deleteContentDocuments from '@salesforce/apex/IncentiveReportBackup.deleteContentDocuments';
export default class DownloadPdf extends LightningElement {

    @track pdfUrl = '';


    connectedCallback(){
        
    }
    generatepdf(){
        if(this.pdfUrl){
            // var pdfUrl = 'path/to/your/file.pdf'; // Replace with the actual URL of the PDF file
            var a = document.createElement('a');
            // const response = await fetch(this.pdfUrl);
            // const blob = await response.blob();
            // const url = window.URL.createObjectURL(blob);
            a.href = this.pdfUrl.split('+++')[1];
            a.download = 'file.pdf'; // Optional: specify the filename
            a.target = '_blank'; // Open in a new tab
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(()=>{
                this.deleteIds();
            },5000);

        }
    }
    handleClick(){
        var a ;
        getPdfcontent({}).then((res)=>{
            console.log('res',res);
            a = res;
            this.pdfUrl = res;
            this.generatepdf();
        })
        .catch(e=>{
            console.log('error',e);
        })
        console.log('The base64 string ',a);
    }
    deleteIds(){
        deleteContentDocuments({contentDocumentId:this.pdfUrl.split('+++')[0]})
            .then((res)=>{
                console.log('res',res);
            })
            .catch((err)=>{
                console.log('err',err);
            })
    }


}