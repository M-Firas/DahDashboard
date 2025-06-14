module.exports = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 20px !important;
            }

            .otp-code {
                font-size: 24px !important;
            }

            h1 {
                font-size: 22px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table class="email-container" width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff; padding:40px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1); font-family:Arial, sans-serif;">
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <h1 style="margin:0; color:#5C5C5C;">DashDah</h1>
                            <p style="color:#B87E8E; font-size:16px;">{{title}}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="font-size:16px; color:#5C5C5C;">Hello <strong>{{name}}</strong>,</p>
                            <p style="font-size:16px; color:#5C5C5C;">{{welcoming}}. Please use the OTP
                                below to {{purpose}}:</p>
                            <p class="otp-code"
                                style="font-size:32px; color:#B87E8E; text-align:center; font-weight:bold; letter-spacing:4px; margin:20px 0;">
                                {{otp}}</p>
                            <p style="font-size:14px; color:#999999; text-align:center;">This code is valid for 10
                                minutes.</p>
                            <p style="font-size:16px; color:#5C5C5C;">If you didn’t request this, please ignore this
                                email.</p>
                            <p style="font-size:16px; color:#5C5C5C;">Best regards,<br />The DashDah Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top:30px;">
                            <small style="color:#bbbbbb;">© 2025 DashDah. All rights reserved.</small>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
`