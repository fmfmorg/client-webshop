export const showErrorModal = (msg:string) => {
    const modalCheckbox = document.getElementById("error-modal-checkbox") as HTMLInputElement
    const modalMsg = document.getElementById("error-modal-message") as HTMLParagraphElement
    modalMsg.innerText = msg
    modalCheckbox.checked = true
}