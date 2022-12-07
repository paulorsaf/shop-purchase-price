import { Mail } from "./mail";
import { MailInterface } from "./mail.interface";

describe('Mail', () => {

    let mail: MailInterface;
    let mailRepository: MailRepositoryMock;
    let params;

    beforeEach(() => {
        params = {
            innerCityDeliveryPrice: 10,
            originCityName: "anyOriginCity",
            products: [],
            zipCodes: {
                destination: "anyDestination",
                origin: "anyOrigin"
            }
        };

        mailRepository = new MailRepositoryMock();
        mail = new Mail(mailRepository);
    })

    describe('given delivery is inside of the city of origin', () => {

        beforeEach(() => {
            mailRepository._findByZipCodeResponse = {
                city: "anyOriginCity"
            };
        })

        it('when inner city delivery price is informed, then return inner city delivery price', async () => {
            const response = await mail.findDeliveryPrice(params);
    
            expect(response).toEqual(10);
        })

        it('when inner city delivery price is not informed, then return zero', async () => {
            params.innerCityDeliveryPrice = 0;
    
            const response = await mail.findDeliveryPrice(params);
    
            expect(response).toEqual(0);
        })

    })

    it('given delivery is outside of the city of origin, then return calculated mail delivery price', async () => {
        mailRepository._findByZipCodeResponse = {
            city: "anyOtherCity"
        };
        mailRepository._findDeliveryPriceResponse = 20.5;

        const response = await mail.findDeliveryPrice(params);

        expect(response).toEqual(20.5);
    })

})

class MailRepositoryMock {
    _findByZipCodeResponse;
    _findDeliveryPriceResponse;
    findByZipCode(){
        return this._findByZipCodeResponse;
    }
    findDeliveryPrice(){
        return this._findDeliveryPriceResponse;
    }
}