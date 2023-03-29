import { PurchasePrice } from "./purchase-price";

describe('Purchase price', () => {

    let addresses;
    let mailMock: any;
    let paymentFee;
    let products;

    beforeEach(() => {
        mailMock = new MailMock();

        addresses = {
            destination: "anyDestinationZipCode",
            origin: "anyOriginZipCode"
        };
        paymentFee = {
            percentage: 10,
            value: 2.5
        };
        products = [
            { amount: 10, price: 5 },
            { amount: 4, price: 10 },
            { amount: 2, price: 5 }
        ];
    })

    it('given no products, then purchase prices should be zero', async() => {
        const purchasePrice = new PurchasePrice({products: []} as any);
        const response = await purchasePrice.calculatePrice();
        
        expect(response).toEqual({
            productsPrice: 0,
            deliveryPrice: 0,
            discount: 0,
            paymentFee: 0,
            serviceFee: 0,
            totalPrice: 0,
            totalWithPaymentFee: 0
        });
    })

    describe('Products price', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({products} as any);
        });

        it('given there are no discounts, then return full products price', async () => {
            const response = await purchasePrice.calculatePrice();
            
            expect(response.productsPrice).toEqual(100);
        })
    
        it('given there are discounts, then return products price with discount', async () => {
            products[1].priceWithDiscount = 5;

            const response = await purchasePrice.calculatePrice();
            
            expect(response.productsPrice).toEqual(80);
        })

    })

    describe('Delivery price', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({
                addresses,
                products,
            } as any, mailMock);
        });

        it('given purchase is pick up, then delivery price should be zero', async () => {
            mailMock._findDeliveryPriceResponse = 0;

            const response = await purchasePrice.calculatePrice();

            expect(response.deliveryPrice).toEqual(0);
        })

        it('given purchase is delivery, then return delivery price', async () => {
            mailMock._findDeliveryPriceResponse = 20;

            const response = await purchasePrice.calculatePrice();
            
            expect(response.deliveryPrice).toEqual(20);
        })

    })

    describe('Total price', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({
                addresses,
                products,
                serviceFee: 10
            } as any, mailMock);
        });

        it('given purchase is not delivery, then total price should be equal to products price plus service fee', async () => {
            addresses.destination = undefined;

            const response = await purchasePrice.calculatePrice();

            expect(response.totalPrice).toEqual(110);
        })

        it('given purchase is delivery, then total price should be equal to products plus delivery price plus service fee', async () => {
            mailMock._findDeliveryPriceResponse = 20;

            const response = await purchasePrice.calculatePrice();
            
            expect(response.totalPrice).toEqual(130);
        })

        it('given purchase has discount, then total price should have discount', async () => {
            purchasePrice = new PurchasePrice({
                addresses, discount: 10, products, serviceFee: 10
            } as any, mailMock);
            mailMock._findDeliveryPriceResponse = 20;

            const response = await purchasePrice.calculatePrice();
            
            expect(response.totalPrice).toEqual(118);
        })

        it('given purchase doesnt have service fee, then total price should not add service fee', async () => {
            purchasePrice = new PurchasePrice({
                addresses, discount: 10, products, serviceFee: 0
            } as any, mailMock);
            mailMock._findDeliveryPriceResponse = 20;

            const response = await purchasePrice.calculatePrice();
            
            expect(response.totalPrice).toEqual(108);
        })

    })

    describe('Discount', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({
                discount: 10,
                products
            } as any);
        });

        it('given purchase has discount, then return discounted price', async () => {
            const response = await purchasePrice.calculatePrice();

            expect(response.discount).toEqual(10);
        })

        it('given purchase doesnt have discount, then return discount as zero', async () => {
            purchasePrice = new PurchasePrice({products} as any);

            const response = await purchasePrice.calculatePrice();

            expect(response.discount).toEqual(0);
        })

    })

    describe('Payment fee', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({
                paymentFee,
                products,
            } as any);
        });

        it('given purchase has a payment fee, then return payment fee', async () => {
            const response = await purchasePrice.calculatePrice();

            expect(response.paymentFee).toEqual(12.5);
        })

        it('given purchase doesnt have payment fee, then payment fee is zero', async () => {
            purchasePrice = new PurchasePrice({products} as any);

            const response = await purchasePrice.calculatePrice();

            expect(response.paymentFee).toEqual(0);
        })

    })

    describe('Total price with payment fee', () => {
        
        let purchasePrice: PurchasePrice;

        beforeEach(() => {
            purchasePrice = new PurchasePrice({
                paymentFee,
                products,
            } as any);
        });

        it('given purchase has a payment fee, then return total price with payment fee', async () => {
            const response = await purchasePrice.calculatePrice();

            expect(response.totalWithPaymentFee).toEqual(112.5);
        })

        it('given purchase doesnt have a payment fee, then return total price', async () => {
            purchasePrice = new PurchasePrice({products} as any);

            const response = await purchasePrice.calculatePrice();

            expect(response.totalWithPaymentFee).toEqual(100);
        })

        it('given purchase has payment fee and service fee, then return total price with payment fee and service fee', async () => {
            purchasePrice = new PurchasePrice({
                paymentFee,
                products,
                serviceFee: 10
            } as any);

            const response = await purchasePrice.calculatePrice();

            expect(response.totalWithPaymentFee).toEqual(122.5);
        })

    })

    it('given purchase has products, discount, payment fee, service fee and is delivery, then return whole purchase price', async() => {
        const purchasePrice = new PurchasePrice({
            products,
            addresses,
            discount: 10,
            paymentFee,
            serviceFee: 10
        } as any, mailMock);
        mailMock._findDeliveryPriceResponse = 20;

        const response = await purchasePrice.calculatePrice();
        
        expect(response).toEqual({
            productsPrice: 100,
            deliveryPrice: 20,
            discount: 12,
            paymentFee: 14.5,
            serviceFee: 10,
            totalPrice: 118,
            totalWithPaymentFee: 132.5
        });
    })

})

class MailMock {
    _findDeliveryPriceResponse;
    findDeliveryPrice() {
        return this._findDeliveryPriceResponse;
    }
}