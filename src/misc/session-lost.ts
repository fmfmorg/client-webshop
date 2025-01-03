import { pageToken, signedIn } from "@stores"

const bc = new BroadcastChannel('reload')

export const sessionLost = async (status:number) => {
    if (status === 403) {
        bc.postMessage(pageToken.get())
        bc.close()
        if (signedIn.get()){
            const { pathname, search } = window.location
            window.location.assign(`/sign-in?rd=${encodeURIComponent(pathname + search)}`)
        } else window.location.reload()
        return true
    }
    return false
}