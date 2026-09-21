const generateInvoiceEmailContent = (invoice) => {


    const subject =
        `Invoice ${invoice.invoiceNumber} from ${invoice.business.businessName}`;



    const body = `

    <div style="
        font-family: Arial, Helvetica, sans-serif;
        max-width: 700px;
        margin: auto;
        padding: 20px;
        color: #333;
    ">


        <h2>
            ${invoice.business.businessName}
        </h2>


        <p>
            Hello ${invoice.customer.customerName},
        </p>


        <p>
            Thank you for your business. 
            Please find your invoice details below.
        </p>



        <hr/>


        <h3>Invoice Summary</h3>


        <table style="
            width:100%;
            border-collapse:collapse;
        ">


            <tr>
                <td>
                    Invoice Number
                </td>

                <td>
                    <strong>
                    ${invoice.invoiceNumber}
                    </strong>
                </td>
            </tr>



            <tr>
                <td>
                    Invoice Date
                </td>

                <td>
                    ${new Date(invoice.invoiceDate)
                    .toLocaleDateString()}
                </td>
            </tr>



            <tr>
                <td>
                    Due Date
                </td>

                <td>
                    ${new Date(invoice.dueDate)
                    .toLocaleDateString()}
                </td>
            </tr>



            <tr>
                <td>
                    Status
                </td>

                <td>
                    ${invoice.status}
                </td>
            </tr>


        </table>



        <br/>


        <h3>Amount Details</h3>


        <table style="
            width:100%;
            border-collapse:collapse;
        ">


            <tr>
                <td>
                    Sub Total
                </td>

                <td>
                    ${invoice.business.currency || "₹"} ${invoice.subTotal}
                </td>
            </tr>



            <tr>
                <td>
                    Tax
                </td>

                <td>
                    ${invoice.business.currency || "₹"} ${invoice.totalTax}
                </td>
            </tr>



            <tr>
                <td>
                    Discount
                </td>

                <td>
                    ${invoice.business.currency || "₹"} ${invoice.totalDiscount}
                </td>
            </tr>



            <tr>
                <td>
                    <strong>
                    Total Payable
                    </strong>
                </td>

                <td>
                    <strong>
                    ${invoice.business.currency || "₹"} ${invoice.grandTotal}
                    </strong>
                </td>
            </tr>


        </table>



        <br/>



        <h3>Payment Information</h3>


        <p>
            Payment Method:
            <strong>
            ${invoice.paymentMethod}
            </strong>
        </p>



        <p>
            Terms and Conditions:
            <br/>
            ${invoice.termsAndConditions}
        </p>



        <p>
            ${invoice.notes}
        </p>



        <hr/>


        <p>
            If you have any questions regarding this invoice,
            please contact us.
        </p>



        <p>
            Regards,
            <br/>

            <strong>
            ${invoice.business.businessName}
            </strong>

            <br/>

            Billing Department
        </p>


    </div>

    `;



    return {

        subject,

        body

    };

};



export default generateInvoiceEmailContent;