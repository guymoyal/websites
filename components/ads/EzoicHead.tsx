import React from 'react';
import { isEzoicActive } from '@/lib/ezoic';

const cfInline = { 'data-cfasync': 'false' as const };

/**
 * Step 1: header scripts — privacy CMP first, then sa.min + cmd queue + analytics.
 * https://docs.ezoic.com/docs/ezoicads/integration/
 */
export default function EzoicHead() {
  if (!isEzoicActive()) return null;

  return (
    <>
      <script {...cfInline} src="https://cmp.gatekeeperconsent.com/min.js" />
      <script {...cfInline} src="https://the.gatekeeperconsent.com/cmp.min.js" />
      <script async src="https://www.ezojs.com/ezoic/sa.min.js" />
      <script
        dangerouslySetInnerHTML={{
          __html:
            'window.ezstandalone=window.ezstandalone||{};ezstandalone.cmd=ezstandalone.cmd||[];',
        }}
      />
      <script src="https://ezoicanalytics.com/analytics.js" />
    </>
  );
}
