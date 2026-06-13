import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, DemoNotice } from "@/components/LegalPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — FED BUSINESS" },
      { name: "description", content: "Disclaimer explaining the non-banking, educational and demonstration nature of the FED BUSINESS portal." },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" subtitle="Important information regarding the nature and scope of this portal">
      <DemoNotice />

      <h2>1. Educational Purpose Notice</h2>
      <p>
        This website is a demonstration and educational project only. Its purpose is to
        illustrate, in a realistic but non-functional manner, the typical layouts,
        workflows and visual conventions encountered in modern corporate banking
        applications. Every page, screen, label, balance, transaction, account
        identifier, statement and supporting data point exists solely to serve this
        educational purpose and carries no real-world significance.
      </p>

      <h2>2. No Real Banking Services</h2>
      <p>
        This website is a demonstration and educational project only. It does not
        operate as a bank, payment institution, money services business or any other
        regulated financial entity. It is not licensed, authorised, registered or
        supervised by any banking regulator, central bank, financial conduct authority
        or comparable supervisory body. Any visual similarity to real banking
        institutions is intentional only insofar as it supports the educational purpose
        of demonstrating familiar user-interface patterns.
      </p>

      <h2>3. No Financial Advice</h2>
      <p>
        Nothing displayed on this portal — including any text, label, figure,
        recommendation, calculation, chart or interactive element — constitutes
        financial, investment, tax, legal, accounting or other professional advice. You
        should not act, or refrain from acting, on the basis of any content within the
        portal. For matters relating to real finances, please consult qualified
        professionals or your actual banking institution.
      </p>

      <h2>4. No Financial Products</h2>
      <p>
        No financial product of any kind is offered, sold, marketed, distributed,
        underwritten or facilitated through this portal. Any product names, categories
        or descriptions that appear within the demonstration are placeholders used only
        to illustrate user-interface conventions. They do not represent real product
        offerings and cannot be acquired, redeemed, transferred or relied upon in any
        manner.
      </p>

      <h2>5. No Deposits Accepted</h2>
      <p>
        This portal does not accept deposits, payments, transfers, contributions or
        funds of any kind. No mechanism exists within the demonstration to move real
        money into or out of any real account. Any attempt to send funds based on
        information displayed within this portal would be misdirected; the portal
        provides no facility to receive such funds and disclaims any responsibility for
        their loss.
      </p>

      <h2>6. No Lending Services</h2>
      <p>
        This portal does not offer loans, credit facilities, overdrafts, lines of
        credit, working-capital products, equipment financing or any comparable form of
        lending. Loan-related screens, calculators or applications visible within the
        demonstration exist solely to illustrate user-interface flows. No loan
        application submitted through this portal will result in any disbursement, and
        no obligation is created on behalf of any party.
      </p>

      <h2>7. No Investment Services</h2>
      <p>
        This portal does not provide investment services. It does not facilitate the
        purchase, sale, custody or management of securities, mutual funds, fixed
        deposits, bonds, derivatives, structured products, retirement plans or any
        other investment instrument. Investment-related sections within the
        demonstration are illustrative only and must not be relied upon for any
        real-world investment decision.
      </p>

      <h2>8. No Insurance Services</h2>
      <p>
        This portal does not offer, sell, broker, underwrite, place or service insurance
        policies of any kind. Insurance-related sections within the demonstration are
        illustrative only. No coverage, premium calculation, claim submission or policy
        management performed within the portal has any binding effect, and no real
        insurer is bound by anything displayed.
      </p>

      <h2>9. Demonstration Environment</h2>
      <p>
        This portal is hosted as a demonstration environment. Its behaviour, data,
        styling and navigation may change without notice as the underlying project
        evolves. Demonstration data may be reset or replaced at any time. The
        environment is not designed for production use, and no production-grade
        availability, reliability or durability commitments are provided.
      </p>

      <h2>10. UI Testing Environment</h2>
      <p>
        The portal also serves as a user-interface testing environment, allowing
        designers, developers and researchers to evaluate layouts, interactions and
        accessibility characteristics across devices and browsers. Activity within the
        portal may therefore be monitored and analysed for the purpose of improving the
        demonstration. No personally identifying information is required to perform
        such evaluations, and users should not enter real personal data.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, the operators of this portal disclaim
        all liability for any loss, damage, cost or expense arising directly or
        indirectly from the use of, or inability to use, this portal. This includes
        without limitation any decision taken on the basis of demonstration data, any
        reliance on simulated screens, any technical failure of the portal, and any
        misuse of information by third parties. Because no real banking services are
        provided, no compensation is available through this environment for any
        perceived loss.
      </p>

      <h2>12. Accuracy Disclaimer</h2>
      <p>
        While reasonable effort is made to ensure that the demonstration behaves
        consistently, no representation or warranty is made regarding the accuracy,
        completeness, timeliness or suitability of any content shown within the portal.
        Data shown is illustrative; calculations may be simplified for educational
        purposes; figures, dates and identifiers may not align with any real-world
        reference. Users must not rely on any displayed value as if it were factual.
      </p>

      <h2>13. Availability Disclaimer</h2>
      <p>
        The portal is provided on an "as is" and "as available" basis. Availability is
        not guaranteed and may be affected by planned maintenance, infrastructure
        changes, network conditions, security operations and unforeseen events. No
        service-level commitment is provided. Continued availability of any specific
        page, feature or workflow may be modified or withdrawn at any time without
        notice.
      </p>

      <h2>14. Trademarks and Branding</h2>
      <p>
        Any names, logos, trademarks or trade dress that may resemble those of real
        institutions are used strictly within an educational, non-commercial context to
        illustrate familiar user-interface patterns. No endorsement, sponsorship,
        affiliation or partnership with any real institution is implied. Rights in any
        third-party trademarks remain with their respective owners.
      </p>

      <h2>15. Acknowledgement</h2>
      <p>
        By continuing to use this portal you acknowledge that you understand its
        non-banking, non-commercial, educational nature and accept this Disclaimer in
        full. If you do not accept this Disclaimer you must discontinue use of the
        portal immediately.
      </p>

      <p className="text-xs text-muted-foreground border-t pt-4 mt-6">
        This website is a demonstration and educational project only. It is not a bank,
        does not provide banking services, and has no affiliation with any actual
        banking institution.
      </p>
    </LegalPage>
  );
}