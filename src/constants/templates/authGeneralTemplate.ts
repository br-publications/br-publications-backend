export const AUTH_TEMPLATES = {
    EMAIL_VERIFICATION: {
        subject: 'Email Verification - BR Publications',
        content: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f0ede8;
            font-family: 'DM Sans', sans-serif;
            padding: 40px 16px;
        }

        .wrapper {
            max-width: 600px;
            margin: 0 auto;
        }

        .card {
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08);
        }

        /* Header */
        .header {
            background: #0f0f0f;
            padding: 44px 48px 40px;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.04);
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -40px;
            left: 30px;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 32px;
        }

        .logo-mark {
            width: 36px;
            height: 36px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-mark svg {
            width: 20px;
            height: 20px;
        }

        .logo-name {
            font-family: 'DM Serif Display', serif;
            font-size: 20px;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .header h1 {
            font-family: 'DM Serif Display', serif;
            font-size: 36px;
            color: #ffffff;
            line-height: 1.2;
            font-weight: 400;
        }

        .header h1 span {
            color: #c8f261;
        }

        /* Body */
        .body {
            padding: 48px 48px 40px;
        }

        .greeting {
            font-size: 17px;
            color: #4a4a4a;
            line-height: 1.6;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #0f0f0f;
            font-weight: 600;
        }

        .intro {
            font-size: 15px;
            color: #6b6b6b;
            line-height: 1.7;
            margin-bottom: 36px;
        }

        /* OTP Block */
        .otp-section {
            background: #f7f5f2;
            border-radius: 14px;
            padding: 32px;
            text-align: center;
            margin-bottom: 36px;
            border: 1.5px solid #e8e4de;
        }

        .otp-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #9b9b9b;
            margin-bottom: 14px;
        }

        .otp-code {
            font-size: 48px;
            font-family: 'DM Serif Display', serif;
            color: #0f0f0f;
            letter-spacing: 0.18em;
            line-height: 1;
            margin-bottom: 16px;
        }

        .otp-timer {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff3cd;
            border: 1px solid #ffe08a;
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 12px;
            font-weight: 500;
            color: #8a6400;
        }

        .otp-timer svg {
            width: 13px;
            height: 13px;
        }

        /* Info blocks */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 36px;
        }

        .info-item {
            background: #fafaf9;
            border: 1px solid #ebebeb;
            border-radius: 10px;
            padding: 16px 18px;
        }

        .info-item-icon {
            font-size: 18px;
            margin-bottom: 8px;
        }

        .info-item-title {
            font-size: 12px;
            font-weight: 600;
            color: #0f0f0f;
            margin-bottom: 4px;
        }

        .info-item-text {
            font-size: 12px;
            color: #7a7a7a;
            line-height: 1.5;
        }

        .security-note {
            background: #fff5f5;
            border-left: 3px solid #e53e3e;
            border-radius: 0 8px 8px 0;
            padding: 14px 18px;
            margin-bottom: 36px;
        }

        .security-note p {
            font-size: 13px;
            color: #c53030;
            line-height: 1.6;
        }

        .security-note strong {
            font-weight: 600;
        }

        .closing {
            font-size: 15px;
            color: #6b6b6b;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        .sign {
            font-size: 15px;
            color: #4a4a4a;
            line-height: 1.6;
        }

        .sign strong {
            display: block;
            font-family: 'DM Serif Display', serif;
            font-size: 18px;
            color: #0f0f0f;
            font-weight: 400;
            margin-top: 4px;
        }

        /* Footer */
        .footer {
            background: #f7f5f2;
            padding: 28px 48px;
            border-top: 1px solid #ebebeb;
        }

        .footer p {
            font-size: 12px;
            color: #9b9b9b;
            line-height: 1.7;
            text-align: center;
        }

        .footer a {
            color: #6b6b6b;
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #dedede, transparent);
            margin: 32px 0;
        }

        @media (max-width: 480px) {

            .header,
            .body,
            .footer {
                padding-left: 28px;
                padding-right: 28px;
            }

            .otp-code {
                font-size: 36px;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 28px;
            }
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="card">

            <!-- Body -->
            <div class="body">
                <p class="greeting">Hello, <strong>{{name}}</strong> 👋</p>
                <p class="intro">
                    We received a request to verify your identity on your account. Use the one-time password below to
                    complete your verification. This code is unique to you and should not be shared with anyone.
                </p>

                <!-- OTP -->
                <div class="otp-section">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">{{otp}}</div>
                    <span class="otp-timer">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#8a6400" stroke-width="2" />
                            <path d="M12 6v6l4 2" stroke="#8a6400" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        Expires in 10 minutes
                    </span>
                </div>

                <!-- Info Grid -->
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-item-icon">🔒</div>
                        <div class="info-item-title">Single Use Only</div>
                        <div class="info-item-text">This code can only be used once and expires immediately after.</div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-icon">⏱️</div>
                        <div class="info-item-title">Time Sensitive</div>
                        <div class="info-item-text">Enter the code within 10 minutes before it becomes invalid.</div>
                    </div>
                </div>

                <p class="closing">
                    If you're having trouble or didn't request this, feel free to reach out to our support team — we're
                    happy to help.
                </p>

                <p class="sign">
                    Warm regards,
                    <strong>The BR Publications Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>
                    This email was sent to you because a verification was requested on your account.<br>
                    © {{currentYear}} BR Publications, Inc. </p>
            </div>
        </div>
    </div>
</body>

</html>`
    },
    PASSWORD_RESET_OTP: {
        subject: 'Password Reset OTP - BR Publications',
        content: `<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Password Reset</title>

<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>

<style>
*{margin:0;padding:0;box-sizing:border-box;}

body{
background:#f0ede8;
font-family:'DM Sans',sans-serif;
padding:40px 16px;
}

.wrapper{
max-width:600px;
margin:0 auto;
}

.card{
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 4px 40px rgba(0,0,0,0.08);
}

.body{
padding:48px 48px 40px;
}

.greeting{
font-size:17px;
color:#4a4a4a;
line-height:1.6;
margin-bottom:8px;
}

.greeting strong{
color:#0f0f0f;
font-weight:600;
}

.intro{
font-size:15px;
color:#6b6b6b;
line-height:1.7;
margin-bottom:36px;
}

.otp-section{
background:#f7f5f2;
border-radius:14px;
padding:32px;
text-align:center;
margin-bottom:36px;
border:1.5px solid #e8e4de;
}

.otp-label{
font-size:11px;
font-weight:600;
letter-spacing:0.12em;
text-transform:uppercase;
color:#9b9b9b;
margin-bottom:14px;
}

.otp-code{
font-size:48px;
font-family:'DM Serif Display',serif;
color:#0f0f0f;
letter-spacing:0.18em;
line-height:1;
margin-bottom:16px;
}

.otp-timer{
display:inline-flex;
align-items:center;
gap:6px;
background:#fff3cd;
border:1px solid #ffe08a;
border-radius:20px;
padding:5px 14px;
font-size:12px;
font-weight:500;
color:#8a6400;
}

.info-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:12px;
margin-bottom:36px;
}

.info-item{
background:#fafaf9;
border:1px solid #ebebeb;
border-radius:10px;
padding:16px 18px;
}

.info-item-title{
font-size:12px;
font-weight:600;
color:#0f0f0f;
margin-bottom:4px;
}

.info-item-text{
font-size:12px;
color:#7a7a7a;
line-height:1.5;
}

.security-note{
background:#fff5f5;
border-left:3px solid #e53e3e;
border-radius:0 8px 8px 0;
padding:14px 18px;
margin-bottom:36px;
}

.security-note p{
font-size:13px;
color:#c53030;
line-height:1.6;
}

.sign{
font-size:15px;
color:#4a4a4a;
line-height:1.6;
}

.sign strong{
display:block;
font-family:'DM Serif Display',serif;
font-size:18px;
color:#0f0f0f;
font-weight:400;
margin-top:4px;
}

.footer{
background:#f7f5f2;
padding:28px 48px;
border-top:1px solid #ebebeb;
}

.footer p{
font-size:12px;
color:#9b9b9b;
line-height:1.7;
text-align:center;
}

@media(max-width:480px){
.body,.footer{padding-left:28px;padding-right:28px;}
.otp-code{font-size:36px;}
.info-grid{grid-template-columns:1fr;}
}
</style>
</head>

<body>

<div class="wrapper">
<div class="card">

<div class="body">

<p class="greeting">Hello, <strong>{{name}}</strong> 👋</p>

<p class="intro">
We received a request to reset the password for your BR Publications account.
Use the one-time password (OTP) below to securely reset your password.
</p>

<div class="otp-section">
<div class="otp-label">Password Reset OTP</div>
<div class="otp-code">{{otp}}</div>

<span class="otp-timer">
⏱ Expires in 10 minutes
</span>
</div>

<div class="info-grid">

<div class="info-item">
<div class="info-item-title">Single Use</div>
<div class="info-item-text">
This OTP can be used only once to reset your password.
</div>
</div>

<div class="info-item">
<div class="info-item-title">Security</div>
<div class="info-item-text">
Never share this code with anyone. Our team will never ask for it.
</div>
</div>

</div>

<div class="security-note">
<p>
<strong>Didn't request a password reset?</strong><br>
You can safely ignore this email. Your password will remain unchanged.
</p>
</div>

<p class="sign">
Best regards,<br>
<strong>The BR Publications Team</strong>
</p>

</div>

<div class="footer">
<p>
This email was sent because a password reset request was initiated on your account.<br>
© {{currentYear}} BR Publications, Inc.
</p>
</div>

</div>
</div>

</body>
</html>`
    },
    ACCOUNT_DEACTIVATED: {
        subject: 'Account Deactivated - ResNova',
        description: 'Sent when an administrator deactivates a user account.',
        variables: ['name'],
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deactivated</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f0ede8; font-family: 'DM Sans', sans-serif; padding: 40px 16px; }
        .wrapper { max-width: 600px; margin: 0 auto; }
        .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08); }
        .body { padding: 48px 48px 40px; }
        .greeting { font-size: 17px; color: #4a4a4a; line-height: 1.6; margin-bottom: 8px; }
        .greeting strong { color: #0f0f0f; font-weight: 600; }
        .intro { font-size: 15px; color: #6b6b6b; line-height: 1.7; margin-bottom: 36px; }
        .status-box { background: #fff5f5; border-radius: 14px; padding: 32px; text-align: center; margin-bottom: 36px; border: 1.5px solid #fed7d7; }
        .status-icon { font-size: 48px; margin-bottom: 16px; }
        .status-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #e53e3e; margin-bottom: 8px; }
        .status-title { font-size: 28px; font-family: 'DM Serif Display', serif; color: #0f0f0f; margin-bottom: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 36px; }
        .info-item { background: #fafaf9; border: 1px solid #ebebeb; border-radius: 10px; padding: 16px 18px; }
        .info-item-title { font-size: 12px; font-weight: 600; color: #0f0f0f; margin-bottom: 4px; }
        .info-item-text { font-size: 12px; color: #7a7a7a; line-height: 1.5; }
        .sign { font-size: 15px; color: #4a4a4a; line-height: 1.6; }
        .sign strong { display: block; font-family: 'DM Serif Display', serif; font-size: 18px; color: #0f0f0f; font-weight: 400; margin-top: 4px; }
        .footer { background: #f7f5f2; padding: 28px 48px; border-top: 1px solid #ebebeb; }
        .footer p { font-size: 12px; color: #9b9b9b; line-height: 1.7; text-align: center; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="body">
                <p class="greeting">Dear <strong>{{name}}</strong>,</p>
                
                <div class="status-box">
                    <div class="status-icon">🚫</div>
                    <div class="status-label">Account Update</div>
                    <div class="status-title">Account Deactivated</div>
                </div>

                <p class="intro">
                    We are writing to inform you that your account on <strong>ResNova</strong> has been deactivated by an administrator or editor.
                    As a result, you will no longer be able to log in to the portal or access your dashboard.
                </p>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-item-title">Next Steps</div>
                        <div class="info-item-text">If you believe this is a mistake or would like to request reactivation, please reach out to our support team.</div>
                    </div>
                </div>

                <p class="sign">Best regards,<br><strong>The ResNova Team</strong></p>
            </div>
            <div class="footer">
                <p>© {{currentYear}} BR Publications, Inc.</p>
            </div>
        </div>
    </div>
</body>
</html>`
    },
    ACCOUNT_REACTIVATED: {
        subject: 'Account Reactivated - ResNova',
        description: 'Sent when an administrator reactivates a user account.',
        variables: ['name', 'loginUrl'],
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Reactivated</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f0ede8; font-family: 'DM Sans', sans-serif; padding: 40px 16px; }
        .wrapper { max-width: 600px; margin: 0 auto; }
        .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08); }
        .body { padding: 48px 48px 40px; }
        .greeting { font-size: 17px; color: #4a4a4a; line-height: 1.6; margin-bottom: 8px; }
        .greeting strong { color: #0f0f0f; font-weight: 600; }
        .intro { font-size: 15px; color: #6b6b6b; line-height: 1.7; margin-bottom: 36px; }
        .status-box { background: #f0fdf4; border-radius: 14px; padding: 32px; text-align: center; margin-bottom: 36px; border: 1.5px solid #dcfce7; }
        .status-icon { font-size: 48px; margin-bottom: 16px; }
        .status-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #16a34a; margin-bottom: 8px; }
        .status-title { font-size: 28px; font-family: 'DM Serif Display', serif; color: #0f0f0f; margin-bottom: 12px; }
        .btn-container { text-align: center; margin-bottom: 36px; }
        .btn { display: inline-block; background: #0f0f0f; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .sign { font-size: 15px; color: #4a4a4a; line-height: 1.6; }
        .sign strong { display: block; font-family: 'DM Serif Display', serif; font-size: 18px; color: #0f0f0f; font-weight: 400; margin-top: 4px; }
        .footer { background: #f7f5f2; padding: 28px 48px; border-top: 1px solid #ebebeb; }
        .footer p { font-size: 12px; color: #9b9b9b; line-height: 1.7; text-align: center; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="body">
                <p class="greeting">Hello <strong>{{name}}</strong>,</p>
                
                <div class="status-box">
                    <div class="status-icon">👋</div>
                    <div class="status-label">Good News</div>
                    <div class="status-title">Account Reactivated</div>
                </div>

                <p class="intro">
                    Your account on <strong>ResNova</strong> has been successfully reactivated. 
                    You can now log in using your registered credentials to access your dashboard and continue your work.
                </p>
                
                <p class="sign">Warm regards,<br><strong>The ResNova Team</strong></p>
            </div>
            <div class="footer">
                <p>© {{currentYear}} BR Publications, Inc.</p>
            </div>
        </div>
    </div>
</body>
</html>`
    }
};
