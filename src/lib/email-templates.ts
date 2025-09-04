import { getEmailDomainType, getEmailVerificationLevel } from './email-verification';

export interface EmailTemplateData {
  userName: string;
  userEmail: string;
  teamName?: string;
  verificationUrl: string;
  inviteCode?: string;
  organizationType: string;
  verificationLevel: 'high' | 'medium' | 'low';
}

export function generateWelcomeEmailHTML(data: EmailTemplateData): string {
  const { userName, userEmail, teamName, verificationUrl, organizationType, verificationLevel } = data;
  
  const securityBadge = verificationLevel === 'high' 
    ? '🏆 Verified Robotics Organization'
    : verificationLevel === 'medium' 
    ? '🎓 Educational Institution'
    : '📧 Standard Account';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Inventry - Verify Your Account</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome-section h2 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .security-badge {
            display: inline-block;
            background: #e2e8f0;
            color: #4a5568;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .verification-section {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .verification-section h3 {
            color: #2d3748;
            margin-top: 0;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        .feature-desc {
            color: #718096;
            font-size: 14px;
        }
        .security-info {
            background: #fef5e7;
            border: 1px solid #f6ad55;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .security-info h4 {
            color: #c05621;
            margin-top: 0;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-links a {
            color: #90cdf4;
            text-decoration: none;
            margin: 0 15px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #90cdf4;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Inventry</h1>
            <p>Community-Driven Robotics Inventory Platform</p>
        </div>
        
        <div class="content">
            <div class="welcome-section">
                <h2>Welcome to Inventry, ${userName}!</h2>
                <div class="security-badge">${securityBadge}</div>
                <p>You're joining a secure platform designed specifically for robotics teams and educational institutions.</p>
            </div>

            <div class="verification-section">
                <h3>🔐 Secure Account Verification Required</h3>
                <p>To ensure the safety and security of our community, we require email verification from all users. Your account is associated with:</p>
                <ul>
                    <li><strong>Email:</strong> ${userEmail}</li>
                    <li><strong>Organization Type:</strong> ${organizationType}</li>
                    ${teamName ? `<li><strong>Team:</strong> ${teamName}</li>` : ''}
                </ul>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="verify-button">
                        ✅ Verify Your Account
                    </a>
                </div>
                
                <p><strong>⚠️ Important:</strong> This link expires in 24 hours for security purposes.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📦</div>
                    <div class="feature-title">Smart Inventory</div>
                    <div class="feature-desc">Track your robotics parts with AI-powered invoice scanning</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-title">Part Lending</div>
                    <div class="feature-desc">Share resources with other teams in your community</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🗺️</div>
                    <div class="feature-title">Team Discovery</div>
                    <div class="feature-desc">Find and connect with robotics teams near you</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-title">Leaderboards</div>
                    <div class="feature-desc">Celebrate gracious professionalism with lending stats</div>
                </div>
            </div>

            <div class="security-info">
                <h4>🛡️ Child Safety & Security Measures</h4>
                <ul>
                    <li><strong>Educational Email Verification:</strong> Accounts are verified through institutional emails</li>
                    <li><strong>Multi-Factor Authentication:</strong> Additional GitHub verification available</li>
                    <li><strong>Supervised Accounts:</strong> Team-based access with mentor oversight</li>
                    <li><strong>Privacy Protection:</strong> No personal information sharing outside your team</li>
                    <li><strong>Secure Communication:</strong> All interactions are logged and monitored</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Questions or need help?</strong></p>
                <p>Contact our support team at <a href="mailto:support@inventry.app">support@inventry.app</a></p>
                <p>or visit our <a href="https://docs.inventry.app">documentation</a> for guides and tutorials.</p>
            </div>
        </div>

        <div class="footer">
            <h3>🤖 Inventry</h3>
            <p>Empowering robotics education through secure resource sharing</p>
            
            <div class="footer-links">
                <a href="https://inventry.app/privacy">Privacy Policy</a>
                <a href="https://inventry.app/terms">Terms of Service</a>
                <a href="https://inventry.app/safety">Child Safety Guidelines</a>
                <a href="https://docs.inventry.app">Documentation</a>
            </div>
            
            <div class="social-links">
                <a href="https://github.com/inventry">📱 GitHub</a>
                <a href="https://twitter.com/inventryapp">🐦 Twitter</a>
                <a href="https://discord.gg/inventry">💬 Discord</a>
            </div>
            
            <p style="font-size: 12px; opacity: 0.7; margin-top: 20px;">
                This email was sent to ${userEmail} because you created an account on Inventry.<br>
                If you didn't create this account, please ignore this email or contact support.
            </p>
        </div>
    </div>
</body>
</html>`;
}

export function generateWelcomeEmailText(data: EmailTemplateData): string {
  const { userName, userEmail, teamName, verificationUrl, organizationType } = data;
  
  return `
WELCOME TO INVENTRY - ROBOTICS INVENTORY PLATFORM
=================================================

Hello ${userName}!

Welcome to Inventry, the secure community-driven robotics inventory platform designed specifically for educational institutions and robotics teams.

ACCOUNT VERIFICATION REQUIRED
------------------------------
For security and child safety, we require email verification:

• Email: ${userEmail}
• Organization: ${organizationType}
${teamName ? `• Team: ${teamName}` : ''}

Verify your account: ${verificationUrl}
⚠️ This link expires in 24 hours.

WHAT YOU'LL GET ACCESS TO
-------------------------
📦 Smart Inventory Management - Track parts with AI-powered invoice scanning
🤝 Part Lending Network - Share resources with other teams
🗺️ Team Discovery - Connect with robotics teams in your area  
🏆 Leaderboards - Celebrate gracious professionalism

SECURITY & CHILD SAFETY
------------------------
• Educational email verification required
• Multi-factor authentication available
• Team-based supervised access
• Privacy protection and secure communication
• All interactions logged and monitored

NEED HELP?
----------
Email: support@inventry.app
Documentation: https://docs.inventry.app
Child Safety Guidelines: https://inventry.app/safety

Thank you for joining our secure robotics community!

The Inventry Team
🤖 Empowering robotics education through secure resource sharing

---
This email was sent to ${userEmail} because you created an account on Inventry.
If you didn't create this account, please contact support immediately.
`;
}

export function generateEmailVerificationData(
  userName: string,
  userEmail: string,
  verificationUrl: string,
  teamName?: string
): EmailTemplateData {
  return {
    userName,
    userEmail,
    teamName,
    verificationUrl,
    organizationType: getEmailDomainType(userEmail),
    verificationLevel: getEmailVerificationLevel(userEmail)
  };
}
