const config = require('../../config/index');
const parse = require('csv-parse')
const fsPromise = require('fs').promises
const { BMI } = require('../models/BMI');

class BMIController {
  constructor(req, res) {
    this.req = req
    this.res = res
    this.csvRootDirectory = config.directory.bmiCSV 
  }

  async checkFileExtension() {
    try {
      const listOfSubstring = this.req.files.bmi.name.split('.')
      const getFileType = listOfSubstring[ listOfSubstring.length -1 ] 
      if ((listOfSubstring.length > 1) && (getFileType === 'csv')) {
        return true
      } 
      return false  
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async uploadData() {
    try {
      if (!(this.req.files.bmi)) { 
        return this.res.status(400).json({ success: false, message: 'No file uploaded'});
      } 
      const isFileTypeValid = await this.checkFileExtension() 
      if (!(isFileTypeValid)) {
        return this.res.status(400).json({ success: false, message: 'Invalid file type uploaded, only support CSV' });
      } 
      const filename = ''.concat(config.directory.bmiCSV,'bmi-children.csv');
      const file = this.req.files.bmi
      await file.mv(filename)
      return filename
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async parseCSVAsObject() {
    try {
      const filename = await this.uploadData()
      const fileBuffer = await fsPromise.readFile(filename)
      const parser = parse(fileBuffer, { columns: true, delimiter: ',', trim: true })
      const output = []
      const parseResult = await new Promise((resolve, reject) => {
        parser.on('readable', () => {
          let record;
          while (record = parser.read()) {
            Object.entries(record).forEach(([key, value]) => {
              if (key === 'month') {
                value = parseInt(value)
                record[key] = value
              }
              else if (key === 'gender') {
                record[key] = value
              }
              else {
                value = parseFloat(value)
                record[key] = value
              }
            })
            output.push(record)
          }
        });

        parser.on('error', (err) => {
          reject(err)
        });

        parser.on('end', () => {
          resolve(output)
        });
      });
      return parseResult
    }

    catch (error) {
      throw new Error(error.message)
    }
  }

  async insertCSVToDB() {
    try {
      const parseResult = await this.parseCSVAsObject();
      await BMI.bulkCreate(parseResult, { validate: true });
      return this.res.status(200).json({ success: true, message: 'File uploaded'})
    } catch (error) {
      return this.res.status(500).json({success: false, message: error.name, detail: error.message})
    }
  }

}

module.exports = BMIController;