import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendScoreDropAlert(
    email: string,
    domain: string,
    oldScore: number,
    newScore: number
) {
    try {
        await resend.emails.send({
            from: 'PrivacyChecker <alerts@privacychecker.pro>',
            to: email,
            subject: `⚠️ Privacy score dropped for ${domain}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc2626;">⚠️ Score Alert</h1>
                    <p>Your privacy compliance score for <strong>${domain}</strong> has dropped.</p>
                    
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="text-align: center;">
                                    <p style="color: #666; margin: 0;">Previous Score</p>
                                    <p style="font-size: 36px; font-weight: bold; color: #22c55e; margin: 10px 0;">${oldScore}</p>
                                </td>
                                <td style="text-align: center; font-size: 24px;">→</td>
                                <td style="text-align: center;">
                                    <p style="color: #666; margin: 0;">Current Score</p>
                                    <p style="font-size: 36px; font-weight: bold; color: #dc2626; margin: 10px 0;">${newScore}</p>
                                </td>
                            </tr>
                        </table>
                        <p style="text-align: center; color: #dc2626; font-weight: bold;">
                            Drop of ${oldScore - newScore} points
                        </p>
                    </div>
                    
                    <p>This could be due to:</p>
                    <ul>
                        <li>New trackers detected on your site</li>
                        <li>Missing privacy policy or cookie consent</li>
                        <li>New third-party scripts added</li>
                    </ul>
                    
                    <a href="https://privacychecker.pro" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                        View Full Report
                    </a>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 32px;">
                        You're receiving this because you have a Pro subscription. 
                        <a href="https://privacychecker.pro/dashboard">Manage preferences</a>
                    </p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

export async function sendMonthlyReportEmail(
    email: string,
    domain: string,
    score: number,
    issuesCount: number
) {
    try {
        await resend.emails.send({
            from: 'PrivacyChecker <reports@privacychecker.pro>',
            to: email,
            subject: `📊 Monthly Privacy Report for ${domain}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1e40af;">📊 Monthly Privacy Report</h1>
                    <p>Here's your monthly privacy compliance summary for <strong>${domain}</strong>.</p>
                    
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                        <p style="color: #666; margin: 0;">Current Score</p>
                        <p style="font-size: 48px; font-weight: bold; color: ${score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#dc2626'}; margin: 10px 0;">${score}</p>
                        <p style="color: #666;">out of 100</p>
                    </div>
                    
                    <p><strong>${issuesCount}</strong> issues require your attention.</p>
                    
                    <a href="https://privacychecker.pro/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                        View Full Report
                    </a>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 32px;">
                        This is your monthly automated scan. 
                        <a href="https://privacychecker.pro/dashboard">Manage your subscription</a>
                    </p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}
