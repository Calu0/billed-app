import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    // check file extension
    const fileExtension = fileName.split('.').pop().toLowerCase()
    if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
      alert('Seuls les fichiers jpg, jpeg et png sont autorisés.')
      this.document.querySelector(`input[data-testid="file"]`).value = ''
      return
    }

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
        this.fileExtension = fileExtension
      }).catch(error => console.error(error))
  }



  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const expenseType = e.target.querySelector(`select[data-testid="expense-type"]`).value
    const expenseName = e.target.querySelector(`input[data-testid="expense-name"]`).value
    const amount = e.target.querySelector(`input[data-testid="amount"]`).value
    const date = e.target.querySelector(`input[data-testid="datepicker"]`).value
    const vat = e.target.querySelector(`input[data-testid="vat"]`).value
    const pct = e.target.querySelector(`input[data-testid="pct"]`).value
    const commentary = e.target.querySelector(`textarea[data-testid="commentary"]`).value

    console.log('expenseType', expenseType)
    console.log('expenseName', expenseName)
    console.log('amount', amount)
    console.log('date', date)
    console.log('fileUrl', this.fileUrl)

    // // Vérification des champs obligatoires
    // if (expenseType === '' || expenseName === '' || amount === '' || date === '' || !this.fileUrl) {
    //   alert('Veuillez remplir tous les champs obligatoires')
    //   return
    // }

    const bill = {
      email,
      type: expenseType,
      name: expenseName,
      amount: parseInt(amount),
      date: date,
      vat: vat,
      pct: parseInt(pct) || 20,
      commentary: commentary,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }




  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}
