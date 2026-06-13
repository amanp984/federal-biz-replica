import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, DemoNotice } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — FED BUSINESS" },
      { name: "description", content: "Privacy policy describing data handling within the FED BUSINESS educational demonstration portal." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" subtitle="How information is handled within this educational demonstration">
      <DemoNotice />

      <h2>1. Introduction</h2>
      <p>
        This website operates as a demonstration environment for educational purposes.
        This Privacy Policy describes how information you provide or generate while
        using the portal is collected, used, retained and protected. By accessing the
        portal you acknowledge that you have read and understood this policy. Because
        the portal does not provide regulated banking services, the data handled by it
        is materially different in nature, scope and sensitivity from data handled by a
        production financial institution.
      </p>

      <h2>2. Information Collection</h2>
      <p>
        The portal collects only the information necessary to operate the demonstration
        flows. This includes credentials entered on the login screen, captcha responses,
        OTP values entered during verification, simulated form submissions, and
        operational metadata that supports navigation and rendering. You should not
        enter real, sensitive personal information into the portal. Submission of real
        identifiers is neither requested nor required.
      </p>

      <h2>3. Browser Data</h2>
      <p>
        When you visit the portal, your browser automatically transmits routine technical
        information such as the browser name and version, the operating system, the
        screen resolution, the referring page, the requested URL, the time of the
        request and the IP address of the connection. This information is used to
        deliver content correctly, support diagnostics and improve compatibility with
        the devices used by visitors. This website operates as a demonstration
        environment for educational purposes and does not use browser data for
        commercial profiling.
      </p>

      <h2>4. Cookies</h2>
      <p>
        The portal may use cookies and equivalent storage mechanisms — including
        localStorage and sessionStorage — to preserve session state, remember interface
        preferences, retain demonstration progress and support authentication flows.
        Cookies set by the portal are functional in nature and are not used for
        cross-site advertising. You can configure your browser to restrict, block or
        delete cookies; doing so may affect the operation of certain interactive
        elements of the demonstration.
      </p>

      <h2>5. Session Data</h2>
      <p>
        While you are logged in, the portal retains a small amount of session
        information necessary to maintain your authenticated state, track inactivity
        timeouts, render context-appropriate navigation and ensure that operations
        attributed to your session can be performed correctly. This session information
        is cleared automatically when you log out, when your session expires or when
        you clear your browser data.
      </p>

      <h2>6. Technical Logs</h2>
      <p>
        Operational logs may be generated to record events such as page requests,
        errors, API calls within the demonstration, and security-related events. These
        logs assist with diagnosing issues, monitoring performance and protecting the
        portal from misuse. Where logs incidentally contain technical identifiers, those
        identifiers are used solely for the operation and security of the portal.
      </p>

      <h2>7. Data Usage</h2>
      <p>
        Information collected by the portal is used to: operate and maintain the
        demonstration; authenticate sessions and prevent unauthorized access; deliver
        and render content correctly; respond to user actions in real time; analyze
        usage patterns in an aggregated form; protect the portal from abuse; and
        improve the educational quality of the demonstration. This website operates as
        a demonstration environment for educational purposes and does not sell, rent or
        trade information to third parties.
      </p>

      <h2>8. Data Storage</h2>
      <p>
        Information processed by the portal may be stored within infrastructure used to
        host the demonstration. Reasonable technical and organisational measures are
        applied to safeguard stored information. Data retention is limited to what is
        necessary to operate the portal, satisfy diagnostic needs and protect against
        misuse. Demonstration data may be reset, purged or refreshed periodically without
        prior notice.
      </p>

      <h2>9. Data Sharing</h2>
      <p>
        Information is not shared with third parties for marketing purposes. Limited
        information may be shared with infrastructure providers (such as hosting and
        analytics platforms) strictly to operate the demonstration. Where required by
        law, information may be disclosed in response to lawful requests by public
        authorities, including to meet national security or law enforcement
        requirements.
      </p>

      <h2>10. User Rights</h2>
      <p>
        Subject to applicable law, you may have the right to access information about
        you held by the portal, request correction of inaccurate information, request
        deletion of information no longer required for the operation of the
        demonstration, restrict or object to certain processing activities, and lodge a
        complaint with a competent supervisory authority. Because this is a
        demonstration environment, the volume and nature of personal information
        retained is intentionally minimal, which simplifies the exercise of these
        rights.
      </p>

      <h2>11. Security Measures</h2>
      <p>
        Reasonable technical and organisational safeguards are applied to protect
        information processed by the portal. These include transport-layer encryption
        for data in transit, access controls on supporting infrastructure, periodic
        review of security configurations and operational logging. No system can be
        guaranteed to be entirely secure, and users are encouraged to apply prudent
        personal security practices in addition to those provided by the portal.
      </p>

      <h2>12. Third Party Services</h2>
      <p>
        The portal may rely on third-party infrastructure to deliver content, host
        assets, perform analytics or support specific demonstration flows. Each such
        third party operates under its own privacy practices. References to or
        integrations with third-party services do not imply endorsement or any
        partnership beyond what is necessary for the demonstration.
      </p>

      <h2>13. Analytics Information</h2>
      <p>
        Aggregated and anonymised analytics may be collected to understand how the
        demonstration is used, identify pages and flows that require improvement, and
        ensure that supported devices and browsers continue to render the portal
        correctly. Analytics information is processed in a form that does not identify
        individual visitors.
      </p>

      <h2>14. Children's Privacy</h2>
      <p>
        The portal is not directed at children. We do not knowingly collect information
        from individuals known to be under the age applicable in the user's jurisdiction
        for independent online consent. If you believe a child has provided information
        to the portal, please request its removal using the contact details below.
      </p>

      <h2>15. International Data Transfers</h2>
      <p>
        Infrastructure used to operate the demonstration may be located in jurisdictions
        different from your own. Where information is transferred internationally,
        reasonable steps are taken to ensure that it remains protected in accordance
        with this Privacy Policy and applicable law.
      </p>

      <h2>16. Updates to this Policy</h2>
      <p>
        This Privacy Policy may be updated periodically to reflect changes in the
        portal, in applicable law or in industry practice. Material updates will be
        reflected on this page. Continued use of the portal following any update
        constitutes acceptance of the revised policy.
      </p>

      <h2>17. Contact Information</h2>
      <p>
        Because this is an educational demonstration, no real customer-support channel
        is provided. Questions related to the demonstration's privacy practices may be
        directed to the project maintainers through the channels associated with the
        repository or distribution where this demonstration was obtained.
      </p>

      <p className="text-xs text-muted-foreground border-t pt-4 mt-6">
        This website operates as a demonstration environment for educational purposes
        and does not provide regulated banking, payment or financial services of any kind.
      </p>
    </LegalPage>
  );
}