export const setLoading = (loading:boolean) => {
    const loadingOverlayCheckbox = document.getElementById("loading-overlay") as HTMLInputElement
    if (!!loadingOverlayCheckbox) loadingOverlayCheckbox.checked = loading
}