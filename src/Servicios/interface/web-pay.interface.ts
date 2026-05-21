
export interface IWebPay {

    token : string;
    url   : string;
}

export interface WebPayRequest {
    servicios_name : string;
    rut            : string;
    monto          : number;
}
