import type { IUserAddress } from "@misc";
import { memberBillingAddress, memberFullName } from "@stores";

export const memberSetBillingAddress = (address: IUserAddress) => {
    memberBillingAddress.setKey('streetLine1',address.line1)
    memberBillingAddress.setKey('streetLine2',address.line2)
    memberBillingAddress.setKey('city',address.city)
    memberBillingAddress.setKey('region',address.stateProvince)
    memberBillingAddress.setKey('postcode',address.postcode)
    memberBillingAddress.setKey('countryCode',address.countryID)

    memberFullName.set(`${address.firstName.trim()} ${address.lastName.trim()}`.trim())
}