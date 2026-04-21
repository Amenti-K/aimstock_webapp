export interface IAdjustment {
    id: string;
    note: string;
    warehouseId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    invetoryAdjustmentItem: IAdjustmentItem[];
    warehouse: {
        name: string;
    };
}

export interface IAdjustmentResponse {
    data: IAdjustment[]
}

export interface IAdjustmentItem {
    id: string;
    type: string;
    quantity: number;
    inventoryId: string;
    warehouseId: string;
    adjustmentId: string;
    createdAt: string;
    updatedAt: string;
    inventory: {
        id: string;
        name: string;
        boughtPrice: string;
        sellingPrice: string;
        sku: string;
        brand: string;
        unit: string;
        initialQuantity: string;
        createdAt: string;
        updatedAt: string;
        companyId: string;
    };
    warehouse: {
        id: string;
        name: string;
        location: string;
        description: string;
        isInternal: boolean;
        contactPhone: string;
        createdAt: string;
        updatedAt: string;
        companyId: string;
    };
}

export interface INewAdjustmentItem {
    type: string;
    quantity: number;
    inventoryId: string;
    warehouseId: string;
}

export interface INewAdjustment {
    note: string;
    warehouseId: string;
    items: INewAdjustmentItem[]
}


export interface IAdjustmentFormProps {
    selectedAdjustmentId?: string | undefined;
    onEdit?: (value: any) => void;
    item?: IAdjustment | null;
}