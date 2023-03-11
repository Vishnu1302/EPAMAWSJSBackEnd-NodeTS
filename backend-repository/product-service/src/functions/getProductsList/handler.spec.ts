import { type Context, type Callback } from 'aws-lambda';
import getProductsListTS from './handler';
import { formatResponse } from '@libs/api-gateway';
jest.mock('@libs/api-gateway');

describe('getProductsList lambda', () => {
    // it('should return HTTP response with products list', async () => {
    //     const mockedOrigin = 'some-origin';
    //     const mockedEvent = {
    //         headers: {
    //             origin: mockedOrigin,
    //         },
    //     } as any;
    //     await getProductsListTS(mockedEvent, {} as Context, {} as Callback);
    //     expect(formatResponse).toBeCalled();
    // });

    // it('should return error', async () => {
    //     //const mockedOrigin = 'some-origin';
    //     getProductsListTS({} as any, {} as Context, {} as Callback);
    //     expect(formatResponse).toBeCalled();
    // });
});