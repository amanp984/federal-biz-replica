import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, DemoNotice } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — FED BUSINESS" },
      { name: "description", content: "Terms and conditions governing use of the FED BUSINESS educational demonstration portal." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" subtitle="Please read these terms carefully before using the portal">
      <DemoNotice />

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using this portal, you acknowledge that you have read,
        understood and agree to be bound by these Terms &amp; Conditions in their entirety.
        This platform is intended solely for educational, demonstration and
        user-interface testing purposes. If you do not agree with any portion of these
        terms, you must discontinue use immediately. Continued use of the portal
        constitutes ongoing acceptance of these terms and of any future modifications
        published from time to time.
      </p>

      <h2>2. Demo Environment</h2>
      <p>
        This portal simulates the visual and functional characteristics of a corporate
        banking environment. It does not connect to any real banking system, does not
        hold real funds, does not process real payments and does not provide any
        regulated financial service. All account numbers, customer identifiers,
        balances, transactions, statements, beneficiaries and supporting data shown
        within the portal are illustrative and exist only within the bounds of the
        demonstration. No reliance should be placed on any information presented as if
        it were a real financial record.
      </p>

      <h2>3. Educational Purpose Statement</h2>
      <p>
        This platform is intended solely for educational, demonstration and
        user-interface testing purposes. Its objective is to illustrate workflows,
        layouts, interaction patterns and design conventions commonly observed in
        corporate banking software. It may be used for personal learning, instructional
        delivery, design review, accessibility evaluation, usability testing and
        comparable non-commercial activities.
      </p>

      <h2>4. User Responsibilities</h2>
      <p>
        Users are expected to engage with the portal in good faith and in accordance
        with applicable laws. You agree to provide accurate information where requested
        within the demonstration flows, refrain from impersonating real individuals or
        institutions, and use the portal only for purposes consistent with its
        educational nature. You are responsible for the security of the device, network
        and account from which you access the portal, and for any actions taken under
        your session.
      </p>

      <h2>5. Account Usage Rules</h2>
      <ul>
        <li>Use only the credentials issued or designated for demonstration purposes.</li>
        <li>Do not attempt to access accounts or sessions belonging to others.</li>
        <li>Do not attempt to extract, copy or redistribute simulated account data as if it were genuine.</li>
        <li>Treat all demonstration data as fictional and non-binding.</li>
      </ul>

      <h2>6. Prohibited Activities</h2>
      <p>
        You agree not to engage in any of the following activities while using the
        portal:
      </p>
      <ul>
        <li>Attempting to circumvent, disable or interfere with security features.</li>
        <li>Reverse engineering, decompiling or disassembling any portion of the portal.</li>
        <li>Introducing malware, scripts or automated agents intended to disrupt service.</li>
        <li>Performing load, stress or penetration testing without prior written authorization.</li>
        <li>Using the portal to deceive third parties by presenting demonstration data as authentic.</li>
        <li>Scraping, harvesting or otherwise collecting content for unauthorized redistribution.</li>
        <li>Violating any applicable local, national or international law.</li>
      </ul>
      <p>
        Violation of these prohibitions may result in immediate termination of access
        and, where appropriate, referral to relevant authorities.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content, design elements, layouts, graphics, source code, copy, iconography
        and supporting materials displayed on this portal are owned by the operators of
        the demonstration or licensed for use within it. Branding, trademarks and trade
        dress that may resemble those of real institutions are used solely for
        illustrative purposes within an educational context and do not imply any
        endorsement, partnership or affiliation. No license, right or interest is
        granted by these terms beyond the limited permission to view and interact with
        the portal for personal educational use.
      </p>

      <h2>8. Service Availability</h2>
      <p>
        This platform is intended solely for educational, demonstration and
        user-interface testing purposes, and is provided on an "as available" basis. We
        do not guarantee that the portal will be available continuously, free of
        interruption, free of error, or compatible with every device or browser. Planned
        maintenance, unplanned outages, infrastructure changes and updates to the
        underlying demonstration may temporarily affect availability. No service-level
        commitment is provided for the demonstration environment.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, the operators of this portal disclaim
        all liability arising from or related to your use of the portal, including but
        not limited to direct, indirect, incidental, consequential, special, punitive
        and exemplary damages. This includes losses arising from reliance on
        demonstration data, errors or omissions in displayed content, interruptions in
        service, unauthorized access to your device or accounts on third-party
        platforms, or any other matter related to the portal. Because no real banking
        services are offered, no compensation, refund, reimbursement or restitution is
        available through this environment.
      </p>

      <h2>10. Data Handling</h2>
      <p>
        Any information you enter while using the portal is processed solely to operate
        the demonstration. Real personally identifiable information should not be
        entered, as the portal is not designed to handle production-grade personal
        data. Where information is logged or stored for the operation of the
        demonstration, it is treated in accordance with the Privacy Policy. You should
        not assume that demonstration data is subject to the same protections that
        apply to real banking records.
      </p>

      <h2>11. Website Usage</h2>
      <p>
        You agree to access the portal only through the interfaces provided. Automated
        access, scraping, scripting, mass downloading or interaction patterns that are
        inconsistent with normal human use are not permitted unless expressly authorized.
        You agree not to interfere with the operation of the portal for other users and
        not to use the portal in any way that imposes a disproportionate load on its
        infrastructure.
      </p>

      <h2>12. Third-Party Services</h2>
      <p>
        The portal may reference, link to or integrate with third-party services solely
        to demonstrate common patterns observed in production banking environments.
        These references are illustrative only. Operators of the portal do not endorse,
        verify or assume responsibility for the practices of any third party. Use of any
        third-party service is subject to that service's own terms and policies.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        These terms may be updated, supplemented or replaced at any time without prior
        notice. Material changes will be reflected on this page with an updated revision
        date. It is your responsibility to review the terms periodically to remain
        informed of any modifications. Continued use of the portal following the posting
        of any change constitutes acceptance of the revised terms.
      </p>

      <h2>14. Termination</h2>
      <p>
        Access to the portal may be suspended, restricted or terminated at any time, at
        the discretion of its operators, with or without cause and with or without
        notice. Upon termination, your right to access the portal will cease
        immediately. Provisions which by their nature should survive termination —
        including limitation of liability, intellectual property and governing law — will
        remain in effect.
      </p>

      <h2>15. Governing Law</h2>
      <p>
        These terms are provided as part of an educational demonstration. To the extent
        any legal question arises in connection with their interpretation, they shall be
        construed in accordance with general principles of contract law applicable to
        non-commercial educational projects, and any dispute shall be addressed in good
        faith between the parties.
      </p>

      <h2>16. Entire Understanding</h2>
      <p>
        These terms, together with the Privacy Policy and Disclaimer published on this
        portal, constitute the entire understanding between you and the operators of the
        portal regarding your use of the demonstration. They supersede any prior
        statements, communications or expectations regarding the portal's purpose,
        functionality or content.
      </p>

      <p className="text-xs text-muted-foreground border-t pt-4 mt-6">
        This platform is intended solely for educational, demonstration and
        user-interface testing purposes. Nothing on this portal constitutes a binding
        offer, legal advice, financial advice or regulated banking service.
      </p>
    </LegalPage>
  );
}