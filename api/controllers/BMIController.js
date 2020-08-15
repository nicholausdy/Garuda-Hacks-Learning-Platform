const config = require('../../config/index');
const parse = require('csv-parse')
const fsPromise = require('fs').promises
const { BMI } = require('../models/BMI');
const { QueryTypes } = require('sequelize');
const { db } = require('../../config/database')
const moment = require('moment')

class BMIController {
  constructor(req, res) {
    this.req = req
    this.res = res
    this.csvRootDirectory = config.directory.bmiCSV
    this.ageInMonth = null 
    this.bmi = null
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

  static async formatReceivedDates(date) {
    try {
      const result = []
      const splittedDate = date.split('/')
      for (let i=0; i< splittedDate.length; i++) {
        splittedDate[i] = parseInt(splittedDate[i], 10)
      } 
      // 8/15/2020 to 2020-8-15
      result[0] = splittedDate[2]
      result[1] = splittedDate[0] - 1
      result[2] = splittedDate[1] 
      return result
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async calculateAgeInMonth() {
    try {
      const [ formattedDateOfMeasurement, formattedDateOfBirth] = await Promise.all([
        BMIController.formatReceivedDates(this.req.body.measurement), 
        BMIController.formatReceivedDates(this.req.body.birth)
      ])
      const momentDoM = moment(formattedDateOfMeasurement)
      const momentDoB = moment(formattedDateOfBirth)
      this.ageInMonth = momentDoM.diff(momentDoB, 'months')
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async calculateBMI() {
    try {
      this.bmi = this.req.body.weight / ((this.req.body.height / 100) ** 2)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getBMIInfo() {
    try {
      const queryString = 'select * from bmi where gender = :gender AND month = :month'
      const queryResult = await db.query(queryString, {
        replacements: { gender: this.req.body.sex, month: this.ageInMonth},
        type: QueryTypes.SELECT,
      });
      return queryResult[0]
    } catch (error) {
      throw new Error(error.message)
    }
  }
  
  async getClassification() {
    try {
      await Promise.all([this.calculateAgeInMonth(), this.calculateBMI()])  
      if (this.ageInMonth <= 228) {  
        const bmiInfo = await this.getBMIInfo()
        let classification;
        if ( this.bmi < bmiInfo.p5 ) {
          classification = 'Underweight'
        } else if ((this.bmi >= bmiInfo.p5) && (this.bmi < bmiInfo.p85)) {
          classification = 'Normal'
        } else if ((this.bmi >= bmiInfo.p85) && (this.bmi < bmiInfo.p95)) {
          classification = 'Overweight'
        } else { 
          classification = 'Obese'
        }
        return this.res.status(200).json({ success: true, bmi: this.bmi, classification})
      } 
      let classification
      if (this.bmi < 18.5 ) {
        classification = 'Underweight'
      } else if ((this.bmi >= 18.5) && (this.bmi < 23)) {
        classification = 'Normal'
      } else if ((this.bmi >= 23) && (this.bmi < 25)) {
        classification = 'Overweight'
      } else {
        classification = 'Obese'
      }
      return this.res.status(200).json({ success: true, bmi: this.bmi, classification})
    } catch (error) {
      return this.res.status(500).json({success: false, message: error.name, detail: error.message})
    }
  }
}

module.exports = BMIController;