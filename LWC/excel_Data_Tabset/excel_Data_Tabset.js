import readFileFromRecord from '@salesforce/apex/ReadFileData.readFileFromRecord';
import SheetJS from '@salesforce/resourceUrl/SheetJsSample';
// import sheetjs from '@salesforce/resourceUrl/sheetmin';

import { loadScript } from 'lightning/platformResourceLoader';
import { LightningElement, api, track } from 'lwc';

let XLS = {};
//export default class Excel_Data_Tabset extends LightningElement {
    // @track table;
    // @api tabNames;
    // @api wholeTableArray;
    // @track HeaderCount = 0;
    // @track DataCount = 0;
    // showTable = false;

    // handleClick(event) {
    //     Promise.all([
    //         loadScript(this, sheetjs)
    //     ]).then(() => {
    //         XLS = XLSX;
    //         this.readFromFile();
    //     })
    // }

    // async readFromFile() {
    //     let returnVal = await readFileFromRecord();
    //     let wb = XLS.read(returnVal, { type: 'base64', WTF: false });
    //     this.table = this.to_json(wb);
    //     this.wholeTableArray = Object.values(this.table);
    //     this.tabNames = Object.values(wb.SheetNames);
    //     this.showTable = true;
    // }

    // to_json(workbook) {
    //     let result = {};
    //     workbook.SheetNames.forEach(function (sheetName) {
    //         var roa = XLS.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    //         if (roa.length) {
    //             result[sheetName] = roa;
    //         }
    //     });
    //     const JsonOutput = JSON.stringify(result, 2, 2); //To Convert result into JSON String for debugging.
    //     console.log(JsonOutput);
    //     return result;
    // }

    // get tableHeaderCommon() {
    //     const currentArray = this.wholeTableArray[this.HeaderCount];
    //     this.HeaderCount++;
    //     return currentArray[0];
    // }

    // get tableDataCommon() {
    //     const currentArray = this.wholeTableArray[this.DataCount];
    //     this.DataCount++;
    //     return currentArray.slice(1);
    // }

    
    //async connectedCallback() {
       // await loadScript(this, SheetJS); // load the library
        // At this point, the library is accessible with the `XLSX` variable
       // this.version = XLSX.version;
       // console.log('version: '+this.version);      
   // }
  //exportToExcel() {
    // Sample table data for demonstration purposes
    //const tableData = [
     // ['John Doe', 30, 'john.doe@example.com'],
     // ['Jane Smith', 28, 'jane.smith@example.com'],
     // ['Michael Johnson', 35, 'michael.johnson@example.com']
    //];

    //const filename = 'ExportToExcel.xlsx';
   // const workbook = XLSX.utils.book_new();
   // const headers = [];
    //const worksheetData = [];

    //for (const record of tableData) {
        //worksheetData.push({
           // "Name": record[0],
           // "Age": record[1],
           // "Email":record[2]
           
     //   });
   // }
    // console.log('worksheetData',worksheetData);

    //const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: headers });
   // XLSX.utils.book_append_sheet(workbook, worksheet, 'ExportToExcel');

   // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
   // const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Create a download link and click it programmatically to initiate the download
  //  const a = document.createElement('a');
   // a.href = URL.createObjectURL(blob);
    //a.download = filename;
 //   a.click();
    // Release the object URL to free up memory
  //  URL.revokeObjectURL(a.href);
  //  }
//}
// import { LightningElement, track } from 'lwc';

// export default class NumberInputRestriction extends LightningElement {
//    
export default class NumberInputRestriction extends LightningElement {
    @track inputValue = '';

    handleInput(event) {
        // Allow only digits and a single dot for decimals
        const regex = /^[0-9]*\.?[0-9]*$/;
        const value = event.target.value;

        if (!regex.test(value)) {
            // Remove invalid characters if input does not match regex
            event.target.value = value.replace(/[^0-9.]/g, '');
        }

        // Update tracked value
        this.inputValue = event.target.value;
    }

    handleKeyPress(event) {
        // Allow digits and dot, prevent invalid characters
        const allowedKeys = /^[0-9.]$/;

        if (!allowedKeys.test(event.key)) {
            event.preventDefault();
        }

        // Prevent entering more than one dot
        if (event.key === '.' && event.target.value.includes('.')) {
            event.preventDefault();
        }
    }

    handlePaste(event) {
        // Prevent pasting invalid characters
        const clipboardData = (event.clipboardData || window.clipboardData).getData('text');
        const regex = /^[0-9]*\.?[0-9]*$/;

        if (!regex.test(clipboardData)) {
            event.preventDefault();
        }
    }
}