import uploadFile from '@salesforce/apex/FileUploaderClass.uploadFile';
import resourceName from '@salesforce/resourceUrl/Excel_Sheet_Test_Template';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, api } from 'lwc';

export default class File_Upload extends LightningElement {
    @api recordId;
    fileData

    downloadSampleFile(event) {
        const resourcePath = resourceName;

        const link = document.createElement('a');
        link.href = resourcePath;
        link.download = 'Excel Sheet Test Template';
        link.click();

        return null;
    }

    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
            console.log(this.fileData)
        }
        reader.readAsDataURL(file)
    }

    handleClick() {
        const { base64, filename, recordId } = this.fileData
        uploadFile({ base64, filename, recordId }).then(result => {
            this.fileData = null
            let title = `${filename} uploaded successfully!!`
            this.toast(title)
        })
    }

    toast(title) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: "success"
        })
        this.dispatchEvent(toastEvent)
    }
}