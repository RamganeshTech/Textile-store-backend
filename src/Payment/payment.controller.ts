import axios from 'axios';
import { RequestHandler, Response, Request } from 'express';
import uniqid from 'uniqid';
import sha256 from 'sha256'
// import OrderModel from '../Models/orders.model.js';
import { AuthenticatedRequest } from '../Types/types.js';
import PaymentModel from '../Models/payment.model.js';

// const HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"
const HOST_URL = "https://api.phonepe.com/apis/hermes"
const MERCHANT_ID = "PGTESTPAYUAT"; //WE HAVE TO CONTACT WITH PNONEPE FOR MERCHATID AND FOR SALTKEY, just for testing pur pose we have kept like this 
const SALT_KEY = 'yugyjhhhhhhhhhhhhhhhhhhhhhhhhhh'
const SALT_INDEX = 1;

// const urlfromphonepe = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

const paymentAPi: RequestHandler = (req: Request, res: Response) => {
    try {
        let user = (req as AuthenticatedRequest).user

        const payEndPoint = '/pg/v1/pay'

        const { amount } = req.body;

        const merchantTransactionId = uniqid()

        const payload = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": merchantTransactionId,
            "merchantUserId": user._id, //
            "amount": amount * 100,
            "redirectUrl": `http://localhost:5173/redirect-url/paymentsuccess/${merchantTransactionId}`,
            "filureUrl": `http://localhost:5173/redirect-url/paymentfailure/${merchantTransactionId}`,
            "redirectMode": "REDIRECT",
            // "callbackUrl": "https://webhook.site/callback-url",

            "callbackUrl": `http://localhost:3000/api/payment-status/${merchantTransactionId}`,
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
                request: base64EncodedPayload
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
    catch (error) {
        if (error instanceof Error) {
            console.log("error from paymentAPi", error)
            res.status(500).json({
                message: error.message,
                success: false
            })
        }
    }
}

const redirectUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        let { merchantTransactionId } = req.params

        const paymentData = req.body;  // Retrieve payment status data from the request body
        console.log("✅ PhonePe callback received");
        console.log("Payment Data:", paymentData);
        console.log("merchantTransactionId", merchantTransactionId)

        let xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX

        const options = {
            method: "get",
            url: `${HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                // "x-verify": xVerify,
                // "X-MERCHANT-ID": merchantTransactionId,
                "X-MERCHANT-ID": MERCHANT_ID,
                "X-VERIFY": xVerify,
            },
        };

        let response = await axios.request(options)

        console.log(response.data);
        if (response.data.code === "PAYMENT_SUCCESS") {
            // redirect the page toFE success page
            // return res.status(200).send({success: true, message:"Payment Success"});

            const paymentRecord = await PaymentModel.findOneAndUpdate(
                { merchantTransactionId: merchantTransactionId },  // Find the payment by transaction ID
                {
                    $set: {
                        merchantTransactionId: merchantTransactionId, // Just in case it's not in paymentData
                        merchantUserId: paymentData.merchantUserId,
                        amount: paymentData.amount,
                        status: paymentData.code,
                        phonepeResponse: paymentData,
                    },
                },
                { upsert: true, new: true }  // If record doesn't exist, create a new one
            );

            console.log("Payment Status Updated:", paymentRecord);

            res.redirect(`http://localhost:5173/redirect-url/paymentsuccess/${merchantTransactionId}`);

        }
        else if (response.data.code === "PAYMENT_ERROR") {
            // redirect the page toFE error page
            // return res.status(400).send({success: false, message:"Payment Failure"});

            res.redirect(`http://localhost:5173/redirect-url/paymentfailure/${merchantTransactionId}`);

        }
        else {
            res.status(202).send({ success: false, message: "Payment status pending..." });

        }
        // res.send(response.data)
        // res.status(302).redirect(url); // res.send(url)


        // if (merchantTransactionId) {
        //     console.log(merchantTransactionId)
        //     res.status(302).send(`merchant id is ${merchantTransactionId} redirected to home page successfully`)
        // }
        // else {
        //     console.log(merchantTransactionId)
        //     res.status(400).send(`error ocuured in receiving merchang id`)
        // }
    }
    catch (error) {
        console.log(error)
        res.status(500).send("An error occurred while processing the payment status.");
    }

}


// const orders = async (req: Request, res: Response) => {
//     try {

//         let user = (req as AuthenticatedRequest).user
//         const { color, size, productId, quantity } = req.body

//         if (!color || !size || !productId || !user._id || !quantity) {
//             return res.status(400).json({ message: "neccessary details are missing", error: true, ok: false, })
//         }

//         let data = OrderModel.create({
//             color, size, productId, userId: user._id, quantity
//         })

//         res.status(201).json({ message: "created product", error: false, ok: true, data })
//     }
//     catch (error) {
//         if (error instanceof Error) {
//             console.log(error.message)
//             res.status(500).json({ message: error.message, error: false, ok: true })
//         }
//     }
// }


export {
    paymentAPi,
    redirectUrl,
    // orders
}