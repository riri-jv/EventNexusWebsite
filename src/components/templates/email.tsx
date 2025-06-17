import * as React from "react";

interface SponsorSuccessEmailTemplateProps {
  sponsorName: string;
}

export const SponsorSucessEmailTemplate: React.FC<
  Readonly<SponsorSuccessEmailTemplateProps>
> = ({ sponsorName }) => (
  <div>
    <h1>{sponsorName} has sponsored your event!</h1>
  </div>
);
