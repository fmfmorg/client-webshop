export interface IFilterRenderItem {
    attrName: string;
    headerName: string;
    desktopRadioInput: string;
    desktopHeaderLabelID: string;
    desktopULID: string;
    tabletHeaderLabelID: string;
    mobileRadioInput: string;
    mobileHeaderLabelID: string;
    attributes: string[];
}

export interface IFilterHybridTempData {
    slugsSelected:string[];
    productCount:number;
}