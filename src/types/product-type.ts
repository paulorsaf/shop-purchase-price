export type ProductAmountWeight = {
    readonly amount: number;
    readonly weight?: number;
}

export type Product = {
    readonly price: number;
    readonly priceWithDiscount?: number;
} & ProductAmountWeight;