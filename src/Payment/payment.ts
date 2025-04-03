import axios from 'axios';
import { RequestHandler, Response, Request } from 'express';
import uniqid from 'uniqid';
import sha256 from 'sha256'

const HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"
const MERCHANT_ID = "PGTESTPAYUAT"; //WE HAVE TO CONTACT WITH PNONEPE FOR MERCHATID AND FOR SALTKEY, just for testing pur pose we have kept like this 
const SALT_KEY = 'yugyjhhhhhhhhhhhhhhhhhhhhhhhhhh'
const SALT_INDEX = 1;

// const urlfromphonepe = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

const paymentAPi: RequestHandler = (req:Request, res:Response) => {
    const payEndPoint = '/pg/v1/pay'

    const merchantTransactionId = uniqid()
    const payload = {
        "merchantId": "PGTESTPAYUAT",
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": "MUID123", //
        "amount": 10000,
        "redirectUrl": `http://localhost:5173/redirect-url/${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        // "callbackUrl": "https://webhook.site/callback-url",
        "mobileNumber": "9999999999",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }

    // SHA256(base64 encoded payload + “/pg/v1/pay” +
    //     salt key) + ### + salt index
    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8")
    const base64EncodedPayload = bufferObj.toString("base64")

    const xVerify = sha256(base64EncodedPayload + payEndPoint + SALT_KEY) + '###' + SALT_INDEX


    const options = {
        method: "POST",
        url: `${HOST_URL}${payEndPoint}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "x-verify": xVerify,
        },
        data: {
            
            request:base64EncodedPayload
        }
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            const url = response.data.data.instrumentResponse.redirectInfo.url
            // res.send(response.data)
            res.status(302).redirect(url);             // res.send(url)
        })
        .catch(function (error) {
            console.log(error);
            res.send(error).end()
        })
}


const redirectUrl = async (req:Request, res:Response)=>{
    try{
        let {merchantTransactionId} = req.params


        console.log("merchantTransactionId", merchantTransactionId)

    let xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX

        const options = {
            method: "get",
            url: `${HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                // "x-verify": xVerify,
                "X-MERCHANT-ID": merchantTransactionId,
                "X-VERIFY": xVerify,
            },
        };

        axios.request(options)
        .then(function (response) {
            console.log(response.data);
            if(response.data.code === "PAYMENT_SUCCESS"){
                // redirect the page toFE success page
            }
            else if(response.data.code === "PAYMENT_ERROR"){
                // redirect the page toFE error page

            }
            else{
                //  loading page
            }
            res.send(response.data)
            // res.status(302).redirect(url);             // res.send(url)
        })
        .catch(function (error) {
            console.log(error);
            res.send(error).end()
        })
        

        if(merchantTransactionId){
            console.log(merchantTransactionId)
            res.status(302).send(`merchant id is ${merchantTransactionId} redirected to home page successfully`)
        }
        else{
            console.log(merchantTransactionId)
            res.status(400).send(`error ocuured in receiving merchang id`) 
        }
    }
    catch(error){
        console.log(error)
        res.status(302).send("redirected to home page successfully")
    }

}


export {
    paymentAPi,
    redirectUrl
}



//     merchantId: "YOUR_MERCHANT_ID",
            // transactionId: "ORDER_12345",
            // amount: 10000, // In paise (₹100 = 10000 paise)
            // redirectUrl: "https://yourwebsite.com/payment-success",
            // callbackUrl: "https://yourserver.com/verify-payment",
            // paymentInstrument: { type: "UPI_INTENT" }
            // 