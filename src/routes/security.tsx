import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, DemoNotice } from "@/components/LegalPage";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security Information — FED BUSINESS" },
      { name: "description", content: "Security information, account protection guidelines and safe banking practices for FED BUSINESS demonstration portal." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <LegalPage title="Security Information" subtitle="Account protection, fraud prevention and safe banking guidelines">
      <DemoNotice />

      <h2>1. Our Commitment to Security</h2>
      <p>
        At FED BUSINESS, the protection of customer information and the integrity of
        every interaction with this portal is treated as a foundational priority. This
        page describes the safeguards, customer responsibilities and recommended
        practices that together help maintain a secure online banking environment. While
        this portal is operated strictly as an educational and user-interface
        demonstration, the guidance provided here mirrors industry standards followed by
        regulated financial institutions and should be considered representative rather
        than transactional.
      </p>

      <h2>2. Account Protection Guidelines</h2>
      <p>
        Your account is the gateway to your financial identity. Keeping it secure
        requires consistent attention to both technical safeguards and personal habits.
        Always treat your User ID, password, customer identification number and any
        related credentials as confidential information. They should never be shared
        with another individual, written on shared documents, stored in plain text on
        any device, or transmitted over insecure channels such as e-mail, text messages
        or social media. Employees of legitimate banking institutions will never request
        full credentials, OTPs, CVV numbers or PINs.
      </p>
      <ul>
        <li>Review account activity periodically and report unrecognized entries immediately.</li>
        <li>Maintain accurate registered mobile number and e-mail address at all times.</li>
        <li>Lock your account when stepping away from your device, even briefly.</li>
        <li>Use only official channels for any account-related queries.</li>
      </ul>

      <h2>3. OTP Safety</h2>
      <p>
        One-Time Passwords are a critical second factor of authentication. Each OTP is
        single-use, time-limited and personal to the transaction or login attempt for
        which it was issued. Never disclose an OTP to anyone — including individuals
        claiming to be from your bank, customer support, a delivery service, a relative
        or a friend. A genuine bank representative will never ask you to read out an OTP
        for any reason. If you receive an OTP that you did not initiate, do not act on
        it, do not share it, and treat it as a potential indication of unauthorized
        access.
      </p>

      <h2>4. Password Protection</h2>
      <p>
        Strong passwords substantially reduce the risk of unauthorized access. We
        recommend creating passwords that combine uppercase letters, lowercase letters,
        numerals and special characters, with a minimum length of twelve characters.
        Avoid using personal information such as birthdays, anniversaries, vehicle
        registration numbers, mobile numbers or the names of family members. Passwords
        used on this portal should be entirely distinct from those used on any other
        website or application. Where possible, change your password periodically and
        immediately following any suspected compromise.
      </p>

      <h2>5. Device Security</h2>
      <p>
        The security of the device you use to access this portal is as important as the
        security of the portal itself. Always keep your operating system, web browser
        and antivirus software up to date. Avoid using public, shared or unmanaged
        computers for banking-related activities. Disable browser features that
        auto-save passwords for banking sites and remove any saved entries from a
        previous session. Lock your device with a strong screen passcode, biometric
        authentication or both, and never leave it unattended in public locations.
      </p>

      <h2>6. Phishing Awareness</h2>
      <p>
        Phishing is a fraudulent attempt to obtain sensitive information by impersonating
        a trusted entity, often through e-mail, text messages, phone calls or fake
        websites. Indicators include unexpected requests for credentials, urgent or
        threatening language, mismatched sender addresses, links that resemble but do
        not match a known web address, and pages that ask for information far beyond
        what is normally required. Always type the bank's official web address directly
        into your browser rather than clicking links in messages. Verify the presence of
        a valid HTTPS certificate before entering any credential.
      </p>

      <h2>7. Fraud Prevention</h2>
      <p>
        Fraud schemes evolve continuously and frequently rely on social engineering
        rather than technical compromise. Be wary of unsolicited offers, prize
        notifications, refund alerts, loan approvals, KYC update requests, courier
        delivery follow-ups and remote-access software installation requests. Never
        install screen-sharing or remote-control software at the behest of a stranger.
        Report suspected fraudulent communications to the appropriate authorities and to
        your actual banking institution promptly. Maintain a written log of any
        suspicious interactions for future reference.
      </p>

      <h2>8. Safe Online Banking Practices</h2>
      <ul>
        <li>Always log in by typing the official portal address directly into your browser.</li>
        <li>Verify that the connection is secured with HTTPS and the certificate is valid.</li>
        <li>Do not access banking services over public or unsecured Wi-Fi networks.</li>
        <li>Use a personal, password-protected device whenever possible.</li>
        <li>Log out completely after each session rather than simply closing the tab.</li>
        <li>Clear browser cache and history after sessions on shared devices.</li>
      </ul>

      <h2>9. Browser Security</h2>
      <p>
        Modern browsers include numerous safeguards that materially reduce risk when
        properly configured. Always use the latest stable version of a reputable
        browser. Enable automatic updates so that security patches are applied without
        delay. Disable or remove browser extensions that are not strictly necessary, as
        extensions can in some cases observe or modify the content of pages, including
        banking pages. Periodically review browser permissions, clear stored credentials
        and avoid installing toolbars or plug-ins from unverified sources.
      </p>

      <h2>10. Session Timeout</h2>
      <p>
        For your protection, sessions on this portal automatically expire after a period
        of inactivity. This reduces the window of opportunity for unauthorized access in
        the event that a device is left unattended. If your session expires, you will be
        required to log in again with full credentials. Do not attempt to bypass session
        timeout mechanisms. Always log out explicitly at the end of every session, even
        on a personal device.
      </p>

      <h2>11. Secure Login Recommendations</h2>
      <ul>
        <li>Confirm the URL in your browser address bar before entering credentials.</li>
        <li>Verify the presence of a valid TLS certificate (padlock icon).</li>
        <li>Use the on-screen captcha exactly as displayed; refresh if unclear.</li>
        <li>Never permit the browser to remember banking passwords.</li>
        <li>Avoid logging in from devices belonging to others.</li>
      </ul>

      <h2>12. Customer Responsibilities</h2>
      <p>
        Security is a shared responsibility. While the institution implements technical
        and procedural safeguards, customers play an indispensable role in protecting
        their own information. Customers are expected to safeguard credentials, exercise
        prudence in their online activities, keep their registered contact information
        up to date, monitor account activity regularly, report anomalies promptly and
        follow published security guidance. Failure to observe these responsibilities
        materially increases the risk of unauthorized access.
      </p>

      <h2>13. Reporting Suspicious Activity</h2>
      <p>
        If you observe any unfamiliar activity, receive unsolicited OTPs or notice
        unexpected changes to your registered information, take immediate action. In a
        real banking context, this would mean contacting the institution's official
        customer support helpline, visiting your home branch, or initiating an in-app
        dispute. As this is a demonstration environment, no real reporting workflow is
        available; the guidance provided here illustrates the behavior expected on
        production banking systems.
      </p>

      <h2>14. Continuous Vigilance</h2>
      <p>
        Threat actors continuously evolve their techniques. Maintaining a strong
        security posture requires ongoing awareness, periodic review of personal
        practices and consistent application of recommended controls. We encourage every
        user to stay informed about emerging fraud patterns, attend awareness sessions
        when available, and treat security as a habit rather than an occasional task.
      </p>

      <p className="text-xs text-muted-foreground border-t pt-4 mt-6">
        This page is provided as part of an educational, user-interface demonstration
        and does not constitute professional security advice or a substitute for the
        official security documentation of any regulated financial institution.
      </p>
    </LegalPage>
  );
}